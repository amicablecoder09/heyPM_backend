const router = require("express").Router();
const pool = require("../src/db");

router.get("/", async (req, res) => {
  try {
      const {userID} = req.body;
      const client = await pool.connect();
      try {
        const bookmarkData = await client.query(
          "SELECT * FROM content WHERE content_id IN (SELECT content_id FROM bookmarks WHERE user_id = $1) ", [userID]
        );
        res.json(bookmarkData.rows);
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
