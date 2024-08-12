import mongoose from "mongoose"
// bcrypt is used to encrypt passwords
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    
    watchHistory:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"video"
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    fullName:{
        type:String,
        required:true,
        uppercase:true,trim:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,

    },
    password:{
        type:String,
         
    },refreshToken:{
        type:String
    }
    
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password=  await bcrypt.hash(this.password,8)
    next()
})

userSchema.methods.checkPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}

// ********************************************************************
userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName

    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

// *******************************************************************
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const user = mongoose.model("user",userSchema)

