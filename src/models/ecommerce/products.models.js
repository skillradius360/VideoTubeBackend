import mongoose from "mongoose";

const projects = mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    productImage:{
        type:String,
        required:true
    },
    price:{
        type:Number,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    stock:{
        default:0,
        type:Number
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category"
    }
})