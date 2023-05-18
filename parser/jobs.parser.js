const puppeteer = require("puppeteer");
const Job = require("../models/Job.js");

class JobParser {
  async parseJobsFromWebsite(siteName) {
    try {
      const browser = await puppeteer.launch({ headless: "true" });
      const page = await browser.newPage();

      if (siteName === "https://dedicatedfashion.nl/pages/vacatures2-0") {
        console.log(siteName);
        await page.goto(siteName, { timeout: 0 });
        const jobHandles = await page.$$(".page-width.feature-row-wrapper");

        for (const jobHandle of jobHandles) {
          const [refId, title, description = null, url, type = null] =
            await Promise.all([
              page.evaluate(
                (refId) =>
                  refId
                    .querySelector("a.btn")
                    .getAttribute("href")
                    .replace(/.*\//g, ""),
                jobHandle
              ),
              page.evaluate(
                (title) =>
                  title.querySelector(".h1.appear-delay-1").textContent,
                jobHandle
              ),
              page.evaluate(
                (description) =>
                  description.querySelector(".rte.appear-delay-2").textContent,
                jobHandle
              ),
              page.evaluate(
                (url) => url.querySelector("a.btn").getAttribute("href"),
                jobHandle
              ),

              page.evaluate(
                (type) =>
                  type.querySelector(".subheading.appear-delay").textContent,
                jobHandle
              ),
            ]);

          const job = new Job({
            siteName,
            refId,
            title,
            description,
            url: url ? `https://dedicatedfashion.nl${url}` : null,
            type,
          });

          await job.save();
        }
      }

      if (
        siteName ===
        "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a"
      ) {
        console.log(siteName);
        await page.goto(siteName, { timeout: 0 });
        const jobHandles = await page.$$(".homerun-widget__list-item");
        console.log(jobHandles);

        for (const jobHandle of jobHandles) {
          const [refId, title, url, type = null] = await Promise.all([
            page.evaluate(
              (refId) =>
                refId
                  .querySelector("a.homerun-widget__vacancy")
                  .getAttribute("href")
                  .replace(/\/[^\/]*$/g, "")
                  .replace(/.+\//g, ""),
              jobHandle
            ),
            page.evaluate(
              (title) =>
                title.querySelector("h3.homerun-widget__vacancy__title")
                  .textContent,
              jobHandle
            ),
            page.evaluate(
              (url) =>
                url
                  .querySelector("a.homerun-widget__vacancy")
                  .getAttribute("href"),
              jobHandle
            ),
            page.evaluate(
              (type) =>
                type.querySelector(".homerun-widget__vacancy__type")
                  .textContent,
              jobHandle
            ),
          ]);

          const job = new Job({
            siteName,
            refId,
            title,
            url,
            type,
          });
          console.log(job);
          await job.save();
        }
      }

      await browser.close();
    } catch (error) {
      console.error(error);
    }

    // try {
    //   const data = await Job.updateOne(
    //     { siteName },
    //     { $set: { siteName, data } },
    //     { upsert: true }
    //   );
    // } catch (error) {
    //   console.error("Error storing data:", error);
    // }
  }
}

module.exports = new JobParser();
