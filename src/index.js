require("dotenv").config();
const mongoose = require("mongoose");
const { Client, GatewayIntentBits } = require("discord.js");
const Job = require("../models/Job.js");
const { parseJobsFromWebsite } = require("../parser/jobs.parser.js");
const express = require("express");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const prefix = "/";
const app = express();
const PORT = process.env.PORT || 5500;

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// app.get("/parser", async (req, res) => {
//   const sites = [
//     "https://dedicatedfashion.nl/pages/vacatures2-0",
//     "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a",
//   ];

//   await sites.forEach(async (siteName) => {
//     await parseJobsFromWebsite(siteName);
//   });
//   res.send("Jobs added");
// });

const connectDb = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URL, { useNewUrlParser: true })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.log(err));
  } catch (error) {
    console.error("Error MongoDB", error);
  }
};

connectDb();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}`);
});

bot.on("message", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  console.log("ARGS : ", args);
  const command = args.shift().toLowerCase();
  console.log("COMMAND : ", command);

  if (command === "getData") {
    const siteName = args[0];
    if (!siteName) {
      message.channel.send("Please provide a site name.");
      return;
    }

    try {
      const data = await Job.find({
        where: siteName,
      });
      if (data) {
        message.channel.send(`Data for ${siteName}: ${JSON.stringify(data)}`);
      } else {
        message.channel.send(`No data found for ${siteName}.`);
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
      message.channel.send("An error occurred while retrieving data.");
    }
  }
});

setInterval(() => {
  const sites = [
    "https://dedicatedfashion.nl/pages/vacatures2-0",
    "https://www.sceptertech.digital/job-openings/",
  ];

  sites.forEach((siteName) => {
    parseJobsFromWebsite(siteName);
  });
}, 60 * 60 * 1000); // Fetch data every hour

bot.login(DISCORD_TOKEN);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
