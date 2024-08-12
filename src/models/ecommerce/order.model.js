import mongoose 
 from "mongoose";

 const orderItemsData = new mongoose.Schema({
    name:{
        type:String,
    },
    quantity:{
        type:Number,
        default:0
    }
 })


 const product = new mongoose.Schema({
    orderPrice:{
        type:Number,
        default:0
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
    },
    orderItems:{
        type:[orderItemsData]
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["PENDING","CANCELLED","DELIVERED"],
        default:"PENDING"
    }


 })

 export const order = mongoose.model("order",product)