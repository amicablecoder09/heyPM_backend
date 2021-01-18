const express = require("express");
const cors = require('cors');
const pool = require("./src/db");
const app = express();

app.use(express.json()); // this will help to do req.body
app.use(cors());

//routes

// register and login routes
app.use("/auth", require("./routes/jwtAuth"))

// dashboard route
app.use("/dashboard",require("./routes/dashboard"));

app.put('/getcontentdata', async (req, res) => {
  try {
    let client = await pool.connect();
    //await client.query(
      //`SELECT FROM CONTENT ()`
    //);
  } catch (e) {
    return res.status(500).send({ errorMessage: "Internal Server Error " + e.message });
  }
  res.send('Hello World!');
});

const port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log(`Server up and running on port ${port} !`)
});
