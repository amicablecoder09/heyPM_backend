const jwt = require("jsonwebtoken");
require('dotenv').config(); // this will allow us to access all our environment variable


function jwtGenerator(user_id) {
    const payload = {
      user: {
        id: user_id
      }
    };

    return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1h" });
}

module.exports = jwtGenerator;
