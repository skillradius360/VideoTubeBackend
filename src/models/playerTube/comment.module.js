import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    video:{
        type:mongoose.Types.ObjectId,
        ref:"video"
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"user"
    }
})

export const comment  = mongoose.model("comment",commentSchema)