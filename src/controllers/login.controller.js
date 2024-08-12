import {asyncHandler} from "../utils/asyncHandler.js"
import {apiResponse} from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import {user} from "../models/playerTube/users.models.js"
import {cloudUploader} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

let registerUser = asyncHandler(async(req,res)=>{
        
        const {fullName,email,password,username}=req.body
// check creds from user if there is something
        if([fullName,email,password,username].some((data)=>data?.trim()==="")){
                throw new apiError(400,"please enter the details correctly!")
         }
        
         if(!email.includes("@")){
                throw new apiError("400","please enter the email coorectly!")
         }

// search in database if user is there  
        let userExistance =  await user.findOne({
                $or:[{username},{email}]
        })
        if (userExistance){
                throw new apiError("409","Username and email already exist")
        }
        console.log(req.files)
// path of the file to be  uploaded and is saved temporarily 
        const avatarLocalPath= req.files?.avatar[0].path;

        if (!avatarLocalPath){
                throw new apiError("400","Avatar file compulsory!")
        }
        // const coverImageLocalPath= req.files?.coverImage[0]?.path;
        // if (!coverImageLocalPath){
        //         throw new apiError("400"," coverImage file compulsory!")
        // }

        // if there is no coverImage passed then need to validate with null.
        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
                coverImageLocalPath=req.files.coverImage[0].path
                // cloudinary returns "" if there is no data passed into(undef..)
        }

// files to be loaded in the cloudinary
 
const  avatarUploadResponse = await cloudUploader(avatarLocalPath)
const  coverImageUploadResponse = await cloudUploader(coverImageLocalPath)


// checking the avatar field as it has a required constraint and properly uploaded in cloud
   if(!avatarUploadResponse){
        throw new apiError(400,"avatar field is required")
   }

// create a new user in db (entry)
const userEntry = await user.create({
        fullName,
        avatar:avatarUploadResponse.url,
        coverImage:coverImageUploadResponse?.url||"",
        email,
        password,  
        username:username

})

// as the user is created , the findById is used to detect and if created
// the password and refToken is to be removed else throw err
const createdUser =await user.findById(userEntry._id).select("-password -refreshToken")

if(!createdUser){
        throw new apiError(500,"error occured creating the new user")
}
 
return res.status(200).json(
        new apiResponse(createdUser,"user created successfully!",200)
)
// database checking if user exists or not
})

// *****************************************************************************

const generateAccessandRefreshTokens = async function (UserId){
        try{

                const User = await user.findById(UserId)
                
                const accessToken=User.generateAccessToken()
                const refreshToken=User.generateRefreshToken()
                
                User.refreshToken= refreshToken
                await User.save({validateBeforeSave:false})
                
                return {refreshToken,accessToken}
        }
        catch(error){
                throw new apiError(400,`accessAnd RefreshToken generation problem ${error.message}`)
        }
}
        
    
    const loginUser =asyncHandler(async function(req,res){
            console.log(req.body)
            const {username,password,email}= req.body
            // $$$$$$$$$$$$$$$$$$$User== instance  user== mainDB one $$$$$$$$$$$$$$$$$$
            if(!username || !password || !email){
                    throw new apiError(400,"username or Password not present")
            }
    
            const User = await user.findOne({
                    $or:[ {username},{email} ] })
    
            if(!User){
                    throw new apiError("404","user not registered")
            }
    
            const passwordValid= await User.checkPassword(password)
    
            if(!passwordValid){
                    throw new apiError(401,"Password does not match with the encrypted one")
            }
    
            const {accessToken,refreshToken}=await generateAccessandRefreshTokens(User._id)
    
            const loggedInUser= await user.findById(User._id).select("-password -refreshToken")
    
            const cookieOptions= {
                    httpOnly:true,secure:true
            }
    
            return res
            .status(200)
            .cookie("accessToken",accessToken,cookieOptions)
            .cookie("refreshToken",refreshToken,cookieOptions)
            .json(
                    new apiResponse(200,
                            {"user":{accessToken,refreshToken,loggedInUser}},
    
                            "logged in successfully")
                 )
    
    })
    
    const logOutUser = asyncHandler(async function(req,res){
        user.findByIdAndUpdate(req.User._id,
                {
                        $unset:{refreshToken:1}
                },
                {new:true})

                const cookieOptions = {httpOnly:true,
                        secure:true
                }

        return res.status(200)
        .clearCookie("accessToken",cookieOptions)
        .clearCookie("refreshToken",cookieOptions)
        .json(new apiResponse(200,{},"User logged our successfully"))
    })

    const updateAccessToken= asyncHandler(async function(req,res){
// recieve token --- check if token is there --- validate token with jwt--- check saved DB token with the incoming token --- generate new access and refresh token ---send

        const Token = req.cookies?.refreshToken || req.body.refreshToken
        if(!Token){
                throw new apiError(400,"no token recieved to refresh")
        }

        try {
                const isTokenTrue = jwt.verify(Token,process.env.REFRESH_TOKEN_SECRET)
                if(!isTokenTrue){
                        throw new apiError(400,"Token not Validated!")
                }
                const User= await user.findById(isTokenTrue?._id)
                console.log(User.refreshToken)
                if(Token!==User.refreshToken){
                        throw new apiError(400,"Token mismatch !")
                }
                const{accessToken,refreshToken} =await generateAccessandRefreshTokens(User._id)
        
                const cookieOptions= {httpOnly:true,
                        secure:true
                }
        
                res.status(200)
                .cookie("accessToken",accessToken,cookieOptions)
                .cookie("refreshToken",refreshToken,cookieOptions)
                .json(new apiResponse(200,
                        {accessToken,newrefreshToken:refreshToken},
                        "This is the new refreshToken Generated!"
                ))
        } catch (error) {
                throw new apiError(401,`some error occured while sending new RefreshToken${error}`)
        }
    })


        const changeCurrentPassword = asyncHandler(async(req,res)=>{
                const {oldPassword,newPassword}= req.body

                const User = await user.findById(req.User?._id)
                if(!User){
                        throw new apiError(400,"Please log In first")
                }
                const isPassCorrect= User.checkPassword(oldPassword)
                if(isPassCorrect){
                        throw new apiError(400,"Incorrect old Password") 
                }

                User.password = newPassword
                User.save({validateBeforeSave:false})

                res.status(200)
                .json(new apiResponse(200,{},"Password Reset Success"))
        })

        const getCurrentUser = asyncHandler(async (req,res)=>{
                res.status(200)
                .json(new apiResponse(200, req.User,
                        "This is the current User")
                )
        })

        const resetAvatar = asyncHandler(async(req,res)=>{
                // req.files---if path---upload on cloud---url db save --check if saved --
                const User= await user.findById(req.User?._id)
                if(!User){
                        throw new apiError(404,"please login to change DP")
                }
                
                try {
                        const imagePath = req.files?.avatar[0]?.path
                        console.log(req.files)
                        if(!imagePath){
                                throw new apiError(400,"There has been a problem finding the ImagePath")
                        }
        
                        const avatarUploadedURL= cloudUploader(imagePath)

                        User.avatar = avatarUploadedURL
                        User.save({validateBeforeSave:false})

                        return res.status(200)
                        .json(new apiResponse(200,{
                                newURL:avatarUploadedURL
                        },"Avatar updated successfully"
                ))
                } catch (error) {
                        throw new apiError(400,`error occured during updating avatar--${error}`)
                }      
        })

        const changeUserName = asyncHandler(async(req,res)=>{
                const {Username} = req.body
                if(!Username){
                        throw new apiError(400,"No username recieved")
                }

                let changedData = await user.findByIdAndUpdate(req.User?._id,
                        {
                        $set:{username:Username}
                        },
                {new:true}).select("-password ")

                return res.status(200).json(new apiResponse(200,changedData,"Username Updated Successfully"))
        })

        const deleteUser = asyncHandler(async(req,res)=>{
                const User = await user.findById( req.User._id)

                if(!User){
                        throw new apiError(400,"User not logged in")
                }

                const deleteUSer =await user.findByIdAndDelete(User._id)
                if(!deleteUSer){
                        throw new apiError(400,"user deletion failed")
                }

                res.status(200).json( new apiResponse(200,deleteUSer,"USer deleted successfully"))
        })

        const findUserSubbedAndSubs = asyncHandler(async(req,res)=>{
               const username =  req.params.params.trim()
               console.log(username)
                if(!username){
                        throw new apiError(400,"No username passed")
                }

                const countData= await user.aggregate(
                        [
                        {
                            $match:{
                                username:username
                        }},
// how many subscribers the channels has
                        {
                        $lookup:{
                             from:"subscriptions",
                             localField:"_id" ,
                             foreignField:"channel",
                             as:"subscribedMe"
                        }},

                        {$lookup:{
                               from:"subscriptions" ,
                               localField:"_id",
                                foreignField:"subscriber",
                                as:"subscribedTo"
                        }},
                        
                        {$addFields:{
                                subscribersCount:{
                                        $size:"$subscribedMe"
                                },

                                subscribedToCount:{
                                        $size:"$subscribedTo"
                                },

                                isSubscribed:{
                                        $cond:{
                                        if:{$in:[req.User?._id,"$subscribedMe.subscriber"]},
                                        then:true,
                                        else:false
                                        }
                                }
                        }},
                        {$project:{
                                username:1,
                                fullName:1,
                                subscribersCount:1,
                                subscribedToCount:1,
                                isSubscribed:1,
                                avatar:1,
                                coverImage:1,
                                email:1,
                        }}
                ])
                if(!findUserSubbedAndSubs){
                        throw new apiError(404,"Didnt find subs and subbedTo")
                }
        
                return res.status(200)
                .json(new apiResponse(200,countData,"subs and users found "))
        })



        const generateWatchHistory = asyncHandler( async(req,res)=>{
                const user = user.aggergate(
                        [
                                {
                                        $match:{
                                               _id:new mongoose.Types.ObjectId(req.User._id)
                                        }
                                },
                                {
                                      $lookup:{
                                        from:"videos",
                                        localField:"watchHistory",
                                        foreignField:"_id",
                                        as:"userWatches",
                                        pipeline:[
                                                {
                                                        $lookup:{
                                                                from:"users",
                                                                localField:"owner",
                                                                foreignField:"_id",
                                                                as:"owner",
                                                                pipeline:[
                                                                        {
                                                                                $project:{
                                                                                        username:1,
                                                                                        fullName:1,
                                                                                        avatar:1
                                                                                }
                                                                        }
                                                                       ]

                                                        }
                                                },
                        //     *************************************************************** ******************
                                                {
                                                        $addFields:{
                                                        owner:{
                                                                $first:"$owner"
                                                        }
                                                }
                                                }

                                        ]
                                      }
                                }
                        ]
                )

                res.status(200).json(new apiResponse(200,generateWatchHistory[0]),"watch history fetched successfully")
        })
export
   {registerUser,
        loginUser,
        logOutUser,
     updateAccessToken ,
     changeCurrentPassword,
      resetAvatar,
      getCurrentUser,
      changeUserName,
      deleteUser   ,
      findUserSubbedAndSubs ,
        generateWatchHistory   
        }