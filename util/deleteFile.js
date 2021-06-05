const fs = require("fs");

const path = require("path");

const AppError = require(path.resolve("util/appError"));

module.exports = async (pathOfFile) => {
  await fs.unlink(path.resolve(pathOfFile), (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });
};
