import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser=asyncHandler(async(req,res)=>{
     //get user detail from frontend
     //validation - not empty
     //chake if user already exist:username, email
     //chake for images and avatar
     //upload them to cloudnari, avatar
     //create user object - create entry in db
     //remove password and refresh token field from response
     //cheake for user creation
     const {fullname,email,username,password}=req.body
     console.log("email : ",email)
     if([fullname,email,username,password].some((field)=>
          field?.trim()==="")){
               throw new ApiError(400,"All field are required")
          }
          const existedUser=User.findOne({
               $or:[{username},{email}]
          })
          if(existedUser){
               throw new ApiError(409,"user already exist")
          }
          const avatarLocalPath=req.files?.avatar[0]?.path;
          const coverImageLocalPath=req.files?.coverImage[0]?.path;
          if (!avatarLocalStorage) {
               throw new ApiError(400,"avatarimage is required")
               
          }
          const avatar=await uploadOnCloudinary(avatarLocalPath)
          const coverImage=await uploadOnCloudinary(coverImageLocalPath)
          if(!avatar){               
               throw new ApiError(400,"avatarimage is required")
          }
          const user=await User.create({
               fullname,
               avatar:avatar.url,
               coverImage:coverImage?.url||"",
               email,
               username:username.toLowerCase(),
               
          })
          const createUser= await User.findById(user._id).select(
               "-password -refreshToken"
          )
          if(!createUser){
               throw new ApiError(500,"something went wrong with database")
          }
          return res.status(201).json(
               new ApiResponse(200,createUser,"user registerd succesfully")
          )
})
export {registerUser}