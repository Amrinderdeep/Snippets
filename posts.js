const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption: String,
    image: String, 
    user: String,
    likes: [String],
    comments: [String]
})

module.exports = mongoose.model("Posts", postSchema)