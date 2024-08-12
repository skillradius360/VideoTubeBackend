import {comment} from "../models/playerTube/comment.module.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {video} from "../models/playerTube/videos.modules.js"
import {apiResponse} from "../utils/apiResponse.js"
import { isValidObjectId } from "mongoose"

const addComment = asyncHandler(async (req, res) => {
    const {params} = req.params
    console.log(req.body)
    const {commentData} = req.body
    

    if(!commentData){
        throw new apiError(400,"No comment data found")
    }


    if(!params){
        throw new apiError(400,"Video Id not present")
    }

    const Video = await video.findById(params)
    if(!Video){
        throw new apiError(404,"video not found")
    }

    const Comment= await comment.create({
        content:commentData,

        owner:Video?._id,

        video:Video?.owner
    })

    if(!Comment){
        throw new apiError("comment adding failure")
    }

    return res.status(200).json(new apiResponse(200,Comment,"Comment added Successfully"))

})


const getAllComments= asyncHandler(async (req,res)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new apiError(400,"No videoID found in query")
    }


    const videoComments =await video.aggregate([
        {
             $match:{_id:mongoose.Types.ObjectId(videoId)}
         },
   
         {
             $lookup:{
                 from:"comments",
                 localField:"_id",
                 foreignField:"video",
                 as:"commentsAll"
             }
         },
  {
    $project: {
      updatedAt:0,
      __v:0,
    }
  }     
 ])

 if(videoComments[0].commentsAll.length ===0 || videoComments.length>=0){
    throw new apiError(400,"no comments found")
 }

return res.status(200).json(new apiResponse(200,videoComments[0],"comments spotted"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {params} = req.query
    const {data} = req.body

    if(!params){
        throw new apiError(400,"No video Id found to be updated")
    }
    
    if(!data){
        throw new apiError(400,"No content from body")
        
    }
    
    const Comment = await comment.findById(params)
    
    if(!Comment){
        throw new apiError(400,"Comment not found")
        
    }
    
    const updatedOne = await comment.findByIdAndUpdate(Comment._id,
        {$set:{
            content:data
        }},
        {new:true}
    ).select("-updatedAt -__v")

    if(!updatedOne){
        throw new apiError(400,"comment update failed")
    }
    
    return res.status(200,updatedOne,"updateSuccess")
})



const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!commentId){throw new apiError(400,"no commentId found ")}
    if(!isValidObjectId(commentId)){throw new apiError(400,"Object Id not Valid ")}
    
    const Comment = await comment.findByIdAndDelete(commentId)

    if(!Comment){throw new apiError(400,"no comment found ")}
    
res.status(200).json(new apiResponse(200,Comment,"Comment Deleted Successfully"))

})
export {addComment,
    getAllComments,
    updateComment,
    deleteComment
}
