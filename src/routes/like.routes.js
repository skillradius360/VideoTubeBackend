import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {insertLikes} from "../middlewares/like.middleware.js" 


const likeRouter = Router();
likeRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

likeRouter.route("/toggle/v/:videoId").get(insertLikes,toggleVideoLike);
likeRouter.route("/toggle/c/:videoId").get(insertLikes,toggleCommentLike);
likeRouter.route("/toggle/t/:videoId").get(insertLikes,toggleTweetLike);
likeRouter.route("/videos").get(getLikedVideos);

export  {likeRouter}