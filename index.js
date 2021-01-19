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

// get content routes
app.use("/getContent",require("./routes/dataContent"));

const port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log(`Server up and running on port ${port} !`)
});
