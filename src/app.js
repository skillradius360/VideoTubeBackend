import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app=express()

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(cookieParser())
app.use(express.json({limit:"16kb"}))

import router from "./routes/user.routes.js"
import {videoRouter} from "./routes/video.routes.js"
import {commentRouter} from "./routes/comment.route.js"
import {Tweetrouter } from "./routes/tweet.route.js"
import { playlistRouter } from "./routes/playlist.routes.js"
import {likeRouter} from "./routes/like.routes.js"
import { subscriptionRouter } from "./routes/subscriptions.route.js"

app.use("/users",router)
app.use("/videos",videoRouter)
app.use("/comments",commentRouter)
app.use("/tweet",Tweetrouter)
app.use("/playlist",playlistRouter)
app.use("/like",likeRouter)
app.use("/subs",subscriptionRouter)

export {app}