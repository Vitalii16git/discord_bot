const Job = require("../models/Job.js");
const jobParserMiddleware = require("../middlewares/parser.middleware.js");

class JobParser {
  async createJobs(siteName) {
    const arrayOfJobs = await jobParserMiddleware(siteName);

    await arrayOfJobs.forEach(async (job) => {
      const { refId } = job;
      const jobFromBD = await Job.find({
        refId,
      });

      return !jobFromBD.length
        ? await job.save()
        : console.log(`job with refId "${refId}" present in Data Base`);
    });
  }
  async updateJobs(siteName) {
    const arrayOfJobs = await jobParserMiddleware(siteName);

    await arrayOfJobs.forEach(async (job) => {
      const {
        _id,
        _doc: { _id: docId, refId, ...updateData },
      } = job;

      await Job.findOneAndUpdate({ refId }, updateData, {
        new: true,
      });
    });
  }
}

module.exports = new JobParser();
