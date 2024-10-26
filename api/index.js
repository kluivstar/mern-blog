//SERVER CODE

const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
app.use(express.json())
app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(cookieParser())

// Hashing
const salt = bcrypt.genSaltSync(10);
const secret = 'gdf43drgredgwegw345werjktjwertkj';

// Connect Database
mongoose.connect('mongodb+srv://blog:nBw6xo4XmtRX8NRP@cluster0.wxx9pv4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

// RHF to defined user registration endpoint/route
app.post('/register', async(req, res) =>{
    const {username,password} = req.body;
    try{
    const userDoc = await User.create({username, password:bcrypt.hashSync(password,salt)})
    res.json(userDoc);
    } catch(err){
        res.status(400).json(err)
    }
});

// // RHF to defined user login endpoint/route
app.post('/login', async(req, res) => {
    const {username, password} = req.body
    const userDoc = await User.findOne({username})
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if (passOk){
        jwt.sign({username, id:userDoc._id}, secret, {}, (err,token) =>{
            if (err) throw err;
            res.cookie('token', token).json({
                id:userDoc._id,
                username
            })
        })
    } else {
        res.status(400).json('wrong credentials.')
    }


})

// RHF for user profile endpoint/route
app.get('/profile', async(req,res) => {
    const {token} = req.cookies
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info)
    })
});

// RHF for logout endpoint/route
app.post('/logout', (req, res) =>{
    res.cookie('token', '').json('Ok')
})


// Start Server
app.listen(4000, ()=>{
    console.log("Servers running...")
});