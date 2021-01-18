const router = require("express").Router();
const authorization = require("../middleware/authorization");
const pool = require("../src/db");

router.get("/", authorization, async (req, res) => {
  try {
      // req.user.id has the payload
      // res.json(req.user);
      let client = await pool.connect();
      const user = await client.query(
        "SELECT user_name FROM users WHERE user_id = $1", [req.user.id]
      );
      res.json(user.rows[0]);
      client.release();
  }
  catch (err) {
    client.release();
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
