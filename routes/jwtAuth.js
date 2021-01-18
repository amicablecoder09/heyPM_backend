const router = require("express").Router()
const pool = require("../src/db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorization = require("../middleware/authorization");


// registering
router.post("/register", validInfo, async(req, res) =>{
    try {
        // 1. destructure the req.body(name, email, password)
        const {name, email, password} = req.body;

        // 2. check if user exist (if user exist then throw)
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
            email
        ]);

        if(user.rows.length !== 0){
            return res.status(401).json("User already exist");
            // 401 is unauthenticated | 403 unautherized
        }
        //res.json(user.rows) -> display the complete row of that user

        // 3. Bcrypt the user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password,salt);

        // 4. enter the new user inside our database
        let client = await pool.connect();
        const newUser = await client.query("INSERT INTO users(user_name,user_email, user_password) VALUES ($1,$2,$3) RETURNING * ", [name,email,bcryptPassword]
        );
        //res.json(newUser.rows[0]);

        // 5. generating out jwt token
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json({token});
        client.release();

    } catch (err) {
      client.release();
      console.error(err.message);
      res.status(500).send("Server Error");
    }
});

// login route
router.post("/login", validInfo, async(req,res)=>{
    try {
        // 1. destructure the req.body
        const {email,password} = req.body;

        // 2. check if user doesn't exist (if not then we throw error)
        let client = await pool.connect();
        const user = await client.query("SELECT * FROM users WHERE user_email=$1", [
            email
        ]);
        if (user.rows.length ===0){
            return res.status(401).json("Password or Email is incorrect");
        }
        // 3. check if incomming password is the same the database password
        const validPassword = await bcrypt.compare(password,user.rows[0].user_password);

        if(!validPassword){
            return res.status(401).json("Password or Email is incorrect");
        }

        // 4. give them the jwt token
        const token = jwtGenerator(user.rows[0].user_id);

        res.json({ token });
        client.release();
    } catch (err) {
        client.release();
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/is-verify", authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


module.exports = router;
