const User = require("../Schema/Userschema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cloudinary = require("../connection/Cloudinary")

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" })
        }
        const token = await createToken(user._id)
        res.status(200).json({ success: true, token, user, message: "User logged in successfully" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const signup = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Required essential crendials" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({
            name, email, password: hashedPassword
        })
        const token = await createToken(newUser._id)
        res.status(200).json({ success: true, token, newUser, message: "User created successfully" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

// for user updating profile picture
const updateprofile = async (req, res) => {
    try {
        const { profilePicture, name, bio } = req.body
        let updateduser

        if (!profilePicture && !name && !bio) {
            return res.status(400).json({ message: "Please provide at least one field to update" })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        if (!profilePicture) {

            updateduser = await User.findByIdAndUpdate(req.user._id, { name, bio }, { new: true })

            return res.status(200).json({ success: true, message: "Profile updated successfully", updateduser })
        }


        if (profilePicture.startsWith("data:image")) {
            const uploadedResponse = await cloudinary.uploader.upload(profilePicture, {
                folder: "profile_pictures",
            });
            const userprofilePicture = uploadedResponse.secure_url;
            updateduser = await User.findByIdAndUpdate(req.user._id, { profilePicture: userprofilePicture, name, bio }, { new: true })

        }
        // if (profilePicture) {
        //     const result = await cloudinary.uploader.upload(profilePicture,{
        //         upload_preset: "your_upload_preset_if_needed",
        //     })
        //     if(!result){
        //         console.log("image not loaded")
        //     }
        //     const userprofilePicture = result.secure_url
        //     updateduser = await User.findByIdAndUpdate(req.user._id, { profilePicture: userprofilePicture, name, bio }, { new: true })
        // }
        return res.status(200).json({ success: true, message: "Profile updated successfully", updateduser })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const updateprofilePicture = async (req, res) => {
    let updateduser

    const { profilePicture } = req.body
    const user = await User.findById(req.user._id)
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }
    const result = await cloudinary.uploader.upload(profilePicture)
    const userprofilePicture = result.secure_url
    updateduser = await User.findByIdAndUpdate(req.user._id, { profilePicture: userprofilePicture }, { new: true })
    return res.status(200).json({ success: true, message: "Profile picture updated successfully", updateduser })
}

const getuserprofile = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User authentication required" });
        }

        const userdetails = await User.findById(userId).select("-password");
        if (!userdetails) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, details: userdetails });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const google = async (req, res) => {
    const { name, email, password } = req.body
}

module.exports = { login, signup, updateprofile, updateprofilePicture, google, getuserprofile }
