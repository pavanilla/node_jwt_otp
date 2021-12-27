const bcrypt=require("bcrypt")

const _=require("lodash")

const axios=require("axios")

const otpGenerator=require("otp-generator")


const {User}=require("../models/userModel")
const {Otp}=require("../models/otp-model")


// we are creating here two functions one is for creating the OTP 

// and the other is for verifying the otp

module.exports.signUp=async (req,res)=>{
    console.log("hai" ,req.body.number)
  const user=await User.findOne({
      number:req.body.number
  })
  if(user) return res.status(400).send("User already registered  ")

  const OTP=otpGenerator.generate(6,{
      digits:true,
      alphabets:false,
      upperCase:false,
      specialChars:false
  });
   const number=req.body.number;
   console.log(OTP)
   const otp=new Otp({
       number:number,
       otp:OTP
   })
   const salt=await bcrypt.genSalt(10)
   otp.otp=await bcrypt.hash(otp.otp,salt);
   const result=await otp.save();
   return res.status(200).send("OTP send successfully ")
}

module.exports.verifyOtp=async (req,res)=>{
    // here the otpHolder will be the collections 
   const otpHolder=await Otp.find({
       number:req.body.number
   })
   if(otpHolder.length===0) return res.status(400).send(" you are using expired OTP")
   const rightOtpFind=otpHolder[otpHolder.length-1];
   const validUser=await bcrypt.compare(req.body.otp,rightOtpFind.otp)
   if(rightOtpFind.number===req.body.number && validUser){
       const user=new User(_.pick(req.body,["number"]))
       const token=user.generateJWT();
       const result=await user.save()
       const OTPDelete=await Otp.deleteMany({
           number:rightOtpFind.number
       });

       return res.status(200).send({
           message:"User Registartion Successful",
           token:token,
           data:result,

       })
    }
    else{
        return res.status(400).send("your otp was wrong ")
    }
}