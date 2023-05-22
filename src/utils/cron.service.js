const cron = require("node-cron");
const { updateJobs } = require("../parser/jobs.parser.js");

class CronService {
  //   Fetch data every minute
  async updateJobsData() {
    cron.schedule("* * * * *", async () => {
      const sites = [
        "https://dedicatedfashion.nl/pages/vacatures2-0",
        "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a",
      ];
      await sites.forEach(async (siteName) => {
        await updateJobs(siteName);
        console.log(`for site ${siteName} data updated`);
      });
    });
  }
}

module.exports = new CronService();
