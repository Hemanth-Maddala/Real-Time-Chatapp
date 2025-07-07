const mongoose = require("mongoose")
const { Schema } = mongoose

const MessageSchema = new Schema({
       senderId : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
       },
       receiverId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
       },
       text: {
        type : String
       },
       image: {
        type : String
       },
       seen: {
        type: Boolean,
        default : false
       }
}, { timestamps: true })

module.exports = mongoose.model("Message",MessageSchema)

