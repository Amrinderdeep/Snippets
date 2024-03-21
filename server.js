const express = require("express")
const session = require("express-session")
const app = express()
const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/social")
const Users = require('./users')
const Posts = require('./posts')
const Notifications = require('./notifications')
const multer = require('multer')
const bcrypt = require('bcrypt')

const path = require('path')
const { json } = require("body-parser")
app.use(express.static(path.join(__dirname, 'public')));

/* const bodyParser = require('body-parser');

/ Increase the limit to allow larger payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
*/


app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get("/" , (req,res)=>{
    res.render("index")
})

app.route('/login')
.get((req,res) =>{
    res.render("login")
})
.post(async (req,res) =>{
    let data = req.body
    let user = await Users.findOne({username: data.username})
    
    if(user){
        bcrypt.compare(data.password, user.password, (err, result) => {
            if (err) {
              console.error('Error comparing passwords:', err);
            } else if (result) {
                req.session.user = {
                    username: user.username
                }
                res.status(200).json({ message: 'Login Successful' });
            } else {
               
                res.status(401).json({ message: 'Incorrect username or password' });
                
            }
        });
    }
    else{
        console.log("User Doesnt exist")
        res.status(401).json({message: "User doesnt exist"})
    }
})

app.route("/register")
.get((req,res) => {    
    res.render("register")

})
.post(async (req,res) =>{
    let data = req.body
    if(data.password != data.confirm){
        console.log(data.password)
        console.log(data.confirm)
        return res.status(401).json({message: "Password and confirmation doesnt match"})
    }
    const check = await Users.findOne({username: req.body.username})
    if(check){
        console.log("user exists")
        return res.status(401).json({message: "User already exists"})
    }
    else{
        try{
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                if (err) {
                    console.log('Error hashing password:', err);
                    return res.status(500).json({ message: "Error hashing password" });
                }
                try {
                    const user = await Users.create({ username: req.body.username, password: hash , pfp: "/uploads/default.jpg"});
                    console.log("Registered");
                    return res.status(200).json({ message: "User Registered Successfully" });
                } catch (e) {
                    console.log('Error creating user:', e);
                    return res.status(500).json({ message: "Error creating user" });
                }
            });
        }
        catch(e){
            res.status(401).json({message: "Error"})
            console.log(e.message)
        }
        
    }
    
})

app.route('/notify')
.get(async (req,res) => {
    if(req.session.user){
        let notifications = await Notifications.find({receiver: req.session.user.username}).lean()
        res.render("notifications", {notifications})
    }
    else{
        res.redirect('/')
    }
})


app.route('/newPost')
.get((req,res) =>{
    if(req.session.user){
        res.render("post")
    }
    else{
        res.redirect('/')
    }
    
})
.post(upload.single('image') , async (req,res) => {
    console.log("Route Reached")

    const imagePath = '/uploads/' + req.file.filename;
    const post = await Posts.create({caption: req.body.caption, image:imagePath ,user: req.session.user.username })
    console.log("Post Created")
    res.json({message: "Post Created"})
})


  
  

app.route('/feed')
.get(async (req, res)=>{
    if(req.session.user){
        let x = await Users.findOne({username: req.session.user.username})
        let posts = await Posts.find({user: {$in: x.following}}).lean()
        let users = await Users.find({username: {$in: x.following}}).lean()
        res.render("feed", { posts , users})
    }
    else{
        res.redirect('/')
    }
})
.post(async(req,res)=>{
    let user = req.session.user.username
    let post = await Posts.findOne({ image: req.body.image })
    let contentText = req.body.content
    let currentDate = new Date();
    
    if(post.likes.includes(user)){
        let idx = post.likes.indexOf(user)
        post.likes.splice(idx,1)
        await post.save()
    }
    else{
        let notifications = await Notifications.create({content: contentText, sender: req.session.user.username, receiver: req.body.user, date: currentDate})
        post.likes.push(user)
        await post.save()
    }
    res.status(200).json({message: "Like updated", likes: post.likes.length})
})

app.route('/comment')
.post(async (req,res) =>{
    if(req.body.content == ""){
        return res.status(401).json({message: "Comment is null"})
    }
    let notificationContent = "commented on your post"
    let currentDate = new Date();

    let notifications = await Notifications.create({content: notificationContent, sender: req.session.user.username, receiver: req.body.user, date: currentDate})
    let post = await Posts.findOne({ image: req.body.image })
    let commentText = req.session.user.username + ": " + req.body.content
    post.comments.push(commentText)
    await post.save()
    res.status(200).json({message: "Comments updated"})
})

app.route('/profile')
.get(async (req,res) =>{

    if(req.session.user){
        let user = await Users.findOne({ username: req.session.user.username })
        let posts = await Posts.find({ user: req.session.user.username })
        let current = req.session.user.username
        res.render('profile' , {user, posts, current})
    }
    else{
        res.redirect('/')
    }
})
.post(async (req,res) =>{
    let user = await Users.findOne({ username: req.body.username })
    let posts = await Posts.find({ user: req.body.username })
    res.render('profile' , {user, posts})
})

app.route('/pfp')
.post(upload.single('image') , async (req,res) => {
    let user = req.session.user.username
    const imagePath = '/uploads/' + req.file.filename;
    await Users.updateOne({username: user}, {$set: {pfp: imagePath}})
    res.json({message: "Pfp changed"})
})

app.route('/profile/:id')
.get(async (req,res) => {
    if (req.session.user && req.params.id){
        let user = await Users.findOne({ username: req.params.id })
        let posts = await Posts.find({ user: req.params.id })
        let current = req.session.user.username
        res.render('profile', {user, posts, current})
    }
    else{
        res.redirect('/')
    }
})

app.route('/follow')
.post(async (req, res) =>{
    console.log("Follow request Reached")
    let follower = req.session.user.username
    
    let account = await Users.findOne({username: req.body.username})
    let followerAccount = await Users.findOne({username: follower})
    if(follower !== account.username){
        console.log(`${follower} wants to follow ${account.username}`)
        if(account.followers.includes(follower)){
            let idx = account.followers.indexOf(follower)
            account.followers.splice(idx,1)
            let idx2 = followerAccount.following.indexOf(account.username)
            followerAccount.following.splice(idx2,1)
        }
        else{
            let currentDate = new Date();
            let notifications = await Notifications.create({content: req.body.content, sender: req.session.user.username, receiver: req.body.username, date: currentDate})    
            account.followers.push(follower)
            followerAccount.following.push(account.username)   
        }
             
        await account.save()
        await followerAccount.save()
    }
    res.json({message: "Follow updated"})
})

app.route('/search')
.post(async (req,res) =>{
    let searchID = req.body.search
    let regexPattern =  new RegExp("^" + searchID, "i");
    let users = await Users.find({username: {$regex: regexPattern}})

    res.json(users)
})


app.route('/logout')
.post(async (req,res) => {
    console.log("logout")
    req.session.destroy(()=>{
        res.status(200).json({message: "Logout"})
    });
})


app.get('*', (req, res) => {
    res.redirect('/');
});
app.listen(3000)