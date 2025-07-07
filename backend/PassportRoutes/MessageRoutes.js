const express = require("express")
const router2 = express.Router()
const {userfriends,getmessages,markmessageseen,sendmessage} = require("../Views/MessageView")
const UserAuth = require("../middleware/Userauth")

router2.get("/userfrnd",UserAuth,userfriends)
router2.get("/convo/:id",UserAuth,getmessages)
router2.put("/mark/:id",UserAuth,markmessageseen)
router2.post("/send/:id",UserAuth,sendmessage)

module.exports = router2