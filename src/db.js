const { Pool } = require("pg");
const { dbUser, dbHost, database, dbHmac, dbPort, dbURI } = require("../config");

const dbConfig = {
  user: dbUser,
  host: dbHost,
  database,
  password: dbHmac,
  port: dbPort,
  max: 10,
  ssl: { rejectUnauthorized: false }
};

var pool = new Pool(dbConfig);
module.exports = pool;
