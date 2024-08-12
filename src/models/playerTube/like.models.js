import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema=  new mongoose.Schema({
video:{
    type:mongoose.Types.ObjectId,
    ref:"video"
    },
comment:{
    type:mongoose.Types.ObjectId,
    ref:"comment"
},

tweet:{
    type:mongoose.Types.ObjectId,
    ref:"tweet"
},

videoTag:{
    type:mongoose.Types.ObjectId,
    ref:"video"
},
likedBy:{
    type:mongoose.Types.ObjectId,
    ref:"user"
}

})

export const like = mongoose.model("like",likeSchema)