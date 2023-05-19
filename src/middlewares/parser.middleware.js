const puppeteer = require("puppeteer");
const Job = require("../models/Job.js");

module.exports = jobParserMiddleware = async (siteName) => {
  const browser = await puppeteer.launch({ headless: "true" });
  const page = await browser.newPage();
  let arrayJobs;

  if (siteName === "https://dedicatedfashion.nl/pages/vacatures2-0") {
    await page.goto(siteName, { timeout: 0 });
    const jobHandles = await page.$$(".page-width.feature-row-wrapper");

    const jobsArray = jobHandles.map(async (jobHandle) => {
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
            (title) => title.querySelector(".h1.appear-delay-1").textContent,
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

      return job;
    });

    arrayJobs = await Promise.all(jobsArray);
  }

  if (
    siteName ===
    "https://www.cadmes.com/nl/werken_bij_vacatures?hsCtaTracking=c67f8e5c-bab6-4261-b408-0a9ba5018b71%7Cb1cbb2e5-53ed-40ff-bb97-f5fa8d402a9a"
  ) {
    await page.goto(siteName, { timeout: 0 });
    const jobHandles = await page.$$(".homerun-widget__list-item");

    const jobsArray = jobHandles.map(async (jobHandle) => {
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
            url.querySelector("a.homerun-widget__vacancy").getAttribute("href"),
          jobHandle
        ),
        page.evaluate(
          (type) =>
            type.querySelector(".homerun-widget__vacancy__type").textContent,
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

      return job;
    });
    arrayJobs = await Promise.all(jobsArray);
  }

  await browser.close();
  return arrayJobs;
};
