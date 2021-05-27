const fs = require("fs");

const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");

module.exports = async (pathOfTemplate, templateData) => {
  path.resolve(pathOfTemplate);
  const htmlFile = fs.readFileSync("index.html", "utf-8");

  const template = handlebars.compile(htmlFile);

  const date = new Date(Date.now());

  const html = template({
    name: "Imran Munir",
    courseName: "Node.js Development Course",
    hours: 40.5,
    date: `${date.toLocaleString({
      year: "2-digit",
      month: "short",
      day: "2-digit",
    })}`,
    author: "Noman Abid",
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({
    format: "a4",
    path: "certi.pdf",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
  });

  await browser.close();
  return pdf;
};
