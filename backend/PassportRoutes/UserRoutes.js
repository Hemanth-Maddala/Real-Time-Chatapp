const express = require("express")
const router = express.Router()
const UserAuth = require("../middleware/Userauth")
const {login, signup, updateprofile, updateprofilePicture ,getuserprofile} = require("../Views/Userview")

router.post("/login", login)
router.post("/signup", signup)
router.put("/updateprofile", UserAuth, updateprofile)
router.get("/userdetails",UserAuth,getuserprofile)
router.put("/updateprofilepicture", UserAuth, updateprofilePicture)

module.exports = router

