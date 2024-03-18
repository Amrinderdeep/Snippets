const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pfp: {
        type: String
    },
    bioText: String,
    followers: [String],
    following: [String],
    requests: [String],
})

module.exports = mongoose.model("Users", userSchema)