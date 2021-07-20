const mongoose=require('mongoose')
const validator=require('validator')
const Login=mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    passcode:{
        type: String
    },
    mail:{
        type: String,
        required:true,
        unique: true,
        validate:{
                validator : (value) =>{
                    return validator.isEmail(value)
                },
                message : "Provide a valid email"
            }
    }
})

Login.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.passcode;
    return obj;
   }

module.exports=mongoose.model('Login',Login)