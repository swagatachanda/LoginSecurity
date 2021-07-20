const express = require("express")
const sessions = require("express-session")
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")
const Apiroutes = require("./routes/apiroutes")

const app=express()

app.set("view engine", "ejs")
app.enable("trust proxy")

require("dotenv").config()

const IN_PROD = process.env.NODE_ENV === "production"
const SESSION_EXPIRE = Number(process.env.SESSION_AGE) * 60 * 60 * 1000
app.use(
	sessions({
		name: process.env.SESSION_NAME,
		resave: false,
		saveUninitialized: false,
		secret: process.env.SESSION_SECRET,
		store: MongoStore.create({
			mongoUrl: process.env.DB_CONNECTION,
		}),
		cookie: {
			sameSite: true,
			maxAge: SESSION_EXPIRE,
			secure: IN_PROD,
			httpOnly: false,
		},
	})
)


const loginMiddleWare = (req, res, next) => {
    console.log(req.session.cookie._expires)
    if(Date.now()>=req.session.cookie._expires){
        req.session.islogged=false
    }
	if (!req.session.islogged) {
		res.redirect("/")
	} else {
		next()
	}
}
const ifloggedInMain = (req, res, next) => {
	if (req.session.islogged) {
		res.redirect("/index")
	} else {
		next()
	}
}


app.use("/api",Apiroutes)


app.get("/",ifloggedInMain, (req,res)=>{
    console.log(req.session)
    res.render("mypage")
})

app.get("/index", loginMiddleWare, (req, res) => {
    console.log(req.session)
	res.render("myprofile", { userdetails: req.session.userdetails })
})

mongoose.connect(process.env.DB_CONNECTION,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

app.listen(process.env.PORT || 3000)


