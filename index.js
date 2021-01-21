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

// save bookmarked content
app.use("/bookmarkContent",require("./routes/savedContent"));

// get bookmarked content
app.use("/getbookmarkContent",require("./routes/getBookmarked"));

// get bookmarked content
app.use("/removebookmarkContent",require("./routes/removeBookmarked"));

const port = process.env.PORT;

app.listen(port, function () {
  console.log(`Server up and running on port ${port} !`)
});
