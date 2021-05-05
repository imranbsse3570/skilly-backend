const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const port = process.env.PORT || 5000;

const app = require("./app");

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
