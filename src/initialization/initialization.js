const Job = require("../models/Job.js");
const mongoose = require("mongoose");
const jobParserMiddleware = require("../middlewares/parser.middleware.js");
const sites = require("../utils/sites.for.parse.js");

class Initialization {
  // function for connection Mongo Data Base
  async initialDB() {
    await mongoose
      .connect(process.env.MONGO_URL, { useNewUrlParser: true })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.log(err));

    // handling availability data in data base
    const availableDataAudBD = await Job.find();

    if (availableDataAudBD.length === 0) {
      // validate jobs
      const validJobs = await Promise.all(
        sites.map(async (siteName) => {
          const jobs = await jobParserMiddleware(siteName);
          return jobs.filter((job) => job.title && job.refId && job.siteName);
        })
      );

      // seed data into data base
      await Job.insertMany(validJobs.flat());
    }
  }

  // function for initialization discord bot and commands for bot
  async discordBotGetJobs(bot) {
    const prefix = process.env.DISCORD_PREFIX;

    // send into log info about bot name and it's means bot ready
    bot.on("ready", () => {
      console.log(`Logged in as ${bot.user.tag}`);
    });

    // get data by command
    bot.on("messageCreate", async (message) => {
      if (message.author.bot || !message.content.startsWith(prefix)) return;

      // you need send to discord bot message
      const args = message.content.slice(prefix.length).trim().split(" ");

      // get array of commands
      const command = args.shift();

      let data;

      const siteName = args[0];

      // get data using message format [prefix]getData ...
      if (command === "getData") {
        // handling when site name not provided
        if (!siteName) {
          message.channel.send("Please provide a site name.");
          return;
        }

        data = await Job.find({ siteName });
      }

      // get data using message format - '[prefix]getData example.com 2023-05-01 2023-05-31 "Assistent Bedrijfsleider" 1'
      if (command === "getFilteredData") {
        // get arguments from request message
        const startDate = args[1];
        const endDate = args[2];
        const title = args
          .slice(3, args.length - 1)
          .join(" ")
          .match(/^"(.+)"$/)[1];
        const page = parseInt(args[args.length - 1]);
        const minimalPage = 1;

        // handling input data
        if (!siteName || !startDate || !endDate || !title || isNaN(page)) {
          message.channel.send(
            "Please provide site name, start date, end date, title, and page number."
          );
          return;
        }

        // set page step
        const limit = 10; // Number of jobs per page
        const skip = (page - 1) * limit;

        // set the date range for the query
        const query = {
          siteName,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          title,
        };

        // using query and pagination
        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        // handling when the requested page number is too high
        if (page > totalPages) {
          message.channel.send(
            `Invalid page number. Total pages available: ${totalPages}`
          );
          return;
        }

        // handling when the requested page number is less than 1
        if (page < minimalPage) {
          message.channel.send(`Minimal page number is ${minimalPage}`);
          return;
        }

        // get data from the database
        data = await Job.find(query).skip(skip).limit(limit);

        // handling when the query returns 0 results
        if (data.length === 0) {
          message.channel.send(
            `No data found for ${siteName}, start date: ${startDate}, end date: ${endDate}, title: ${title}, and page: ${page}.`
          );
          return;
        }

        // data.forEach((job) => {
        //   const {
        //     _id,
        //     _doc: { _id: docId, __v, ...otherData },
        //   } = job;
        //   console.log("otherData : ", otherData);

        //   message.channel.send(JSON.stringify(otherData));
        // });
      }

      // generate answer
      data.forEach((job) => {
        message.channel.send(job ? `${job}` : `No data found for ${siteName}.`);
      });
    });

    bot.login(process.env.DISCORD_TOKEN);
  }
}

module.exports = new Initialization();
