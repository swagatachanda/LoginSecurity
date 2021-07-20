const express = require("express")
const User = require("../routes/user")

const router = express.Router()

router.use(express.json())

router.get("/",async(req,res)=>{
    res.send("Bye world")
})

router.use("/user",User)

module.exports=router