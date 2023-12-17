const mysql = require("mysql");
require('dotenv').config();

// console.log(process.env.HOST)

var con = mysql.createConnection({
  host:process.env.HOST,
  user:process.env.DBUSER,
  password: process.env.DBPASS,
  port: 25060,
  database:"dbproject",
  acquireTimeout: 20000,
  multipleStatements: true,
  connectionLimit: 100,
  charset: 'utf8mb4',
  debug: false
});
 
con.connect((err)=>{
  if(err) console.log(err);
  else console.log("successfully connected");
});
  
module.exports=con;