import { like } from "../models/playerTube/like.models.js";
import {video } from "../models/playerTube/videos.modules.js";
import { user } from "../models/playerTube/users.models.js";
import {comment} from "../models/playerTube/comment.module.js";
import {Tweet} from "../models/playerTube/tweet.module.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {apiResponse} from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { mongoose,isValidObjectId } from "mongoose";


const likePrint= asyncHandler(async (req,res)=>{
    const {videoId}= req.query

})

const getLikedVideos = asyncHandler(async(req,res)=>{
    const{page,limit}= req.query
    let pageCalc= (page-1)*10
    const allLikedVideos = await user.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.User._id),
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "likedBy",
            as: "likeAndDetails",
            pipeline: [
              {
                $project: {
                  comment: 0,
                  tweet: 0,
                  videoTag: 0,
                },
              },
              {
                $lookup: {
                  from: "videos",
                  localField: "video",
                  foreignField: "_id",
                  as: "videosData",
                  pipeline:[
                    {$project:{
                    owner:1,
                    title:1,duration:1,
                    _id:1,thumbnail:1,videoFile:1
                    }}
                  ]
                },
              },
            ],
          },
        },
      
        {
          $project: {
          updatedAt:0,
            watchHistory:0,
            password:0,
            email:0,
            __v:0,
            refreshToken:0
          },
        }
      ])
    if(!allLikedVideos){
      throw new apiError(400,"video fetching failed")
    }
    console.log(allLikedVideos)
    res.status(200).json(new apiResponse(200,allLikedVideos[0],"All liked videos fetched"))
})

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const likeCookie = req.cookies?.likeBox
    console.log(req.cookies.likeBox)
    const likeObj= await like.findById(likeCookie)
    if(!likeCookie){
        throw new apiError(400,"no like cookie recieved")
    }

    if(!likeObj){
        throw new apiError(400,"likeId not recieved from cookies")
    }

    if(!videoId){
        throw new apiError(400,"no video Id recieved")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"video Id not valid")
    }


    if(!likeObj){
        res.status(200).json(new apiResponse(200,{likeObj,liked:false},"done"))
        throw new apiError(400,"like obj not found")
    }

    if(likeObj.video==videoId){
        likeObj.video=null
    likeObj.save({validateBeforeSave:false})

   return res.status(200).json(new apiResponse(200,{likeObj,liked:false},"unliked"))
    }

    likeObj.video= videoId
    likeObj.save({validateBeforeSave:false})

   return res.status(200).json(new apiResponse(200,{likeObj,liked:true},"done"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const likeCookie = req.cookies?.likeBox
    console.log(req.cookie)
    const likeObj= await like.findById(likeCookie)
    if(!likeCookie){
        throw new apiError(400,"no like cookie recieved")
    }

    if(!likeObj){
        throw new apiError(400,"likeId not recieved from cookies")
    }

    if(!videoId){
        throw new apiError(400,"no comment Id recieved")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"comment Id not valid")
    }


    if(!likeObj){
        res.status(200).json(new apiResponse(200,{likeObj,liked:false},"done"))
        throw new apiError(400,"like obj not found")
    }

    if(likeObj.comment==videoId){
        likeObj.comment=null
    likeObj.save({validateBeforeSave:false})

   return res.status(200).json(new apiResponse(200,{likeObj,liked:false},"unliked"))
    }

    likeObj.comment= videoId
    likeObj.save({validateBeforeSave:false})

   return res.status(200).json(new apiResponse(200,{likeObj,liked:true},"donecomment"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    
        const {videoId} = req.params
        //TODO: toggle like on video
        const likeCookie = req.cookies?.likeBox
        console.log(req.cookie)
        const likeObj= await like.findById(likeCookie)
        if(!likeCookie){
            throw new apiError(400,"no like cookie recieved")
        }
    
        if(!likeObj){
            throw new apiError(400,"likeId not recieved from cookies")
        }
    
        if(!videoId){
            throw new apiError(400,"no video Id recieved")
        }
    
        if(!isValidObjectId(videoId)){
            throw new apiError(400,"tweet Id not valid")
        }
    
    
        if(!likeObj){
            res.status(200).json(new apiResponse(200,{likeObj,liked:false},"done"))
            throw new apiError(400,"like obj not found")
        }
    
        if(likeObj.tweet==videoId){
            likeObj.tweet=null
        likeObj.save({validateBeforeSave:false})
    
       return res.status(200).json(new apiResponse(200,{likeObj,liked:false},"unliked"))
        }
    
        likeObj.tweet= videoId
        likeObj.save({validateBeforeSave:false})
    
       return res.status(200).json(new apiResponse(200,{likeObj,liked:true},"done"))
    
    })


export {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike
}