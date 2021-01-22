const router = require("express").Router();
const pool = require("../src/db");

router.post("/", async (req, res) => {
  try {
      const {userid} = req.body;
      const client = await pool.connect();
      try {
        const bookmarkID = await client.query(
          "SELECT content_id FROM bookmarks WHERE user_id = $1", [userid]
        );
        res.json(bookmarkID.rows);
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
