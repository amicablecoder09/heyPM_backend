const router = require("express").Router()
const pool = require("../src/db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorization = require("../middleware/authorization");
const {OAuth2Client} = require("google-auth-library");
const { response } = require("express");
const { googleAudience } = require("../config");

const client = new OAuth2Client(googleAudience);

// registering
router.post("/register", validInfo, async(req, res) =>{
    try {
        // 1. destructure the req.body(name, email, password)
        const {name, email, password} = req.body;
        const client = await pool.connect();

        try {
          // 2. check if user exist (if user exist then throw)
          const user = await client.query("SELECT * FROM users WHERE user_email = $1", [
              email
          ]);

          if(user.rows.length !== 0){
            client.release();
            return res.status(401).json("User already exist");
              // 401 is unauthenticated | 403 unautherized
          }
          //res.json(user.rows) -> display the complete row of that user

          // 3. Bcrypt the user password
          const saltRound = 10;
          const salt = await bcrypt.genSalt(saltRound);

          const bcryptPassword = await bcrypt.hash(password,salt);

          try {
            // 4. enter the new user inside our database
            const newUser = await client.query("INSERT INTO users(user_name,user_email, user_password) VALUES ($1,$2,$3) RETURNING * ", [name,email,bcryptPassword]
            );
            //res.json(newUser.rows[0]);

            // 5. generating out jwt token
            const token = jwtGenerator(newUser.rows[0].user_id);
            res.json({token});
            client.release();
          } catch (e) {
            client.release();
            console.error(e.message);
            res.status(500).send("Server Error");
          }

        } catch (e) {
          client.release();
          console.error(e.message);
          res.status(500).send("Server Error");
        }

    } catch (err) {
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
        const client = await pool.connect();

        try {
          const user = await client.query("SELECT * FROM users WHERE user_email=$1", [
              email
          ]);
          if (user.rows.length ===0){
            client.release();
            return res.status(401).json("Password or Email is incorrect");
          }
          // 3. check if incomming password is the same the database password
          const validPassword = await bcrypt.compare(password,user.rows[0].user_password);

          if(!validPassword){
            client.release();
            return res.status(401).json("Password or Email is incorrect");
          }

          // 4. give them the jwt token
          const token = jwtGenerator(user.rows[0].user_id);
          client.release();
          res.json({ token });
        } catch (e) {
          client.release();
          console.error(e.message);
          res.status(500).send("Server Error");
        }

    } catch (err) {
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

// for google login
router.post("/googlelogin", async(req,res)=>{
  const {tokenId} = req.body;

  

  const response = await client.verifyIdToken({idToken: tokenId, audience: googleAudience });

  const {email_verified, name, email} = response.payload;

    if(email_verified){
      
      try {
        const cclient = await pool.connect();

        try {
          const user = await cclient.query("SELECT * FROM users WHERE user_email=$1", [
            email
          ]);
          if (user.rows.length ===0){ // ==0 means new user. else account created
              //  register
              const saltRound = 10;
              const salt = await bcrypt.genSalt(saltRound);
              const password = email+"23bsdbajsb";
              const bcryptPassword = await bcrypt.hash(password,salt);
              
              try {
                  const newUser =  await cclient.query("INSERT INTO users(user_name,user_email, user_password) VALUES ($1,$2,$3) RETURNING * ", [name,email,bcryptPassword]
                  );
                  const token = jwtGenerator(newUser.rows[0].user_id);

                  cclient.release();
                  res.json({token});
              } 
              catch (e) {
                  console.error(e.message);
                  cclient.release();
                  res.status(500).send("Server Error");
              }    
          }
          else{
            // login              
            const token = jwtGenerator(user.rows[0].user_id);
            cclient.release();
            res.json({ token });              
          }
        } 
        catch (err) {
          cclient.release();
          console.log(err.message)
          res.status(500).send("Server Error");
        }
      }
      catch (e) {
        console.error(e.message);
        res.status(500).send("Server Error");
      }
    }
    else{
      // Email not verified
    }

});

module.exports = router;
