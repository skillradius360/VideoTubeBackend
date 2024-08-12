import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {user} from "../models/playerTube/users.models.js"
import { apiError } from "../utils/apiError.js";

const verifyJWT = asyncHandler(async function(req,res,next){
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token || token==undefined){
            throw new apiError(401,"no token")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const User = await user.findById(decodedToken?._id)
        if(!User){
            throw new apiError(401,"invalid Access Token")
        }
    
        req.User = User
        next()

    } 
    catch (error) {
        throw new apiError(400,"invalid access Token!")
    }
})

export {verifyJWT}
