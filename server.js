const dotenv = require("dotenv");
const mongoose = require("mongoose");

// dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE.replace(
  "<username>",
  process.env.DATABASE_USERNAME
).replace("<password>", process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to database");
  });

const app = require("./app");

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
