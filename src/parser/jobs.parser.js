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

      if (!jobFromBD.length) {
        console.log(`job with refId "${refId}" present in Data Base`);
        return;
      }

      return job.save();
    });
    return;
  }

  async updateJobs(siteName) {
    const arrayOfJobs = await jobParserMiddleware(siteName);

    await arrayOfJobs.forEach(async (job) => {
      const {
        _id,
        _doc: { _id: docId, refId, createdAt, ...updateData },
      } = job;

      await Job.findOneAndUpdate({ refId }, updateData);
      return;
    });
    return;
  }
}

module.exports = new JobParser();
