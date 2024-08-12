import { Router } from "express";
import {addComment,
    getAllComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const commentRouter = Router()
commentRouter.use(verifyJWT)


commentRouter.route("/addComment/:params").post(addComment)
commentRouter.route("/getAllComments/").get(getAllComments)
commentRouter.route("/updateComment/:params").patch(updateComment)
commentRouter.route("/deleteComment/:commentId").post(deleteComment)

export {commentRouter}