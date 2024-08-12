import { like } from "../models/playerTube/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
// recieve video Id
// check if the video is there or not


const insertLikes = asyncHandler(async (req, res, next) => {
    try{
    const { videoId } = req.params
    console.log(videoId)

    if (!req.User?._id) {
        throw new apiError(400, "need to login to like")
    }

    
    const likeId = await like.findOne({
        videoTag: videoId
    })
    const Options = { httpOnly: true, secure: true }
    res.cookie("videoCookie", videoId, Options)
    if (!likeId) {
        const likeEntry = await like.create({
            likedBy: req.User._id,
            videoTag:videoId,
            video: null,
            tweet: null,
            comment: null,
        })
        const Options = { httpOnly: true, secure: true }
        res.status(200).cookie("videoCookie", videoId, Options).json(new apiResponse(200, {likeEntry,liked:false}, "cookie added and entry added as user is New"))
        next()
    }
    else {
        const videoCookies = req.cookies?.videoCookie
        const User = req.User._id

        if (videoCookies != videoId  ) {
            throw new apiError(404,"cookie not found")
        }
        console.log(likeId)
            res.status(200).cookie("likeBox",likeId._id,Options)
            next()
    }}
    catch(error){
        throw new apiError(400,"some error occured"+error)
    }
})

export { insertLikes }

