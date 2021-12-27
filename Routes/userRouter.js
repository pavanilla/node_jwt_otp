const router=require("express").Router()

const {signUp,verifyOtp}=require("../controller/userController")

// if the path is for the signup 
router.route("/signup")
.post(signUp)


router.route("/signup/verify")
.post(verifyOtp)


module.exports=router
