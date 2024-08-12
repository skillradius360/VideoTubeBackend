import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"
import dotenv from "dotenv"
import {app} from "../app.js"

async function dbConnect(){

    try{
    let connection = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
    app.on("error",(error)=>{
        console.log("error occured")
        throw error
        })
    console.log("connection to database succeeded at ",connection.connection.host)
    }
    
    catch(error){
        console.log("error occured in database")
        throw error
    }
}

export default dbConnect