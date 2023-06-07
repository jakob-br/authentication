require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
//const md5 = require('md5');
const bcrypt = require('bcrypt');

const saltrounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

async function connectDB(){
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}
connectDB().catch(error => console.log(error));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    
        bcrypt.hash(req.body.password, saltrounds, async (error, hash) => {
            
            if(!error){
                try {
                    await User.create({
                        email: req.body.username,
                        password: hash
                    });
                    res.render("secrets");
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log(error);
            }
        }); 
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        await User.findOne({email: username}).then((foundUser) => {
            if(foundUser){
                 bcrypt.compare(password, foundUser.password, (error, result) => {
                    if(result === true){
                        res.render("secrets");
                    } else {
                        res.send("Somethings wrong!");
                        console.log(error);
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
