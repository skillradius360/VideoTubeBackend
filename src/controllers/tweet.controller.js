import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/playerTube/tweet.module.js"
import {user} from "../models/playerTube/users.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {tweetInput} =req.body

if(!tweetInput){
    throw new apiError(400,"no tweet data from body")
}

const User = await user.findById(req.User?._id)
if(!User){
    throw new apiError(401,"Please Login First")
}

const tweetInstance = await Tweet.create({
    content: tweetInput,
    owner:User?._id
})

if(!tweetInstance){
    throw new apiError(400,"tweet creation failure")
}

return res.status(200).json(new apiResponse(200,tweetInstance,"tweet posted successfully!"))
    //TODO: create tweet

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets---> get user Id - find user - lookup userId and tweetOwner
    const {userId} = req.params
    if(!userId){
        throw new apiError(400,"UserId not recieved")
    }


    const userTweets = await user.aggregate([{
        $match:{_id:new mongoose.Types.ObjectId(userId)}
    },
    {
        $lookup:{
            from:"tweets",
            localField:"_id",
            foreignField:"owner",
            as:"userTweets",
            pipeline:[
                {$project:{
                    updatedAt:0,
                    __v:0,
                    owner:0
                }}
            ]
        }

    },
      {
            $project:{
                accessToken:0,
                refreshToken:0,
                password:0,
                _id:0
            }
        }
]   
)

if(!userTweets){
    throw new apiError(400,"Tweet search Failure")
}

return res.status(200).json(new apiResponse(200,userTweets[0],"Tweets fetched successfully!"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {newTweet}= req.body
    const {tweetId} =req.params
    
    if(!tweetId || !newTweet){
        throw new apiError(400,"no TweetId or new Tweetdata")
    }
    if( !newTweet){
        throw new apiError(400,"no new Tweetdata")
    }
const tweetUpdate = await Tweet.findByIdAndUpdate(tweetId,{
    $set:{content:newTweet}
    
},{new:true})

if(!tweetUpdate){
    throw new apiError(400,"tweet update failed")
}

res.status(200).json(new apiResponse(200,tweetUpdate,"tweet update done"))
})

const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId}= req.params

    if(!tweetId){
        throw new apiError(400,"No tweetId recieved")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new apiError(400,"Tweet not deleted")
    }

    return res.status(200).json(new apiResponse(200,deletedTweet,"tweet deleted"))
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}