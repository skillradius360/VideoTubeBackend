import dotenv from "dotenv"
import dbConnect from "./db/index.js"
import {app} from "./app.js"

 dotenv.config({
    path:"./.env"
 })


dbConnect().then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log("express Connected!")

        app.on("error",()=>{
            console.log("something wrong occured with express listener")
        })

    })
}).catch((error)=>{
    console.log("Express Surely crashed!"+error)
})