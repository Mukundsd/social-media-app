import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateTokens=async(userid)=>{
     try {
         const user= await User.findById(userid) 
         const accessToken=user.generateAccessToken()
         const refreshToken=user.generateRefreshToken()
         user.refreshToken=refreshToken
         await user.save({validateBeforeSave:false})
         return {accessToken,refreshToken}
     } catch (error) {
          throw new ApiError(500,"something went wrong while generating tokens")
     }
}
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
          const existedUser= await User.findOne({
               $or:[{username},{email}]
          })
          if(existedUser){
               throw new ApiError(409,"user already exist")
          }
          const avatarLocalPath=req.files?.avatar[0]?.path;
          //const coverImageLocalPath=req.files?.coverImage[0]?.path;
          let coverImageLocalPath;
          if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
               coverImageLocalPath=req.files.coverImage[0].path
          }
          if (!avatarLocalPath) {
               throw new ApiError(400,"avatar image is required")
               
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
               password,
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

const loginUser=asyncHandler(async(req,res)=>{
     // get data from req body 
     // chake username || email
     // find user
     // chake password
     // generate access and refresh token
     // send them using cookies
     const {username,email,password}=req.body
     if(!email||!username){
          throw new ApiError(400,"email or username require")
     }
     const user=User.findOne({$or:[{username},{email}]})
     if(!user){
          throw new ApiError(404,"user does not exist")
     }
     const isPasswordValid=await user.isPasswordCorrect(password)
     if(!isPasswordValid){
          throw new ApiError(401,"invalid password")
     }
     const{accessToken,refreshToken}=await generateTokens(user._id)
     const loggedInUser=await User.findById(user._id).
     select("-password -refreshToken")
     const options={
          httpOnly:true,
          secure:true
     }
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
          new ApiResponse(
               200,
               {
                    user:loggedInUser,accessToken,
                    refreshToken
               },
               "user logged in succesfully "
          )
     )
})

const logoutUser= asyncHandler(async(req,res)=>{
     User.findByIdAndUpdate(
          req.user.id,
          {
               $set:{
                    refreshToken:undefined
               }
               
          },
          {
               new:true
          }
     )
     return res.
     status(200).
     clearCookie("accessToken",options).
     clearCookie("refreshToken",options).
     json(new ApiResponse(200,{},"user logged out"))
})

export {registerUser,loginUser,logoutUser}