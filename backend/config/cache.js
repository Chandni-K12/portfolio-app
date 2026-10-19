const NodeCache = require("node-cache");

// Initialize NodeCache with 60 seconds TTL (Time To Live)
const taskCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

console.log("In-Memory Cache (node-cache) initialized with 60s TTL");

module.exports = taskCache;
