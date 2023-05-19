require("dotenv").config();
const express = require("express");
const {
  connectToMongoDB,
  discordBotGetJobs,
} = require("./initialization/initialization.js");
const bot = require("./utils/discord.bot.intents.js");
const { createJobs, updateJobs } = require("./parser/jobs.parser.js");
const { updateJobsData } = require("./utils/cron.service.js");

const app = express();
const PORT = process.env.PORT || 5500;

app.get("/", (req, res) => {
  res.send("Hello");
});

// endpoint for testing create job function
app.get("/parser", async (req, res) => {
  const sites = [
    "https://dedicatedfashion.nl/pages/vacatures2-0",
    "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a",
  ];

  await sites.forEach(async (siteName) => {
    await createJobs(siteName);
  });
  res.send("Jobs added");
});

// endpoint for testing update job function
app.get("/updateJobs", async (req, res) => {
  const sites = [
    "https://dedicatedfashion.nl/pages/vacatures2-0",
    "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a",
  ];

  await sites.forEach(async (siteName) => {
    await updateJobs(siteName);
  });

  res.send("Updated");
});

const start = async () => {
  // initialization to Mongo Data Base
  await connectToMongoDB();

  // update Jobs Data
  await updateJobsData();
};

start();

// initialization discord bot
discordBotGetJobs(bot);

// start api on our port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
