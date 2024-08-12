import mongoose, {isValidObjectId} from "mongoose"
import {user} from "../models/playerTube/users.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { subscription } from "../models/playerTube/subscription.models.js"






const toggleSubscription = asyncHandler(async (req, res) => {
    // find user exists or not in the channel section --> if not create a new channel
    const {channelId}= req.params
    if(!channelId ){
        throw new apiError(400,"channel id not recieved through params")
    }

    if(!req.User?._id){
        throw new apiError(400,"login first to sub or unsub")

    }
    const findSubObj = await subscription.findOne({
        $and:[{channel:channelId},{subscriber:req.User._id}]
    })
    

    if(!findSubObj){
        const subbedObj= await subscription.create({
            channel:channelId,
            subscriber:req.User._id
        })
        const findSubbedOrNot= await subscription.aggregate([
            {
                $match:{_id:new mongoose.Types.ObjectId(subbedObj._id)}
            },
            {
                $lookup:{
                    from:"users",
                    localField:"channel",
                    foreignField:"_id",
                    as:"whoSChannel",
                    pipeline:[
                        {
                            $project:{
                                _id:1,
                                username:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    whoSChannel:{$first:"$whoSChannel"},
                    
                }
            },
           
        ])
        if(!findSubbedOrNot){
            throw new apiError("Subscribing failure")
        }
       return  res.status(200).json(new apiResponse(200,findSubbedOrNot,"subscribed to "))
    }
    
    const unsubscribeObj= await subscription.findByIdAndDelete(findSubObj._id)
    if(!unsubscribeObj){
        throw new apiError(400,"unsubscribe failure")
    }
    return res.status(200).json(new apiResponse(200,unsubscribeObj,"unsubscribed  "))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
   const {channelId} = req.params

   if(!channelId){
    throw new apiError(400,"channelId not recieved through params")
   }

   
   const subsList = await subscription.aggregate([
    [
        {
          $match: {
            channel: mongoose.Types.ObjectId(
              channelId
            ),
          },
        },
      
        {
          $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "allSubs",
            pipeline: [
              {
                $project: {
                  accessToken: 0,
                  refreshToken: 0,
                  password: 0,
                  watchHistory: 0,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            allSubs: {
              $first: "$allSubs",
            },
          },
        },
      ]
   ])

   if(!subsList.length>=0){
    return res.status(200).json(new apiResponse(200,[],"No subscribers found!"))
   }

   return res.status(200).json(new apiResponse(200,subsList[0],"all subscribers lists fetched!"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId}= req.params

if(!subscriberId){
    throw new apiError(400,"subscriber id not found")
}

const subbedChannels = await subscription.aggregate([
    {
      $match: {
        subscriber: ObjectId(
          "66b25089d4c1905fb6889f2b"
        ),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelList",
        pipeline: [
          {
            $project: {
              accessToken: 0,
              refreshToken: 0,
              password: 0,
              watchHistory: 0,
            },
          },
        ],
      },
    },
  
    {
      $addFields: {
        channelList: { $first: "$channelList" },
      },
    },
  ])


  if(!subsList.length>=0){
    return res.status(200).json(new apiResponse(200,[],"No subscribers found!"))
   }


  
  return res.status(200).json(new apiResponse(200,subbedChannels[0],"all subscribers lists fetched!"))


})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
}