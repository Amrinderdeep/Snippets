const mongoose = require("mongoose")

const notifySchema = new mongoose.Schema({
    content: String,
    sender: String,
    receiver: String,
    date: Date
})

module.exports = mongoose.model("Notifications", notifySchema)