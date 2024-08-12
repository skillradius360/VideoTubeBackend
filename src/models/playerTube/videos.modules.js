import mongoose from "mongoose";
// Used to handle video by aggregation queries
import mongooseAggregatePaginate  from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema({
    
    videoFile:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean
    }
},{timestamps:true})

// aggregate  query handler
videoSchema.plugin(mongooseAggregatePaginate)


export const video= mongoose.model("video",videoSchema)