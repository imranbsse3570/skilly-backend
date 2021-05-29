const fetch = require("node-fetch");

const executeCode = async (language, script) => {
  var program = {
    script,
    language,
    versionIndex: "0",
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
  };

  const response = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    body: JSON.stringify(program),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  console.log(data);

  return data;
};

module.exports = executeCode;
