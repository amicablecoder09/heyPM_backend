const router = require("express").Router();
const pool = require("../src/db");

router.post("/", async (req, res) => {
  try {
      const {userID, contentID} = req.body;
      const client = await pool.connect();
      try {
        await client.query(
          "DELETE FROM bookmarks WHERE user_id=$1 AND content_id=$2; ", [userID, contentID]
        );
        res.json("Bookmark Removed");
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
