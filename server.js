const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE;

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
