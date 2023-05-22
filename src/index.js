require("dotenv").config();
const express = require("express");
const {
  initialDB,
  discordBotGetJobs,
} = require("./initialization/initialization.js");
const bot = require("./utils/discord.bot.intents.js");
const { createJobs, updateJobs } = require("./parser/jobs.parser.js");
const { updateJobsData } = require("./utils/cron.service.js");
const sites = require("./utils/sites.for.parse.js");

const app = express();
const PORT = process.env.PORT || 5500;

app.get("/", (req, res) => {
  res.send("Hello");
});

// endpoint for testing create job function
app.get("/createJobs", async (req, res) => {
  await sites.forEach(async (siteName) => {
    await createJobs(siteName);
  });
  res.send("Jobs added");
});

// endpoint for testing update job function
app.get("/updateJobs", async (req, res) => {
  await sites.forEach(async (siteName) => {
    await updateJobs(siteName);
  });

  res.send("Jobs updated");
});

// function for starting app
const start = async () => {
  // initialization to Mongo Data Base
  await initialDB();

  // update Jobs Data
  await updateJobsData();

  // initialization discord bot
  await discordBotGetJobs(bot);
};

start();

// start api on our port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
