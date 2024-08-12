import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_APIKEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_APISECRET
});

const cloudUploader = async function(filepath){
    try{
        if(!filepath) return "no file to upload"
        let response = await cloudinary.uploader.upload(filepath,{
            resource_type:"auto"
        })

        fs.unlinkSync(filepath)
        console.log("filepath removed successfully")
        return response
    }
    catch(error){
        fs.unlinkSync(filepath)
        return "file removed due to error ",error
    }
}


// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )

export {cloudUploader}