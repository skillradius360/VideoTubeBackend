import {Router} from "express"
import { registerUser,logOutUser, loginUser,updateAccessToken,resetAvatar, findUserSubbedAndSubs
  ,generateWatchHistory,changeCurrentPassword, changeUserName,deleteUser,getCurrentUser} from "../controllers/login.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router() 

router.route("/signUp").post(upload.fields([
    {
      name:"avatar",maxCount:1  
    },{
        name:"coverImage", maxCount:1
    }
]),registerUser)


router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refreshAccess").patch(updateAccessToken)

router.route("/updateAvatar").post(verifyJWT,upload.fields([
  {name:"avatar",maxCount:1}
])
,resetAvatar)

router.route("/changePassword").patch(verifyJWT,changeCurrentPassword)
router.route("/changeUserName").patch(verifyJWT,changeUserName)
router.route("/deleteUSer").delete(verifyJWT,deleteUser)
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
router.route("/findSubsAndSubbed/:params").get(verifyJWT,findUserSubbedAndSubs)
router.route("/generateWatchHistory").get(verifyJWT,generateWatchHistory)


export default router