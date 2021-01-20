const router = require("express").Router();
const pool = require("../src/db");

router.post("/", async (req, res) => {
  try {
      const {userID, contentID} = req.body;
      const client = await pool.connect();
      try {
        await client.query(
          "INSERT INTO bookmarks(user_id, content_id) VALUES ($1, $2) ", [userID, contentID]
        );
        res.json("Content bookmarked");
        client.release();
      } catch (e) {
        client.release();
        console.error(e.message);
        res.status(500).json("Server error");
      }
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
