const express = require ('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');


app.use(express.json())
app.use(cors())
dotenv.config()

const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
port: process.env.PORT,


})

      //

db.connect((err) => {
    if(err) return console.log(" error connecting to the database ")

        console.log("connected to the database as id: ", db.threadId);


        //creating the database


        db.query('CREATE DATABASE IF NOT EXISTS expense_tracker',(err, result)=>{
            if (err) return console.log(err)

                console.log("database expense_tracker checked")


            //select our database
            db.changeUser({database: 'expense_tracker' }, (err) =>  {

                 if(err) return console.log(err)

                console.log("changed to expense_tracker")


                    // create the users tables

                const usersTable = `

                CREATE TABLE IF NOT EXISTS  users(
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR (108) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL
            
            )`;
        
        
            db.query(usersTable, (err, result) =>  {
            
                if (err) return console.log(err)
        
                console.log("users table created")
                })
            })
         })
    })



         //user registration route

app.post('/api/register', async(req, res)=> {

    try{
        const users = `SELECT * FROM users WHERE email = ?`


        //check if user exists

        db.query(users, [req.body.email], (err, data)=> {

            if (data.length) return res.status(409).json("user already exists");


            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)



            const createUser=`INSERT INTO users (email, username, password) VALUES(?)`
            value=[
                req.body.email,
                req.body.username,
                hashedPassword
            ]


             //insert user in the database
             db.query(createUser,[value], (err, data)=>{

                if (err)res.status(500).json("something went wrong")
    
                return res.status(200).json("user created sucessfully");
     })
  })
}
    catch (err){
        res.status(500).json("internal server error")
    }
})


        //user login route

        app.post('/api/login', async(req, res)=> {

            try{
                const users = `SELECT * FROM users WHERE email = ?`


                db.query(users, [req.body.email], (err, data)=> {

                    if (data.length ===0) return res.status(409).json("User is not found");


                    //check if password is valid

                    const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)


                    if(!isPasswordValid) return res.status(400).json("Invalid email or Password")


                        return res.status(200).json("login sucessfull")
                })
            }
                catch(err){
                    res.status(500).json("internal server error")
                }
            })



app.listen(3000, () => {
console.log("server is running on port 3000")
})