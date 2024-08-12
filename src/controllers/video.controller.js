import mongoose, { isValidObjectId } from "mongoose"
import { video } from "../models/playerTube/videos.modules.js"
import { user } from "../models/playerTube/users.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { cloudUploader } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

    // 
    const { page, limit = 5, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if ([page, sortBy, sortType, userId].some((data) =>
        data?.trim === ""
    )) {
        throw new apiError(400, "data not found for query processing")
    }

    let timeline = 0;
    let type
    if (sortType == "ascending") {
        type = -1
    }
    else {
        type = 1
    }
    // sortBy case 
    switch (sortBy) {
        case "today":
            timeline = 0;
            break;
        case "yesterday":
            timeline = 1;
            break;
        case "week_ago":
            timeline = 6;
            break;
        case "month":
            timeline = 29;
            break;
    }

    // YESTERDAY TODAY TOMORROW SYSTEM
    const userVideos = await user.aggregate(
        [

                     {
                            $lookup: {
                                from: "videos",
                                localField: "_id",
                                foreignField: "owner",
                                as: "videosData",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "users",
                                            localField: "owner",
                                            foreignField: "_id",
                                            as: "userDetails",
                                            pipeline: [
                                                {
                                                    $project: {
                                                        username: 1,
                                                        fullName: 1,
            
            
            
                                                    }
                                                }
                                            ]
                                        }
            
                                    }
            
                                ]
                            }
                        },
                        {
                            $unwind: {
                                path: "$videosData",
                                preserveNullAndEmptyArrays: true,
            
                            }
                        }
                        ,
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        {
                                            $dateToString: {
                                                format: "%Y-%m-%d", date: {
                                                    $dateSubtract: {
                                                        startDate: new Date(), unit: "day", amount: 10
                                                    }
                                                }
                                            }
                                        },
                                        { $dateToString: { format: "%Y-%m-%d", date: "$videosData.createdAt" } }
                                    ]
                                }
                            }
                        }
                        , {
                            $sort: { "videosData.createdAt": -1 }
                        },
            
                        {
                            $group: {
                                _id: "$_id",
                                videosAll: { $push: "$videosData" }
                            }
                        },
                        {
                            $unwind: {
                                path: "$videosAll",
            
                            }
                        }
            ]
    )


    if (userVideos.length === 0) {
        throw new apiError(404, "aggregation problem")
    }


    //  PAGINATION
    let videoStack = []
    let max = limit
    let min = 0
    if (userVideos.length < limit) {
        videoStack.push(userVideos.slice(0, userVideos.length))
    }
    else if (page == 1 && userVideos.length > 5) {
        videoStack.push(userVideos.slice(min, max))
    }
    else {
        videoStack.push(userVideos.slice(
            ((max * page) - (min + max)), max * page))
    }

    if (videoStack.length <= 0) {
        throw new apiError(404, "No videos found")
    }


    return res.status(200).json(new apiResponse(200, videoStack[0], "the videos fetched are hrere"))
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    const User = await user.findById(req.User?._id)
    if (!User) {
        throw new apiError(404, "No user found or login needed")
    }

    if (!(title || description)) {
        throw new apiError(404, "Title or description needed")
    }

    console.log(req.files)
    const videoFile = req.files?.videoFile[0]?.path
    if (!videoFile) {
        throw new apiError(400, "No video passed from user")
    }


    const uploadResponse = await cloudUploader(videoFile)
    if (!uploadResponse) {
        throw new apiError(404, "No user found or login needed")
    }


    const thumbnailFile = req.files?.thumbnail[0]?.path
    if (!thumbnailFile) {
        throw new apiError(400, "No video passed from user")
    }

    const thumbnailuploadResponse = await cloudUploader(thumbnailFile)
    if (!thumbnailuploadResponse) {
        throw new apiError(404, "No user found or login needed")
    }

    const videoEntry = await video.create({
        videoFile: uploadResponse.url,
        thumbnail: thumbnailuploadResponse.url,
        owner: User._id,
        title: title,
        description: description,
        duration: uploadResponse.duration,
        views: 0,
        isPublished: true
    })

    const videoEntrySuccess = await video.findById(videoEntry._id)
    if (!videoEntrySuccess) {
        throw new apiError("video posting unsucessful")
    }


    return res.status(200).json(new apiResponse(200, videoEntrySuccess, "video successfully uploaded"))
})


const getVideoById = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    console.log(req.params.videoId)

    if (!videoId) {
        throw new apiError(404, "invvalid video URL ")
    }
    // VIEWS
    const videoData = await video.findById(videoId)
    if (!videoData) {
        throw new apiError(404, "log In First or video is not present")
    }
    videoData.views++
    await videoData.save({ validateBeforeSave: false })


    // HISTORY
    const User = await user.findById(req.User._id);
    if (!User) {
        throw new apiError(404, "log In First ")
    }
    User.watchHistory.push(videoData._id)
    User.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new apiResponse(200, videoData, "Video found successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description, thumbnail } = req.body
    const { videoId } = req.params

    //TODO: update video details like title, description, thumbnail 
    if (!videoId) {
        throw new apiError(400, " videoId needed to update")
    }
    if ([title, description, thumbnail].some((data) => data?.trim() === "")) {
        throw new apiError(400, "problem with title, description, thumbnail")
    }

    const isUpdated = await video.findByIdAndUpdate(videoId, {
        $set: {
            title: title,
            description: description,
            thumbnail: thumbnail
        }

    }, { new: true }
    )

    if (!isUpdated) {
        throw new apiError(400, " video details update problem ")
    }

    res.status(200).json(new apiResponse(200, isUpdated, "Update successful"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //TODO: update video details like title, description, thumbnailconst updateVideo 
    if (!videoId) {
        throw new apiError(400, " videoId needed to delete")
    }

    const videoData = await video.findByIdAndDelete(videoId)
    if (!videoData) {
        throw new apiError(400, "video deletion unsuccessful")
    }

    return res.status(200).json(new apiResponse(200, video, "video deleted successfully!"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(400, " videoId needed to delete")
    }

    const Video = await video.findById(videoId)

    if (!Video) {
        throw new apiError(400, " no video found")
    }
    if (Video.isPublished == true) {

        Video.isPublished = false;
    }
    else {
        Video.isPublished = true
    }
    await Video.save({ validateBeforeSave: false })

    res.status(200).json(new apiResponse(200, Video, "Toggled success"))

})





export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus, getAllVideos
}


// current day , yesterday ,week 