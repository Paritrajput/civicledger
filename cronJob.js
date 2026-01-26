const cron = require("node-cron");
const axios = require("axios");

cron.schedule("*/5 * * * *", async () => { //every 5 min
  console.log(" Running bid evaluation...");

  try {
    await axios.post("http://localhost:3000/api/bid-evaluate");
    console.log("Bid evaluation done");
  } catch (err) {
    console.error(" Bid evaluation failed", err.message);
  }
});
cron.schedule("*/10 * * * *", async () => {
  console.log(" Checking public voting windows...");
  try {
    await axios.post("http://localhost:3000/api/contract-voting/public-voting-close");
    console.log("Public voting check done");
  } catch (err) {
    console.error(" Public voting check failed:", err.message);
  }
});