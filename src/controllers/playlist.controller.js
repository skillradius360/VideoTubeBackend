import {asyncHandler} from "../utils/asyncHandler.js"
import {apiResponse} from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import {user} from "../models/playerTube/users.models.js"
import {video} from "../models/playerTube/videos.modules.js"
import {playlist} from "../models/playerTube/playlist.module.js"
import { mongoose,isValidObjectId } from "mongoose"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!(name && description)){
        throw new apiError(400,"no name or description recieved")
    }

    const playlistEntry = await playlist.create({
        name:name,
        description:description,
        owner:req.User._id
    })

    if(!playlistEntry){
        throw new apiError(400,"playlist not created")
    }

    return res.status(200).json(new apiResponse(200,playlistEntry,"New playlist created!"))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlist
    const {userId}= req.params
    console.log(userId)
    if(!isValidObjectId(userId)){
        throw new apiError(400,"UserId not valid")
    }

    const userPlaylists = await user.aggregate([

        {
            $match:{_id:new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from:"playlists",
                localField:"_id",
                foreignField:"owner",
                as:"playlistsData"
            }
        },
      
        {
            $project:{
                password:0,
                accessToken:0,
                refreshToken:0

            }
        }

    ])

    return res.status(200).json(new apiResponse(200,userPlaylists,"playlists successfully fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId}= req.params
    if(isValidObjectId(playlistId) && !playlistId){
        throw new apiError(400, "playlistID format Incorrect")
    }

    const requestedPlaylist = await playlist.findById(playlistId)
    if(!requestedPlaylist){
        throw new apiError(400,"playlist not found")
    }
    
    res.status(200).json(new apiResponse(200, requestedPlaylist, "playlists fetched Successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {videoId,playlistId}= req.params

    if(!(videoId && playlistId)){
        throw new apiError(400,"videoId or playlist id not recievved")
    }
    const videoObj = await video.findById(videoId)
    if(!videoObj){
        throw new apiError(400,"video not found")
    }
    const playlistObj = await playlist.findById(playlistId)
            playlistObj.videos.push(videoObj?._id)
            await playlistObj.save({validateBeforeSave:false})
            
    const playlistData = await playlist.findById(playlistId)
  
    if(!playlistData){
        throw new apiError(400,"playlist not found as error uploading the video occured")
    }

    res.status(200).json(new apiResponse(200,playlistData,"Video added to playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
        const {videoId,playlistId}= req.params

    if(!(videoId && playlistId)){
        throw new apiError(400,"videoId or playlist id not recievved")
    }
    const playlistObj = await playlist.findById(playlistId)
    if(!playlistObj){
        throw new apiError(400,"video not found")
    }
    
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"videoId not valid")
    }
    
    playlistObj.videos[playlistObj.videos.indexOf(videoId)]=null
    playlistObj.save({validateBeforeSave:false})

    res.status(200).json(new apiResponse(200,playlistObj,"item deleted"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
     const {playlistId}= req.params
    // TODO: delete playlist
    if(!(playlistId)){
        throw new apiError(400,"videoId or playlist id not recievved")
    }
    
    const playlistObj = await playlist.findByIdAndDelete(playlistId)

    if(!playlistObj){
        throw new apiError(400,"deletion not successful")
    }

    res.status(200).apiResponse(200,playlistObj,"Video added to playlist")


})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const{playlistId}=req.params
    const {name,description}=req.body
console.log(req.body)
    if(!playlistId && !isValidObjectId(playlistId)){
throw new apiError(400,"There is a problem with playlistId while updating")
    }

    if(!(name && description)){
        throw new apiError(400,"name or description not recieved ")
    }

    const updatedPlaylist=  await playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name:name,
                description:description
            }
        },{new:true}
    )

    if(!updatePlaylist){
        throw new apiError(400,"playlist update problem")
    }

    res.status(200).json(new apiResponse(200,updatedPlaylist,"playlist has been updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
