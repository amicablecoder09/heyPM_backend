const express = require("express");
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

const port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log(`Server up and running on port ${port} !`)
});
