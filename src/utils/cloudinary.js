import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUDNINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNINARY_API_KEY, 
    api_secret: process.env.CLOUDNINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath)return null
        //upload the file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has uploaded succesfuly
        //console.log("file is uploaded cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the localy saved temporay file as upload operation failed
        return null;
    }
}


export {uploadOnCloudinary}
