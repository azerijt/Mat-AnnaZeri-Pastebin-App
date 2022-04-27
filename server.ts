import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const baseUrl = process.env.NODE_ENV === "production"
	? process.env.DATABASE_URL
	: "localhost:4000"

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

let getSummaryText = "select title,split_part(paste_text, E'\n', 1) as summary from categories order by table_id desc limit 10"
//let insertText = "input into categories(title, paste_text) values (req)"

app.get("/", async (req, res) => {
  const dbres = await client.query(getSummaryText);
  res.json(dbres.rows);
});

// app.post("/pastes", async (req, res) => {
//   const dbadd = await client.query(insertText);
//   res.json(dbadd.rows);
// });

app.post("/pastes", async(req, res) => {

    try {
      const {title, paste_text} = req.body
      const addPaste = await client.query(
        'INSERT INTO categories (title, paste_text) VALUES ($1, $2) returning *' , [title, paste_text]);
      res.json(addPaste.rows)
    } catch (error) {
      console.error(error.stack);
    } 
  });



//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
