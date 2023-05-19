const Job = require("../models/Job.js");
const mongoose = require("mongoose");

class Initialization {
  async connectToMongoDB() {
    await mongoose
      .connect(process.env.MONGO_URL, { useNewUrlParser: true })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => console.log(err));
  }

  async discordBotGetJobs(bot) {
    const prefix = "/";

    bot.on("ready", () => {
      console.log(`Logged in as ${bot.user.tag}`);
    });

    bot.on("messageCreate", async (message) => {
      if (message.author.bot || !message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(" ");
      console.log("ARGS : ", args);
      const command = args.shift();
      console.log("COMMAND : ", command);

      if (command === "getData") {
        const siteName = args[0];

        if (!siteName) {
          message.channel.send("Please provide a site name.");
          return;
        }

        const data = await Job.find({ siteName });

        message.channel.send(
          data
            ? `Data for ${siteName}: ${JSON.stringify(data)}`
            : `No data found for ${siteName}.`
        );
      }
    });

    bot.login(process.env.DISCORD_TOKEN);
  }
}

module.exports = new Initialization();
