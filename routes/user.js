const express= require("express")
const User = require("../model/userdetails")
const nodemailer=require("nodemailer")
const bcrypt=require("bcrypt")
const fetch=require("node-fetch")
const { v4: uuidv4 } = require('uuid')
const shortId = require("shortid")
require('dotenv').config()

const router = express.Router()

router.use(express.json())


var transport = nodemailer.createTransport({
    host : 'smtp.yandex.com',
    port: 465,
    secure : true,
    auth: {
       user: process.env.EMAIL,
       pass: process.env.EMAIL_PASS
    }
})


const validateuseremail= async (email)=>{
    try{
        const response=await User.findOne({"mail":email})
        if(response != null)
            return true
        return false
    }
    catch(err)
    {
        console.log(err);
    }   
}

router.get("/",async(req,res)=>{
    res.send("Good Morning")
})


router.post("/signup",async(req,res)=>{
    console.log(req.body)
    var status={}
    try
    {
        status.status=true
        const newUser= new User({
            Name: req.body.Name,
            mail:req.body.mail
        })
        try{
            const newuser= await newUser.save();
            status.data=newuser;
        }
        catch(err){
            status.status=false;
            if(err.code)
                status.code=err.code;
            else    
                status.code=12
            status.error=err.message
            console.log(err)
        }
    }
    catch(err){
        console.log(err)
    }
    res.json(status)
})


// const makeid=(length) => {
//     var result           = [];
//     var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//       result.push(characters.charAt(Math.floor(Math.random() * 
//  charactersLength)));
//    }
//    return result.join('');
// }


router.post("/sentmail",async(req,res)=>{
    // const code = uuidv4()
    const code = shortId.generate()
    var status={}
    var response=await validateuseremail(req.body.mail)
    if(response==false){
        status.status=false,
        status.code=12
        return res.json({status: false,
			error: "Invalid email"})
    }
    try{
        try{
            var hashedPassword= await bcrypt.hash(code,10)
        }
        catch(err){
            res.json({'status' : false, 'error' : err, 'code' : 21}) 
        }
        status.status=true
        try{
            const Updatepass= await User.updateOne({"mail":req.body.mail}, {'$set' :{"passcode":hashedPassword}});
            status.data=Updatepass;
          
        console.log(Updatepass)
       
       
        }
        catch(Err){
            status.status=false;
            status.code=15;
        }
    }
    catch(err){
        console.log(err)
    }

    const message = {
        from: process.env.EMAIL, 
        to: req.body.mail,         
        subject: 'Email Confirmation', 
        html: `${code}`
    }
    transport.sendMail(message, function(err, info) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
        }
    })
   
    res.json({status : true , message : 'code sent'})
})


router.post("/matchpass/@:emailid",async(req,res)=>{
    if(req.body.passcode==="") {return res.json({status: false, error : "Please enter passcode"})}
    const userdetails = await User.findOne({"mail":req.params.emailid})
    console.log(userdetails)
    if (await bcrypt.compare(req.body.passcode, userdetails.passcode)) {
        delete userdetails.passcode
        req.session.islogged = true
        req.session.userdetails = userdetails
        console.log(req.session)
        res.json({status: true, loggedSuccess : userdetails})
    }
    else {
		return res.json({
			status: false,
			error: "passcode not a match"
		})
    }
})

router.get("/logout", (req, res) => {
	delete req.session.userdetails
	req.session.islogged = false
	console.log(req.session)
	res.json({ status: true, loggedOut: true })
})



module.exports=router