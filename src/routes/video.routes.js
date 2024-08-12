import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { video } from "../models/playerTube/videos.modules.js"
import { upload } from "../middlewares/multer.middleware.js"
import { insertLikes } from "../middlewares/like.middleware.js"
import { like } from "../models/playerTube/like.models.js"


import {publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,getAllVideos
} from "../controllers/video.controller.js"

 const videoRouter= Router()

    videoRouter.route("/publishVideo").post(upload.fields([
        {name:"videoFile", maxCount:1},
        {name:"thumbnail", maxCount:1}

    ]),verifyJWT,publishAVideo)
    videoRouter.route("/getVideo/:videoId").get(verifyJWT,insertLikes,getVideoById)
    videoRouter.route("/getAllVideo/v1").get(verifyJWT,getAllVideos)
    videoRouter.route("/togglePublishStatus/:videoId").get(verifyJWT,togglePublishStatus)
    videoRouter.route("/deleteVideo/:videoId").get(verifyJWT,deleteVideo)


 export {videoRouter}


