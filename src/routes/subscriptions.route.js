import Router from "express"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    
} from "../controllers/subscriptions.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const subscriptionRouter = Router()

subscriptionRouter.route("/toggleSubscription/:channelId").get(verifyJWT,toggleSubscription)
subscriptionRouter.route("/getUserSubs/:channelId").get(verifyJWT,getUserChannelSubscribers)
subscriptionRouter.route("/getChannelsSubbed/:subscriberId").get(verifyJWT,getSubscribedChannels)



export {subscriptionRouter}