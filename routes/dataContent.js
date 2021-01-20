const router = require("express").Router();
const pool = require("../src/db");

router.get("/", async (req, res) => {
  try {
      const client = await pool.connect();
      try {
        const contentData = await client.query(
          "SELECT * FROM content WHERE content_date = CAST( NOW() AS DATE );"
        );
        res.json(contentData.rows);
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
