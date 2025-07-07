const User = require("../Schema/Userschema")
const MessageSchema = require("../Schema/Message")
const cloudinary = require("../connection/Cloudinary")
// const { io, userSocketMap } = require("../app")
const mongoose = require("mongoose");
const { getIO, userSocketMap } = require("../socket");


const userfriends = async (req, res) => {
    try {
        const userId = req.user._id
        if (!userId) {
            return res.status(400).json({ success: false, message: "user authentication required" })
        }
        const otherusers = await User.find({ _id: { $ne: userId } }).select("-password"); // filters the users whose id is not equals(ne) to the userId
        const unseenmessages = {}
        await Promise.all(
            otherusers.map(async (userfrnd) => {
                const message = await MessageSchema.find({ senderId: userfrnd._id, receiverId: userId, seen: false })
                if (message.length > 0) {
                    unseenmessages[userfrnd._id] = message.length
                }
            })
        )
        return res.json({ success: true, users: otherusers, unseenmessages })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

const getmessages = async (req, res) => {
    try {
        const myId = req.user._id
        const { id: selecteduser } = req.params  // /messages/:id
        const message = await MessageSchema.find({
            // to see in bith sides
            $or: [
                { senderId: myId, receiverId: selecteduser },  // from here we get the messages of the sender 
                { senderId: selecteduser, receiverId: myId }  // from here we get the messases of the receiver
            ]  // This ensures full conversation history between both users
        })
        await MessageSchema.updateMany({ senderId: selecteduser, receiverId: myId }, { seen: true })
        return res.json({ success: true, message })
    } catch (error) {
        return res.json({ success: false, message: error })
    }
}

const markmessageseen = async (req, res) => {
    try {
        const { id } = req.params
        await MessageSchema.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        return res.json({ success: false, message: error })
    }
}

// const sendmessage = async (req, res) => {
//     try {
//         const { text, image } = req.body
//         const receiverId = req.params.id
//         const senderId = req.user._id

//         console.log("Sender ID:", senderId);
//         console.log("Receiver ID:", receiverId);
//         console.log("Text:", text);


//         let imageUrl
//         if (image) {
//             const uploadingimagetext = await cloudinary.uploader.upload(image)
//             imageUrl = uploadingimagetext.secure_url;
//         }
//         const newmessage = await MessageSchema.create({
//             senderId,
//             receiverId,
//             text,
//             image: imageUrl
//         })

//         // emit the new message to the receivers socket
//         const receiversocketid = userSocketMap[receiverId]
//         if (receiversocketid) {
//             io.to(receiversocketid).emit("newmessage", newmessage)
//         }

//         res.status(200).json({ success: true, newmessage })
//     } catch (error) {
//         return res.json({ success: false, message: error.message })
//     }
// }

const sendmessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id.toString();
        const senderId = req.user._id.toString();

        console.log("📩 Received message from:", senderId);
        console.log("📨 Receiver ID:", receiverId);
        console.log("💬 Text:", text);
        console.log("🖼️ Image:", image ? "[image exists]" : "no image");

        if (!text.trim() && !image) {
            return res.status(400).json({ success: false, message: "Cannot send empty message" });
        }

        let imageUrl;
        if (image && image.trim() !== "") {
            try {
                const uploadingImage = await cloudinary.uploader.upload(image);
                imageUrl = uploadingImage.secure_url;
            } catch (cloudError) {
                console.error("🛑 Cloudinary Upload Failed:", cloudError.message);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        const newmessage = await MessageSchema.create({
            senderId,
            receiverId,
            text,
            image: imageUrl || null,
        });

        const receiversocketid = userSocketMap[receiverId];
        console.log("📡 Receiver Socket ID:", receiversocketid);

        if (receiversocketid) {
            const io = getIO(); // ✅ get the live io instance
            io.to(receiversocketid).emit("newmessage", newmessage);
        } else {
            console.log("📭 Receiver is offline or not connected via socket");
        }

        return res.status(200).json({ success: true, newmessage });
    } catch (error) {
        console.error("❌ Message Send Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { userfriends, getmessages, markmessageseen, sendmessage }