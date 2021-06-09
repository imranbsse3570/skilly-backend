const fs = require("fs");

const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");

module.exports = async (pathOfTemplate, templateData) => {
  const htmlFile = await fs.promises.readFile(path.resolve(pathOfTemplate), {
    encoding: "utf-8",
  });

  const template = handlebars.compile(htmlFile);

  const html = template(templateData);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({
    format: "a4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
  });

  await browser.close();
  return pdf;
};
