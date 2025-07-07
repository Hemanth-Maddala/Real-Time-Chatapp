const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/chat-app`).then(()=>{
            console.log("connected to mongodb");
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB
