import mongoose, { mongo } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:{
        type:[mongoose.Schema.ObjectId],
        ref:"video"
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"user"
    }
})

playlistSchema.plugin(mongooseAggregatePaginate)

export const playlist = mongoose.model("playlist",playlistSchema)
