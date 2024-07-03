import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import{User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


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
     if(!email&&!username){
          throw new ApiError(400,"email or username require")
     }
     const user=await User.findOne({$or:[{username},{email}]})
     if(!user){
          throw new ApiError(404,"user does not exist")
     }
     const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
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
     const options = {
          httpOnly: true,
          secure: true
      }
     return res.
     status(200).
     clearCookie("accessToken",options).
     clearCookie("refreshToken",options).
     json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
     const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
     if(!incomingRefreshToken){
          throw new ApiError(401,"unothorised requiest")
     }
     try {
          const decodedToken=jwt.verify(
               incomingRefreshToken,
               process.env.REFRESH_TOKEN_SECRET,
          )
          const user=await User.findById(decodedToken?._id)
          if(!user){
               throw new ApiError(401,"invalid refresh token")
          }
          
          
          if(incomingRefreshToken!==user?.refreshToken){
               throw new ApiError(401," refresh token is expired")
     
          }
          const options = {
               httpOnly: true,
               secure: true
           }
          const{accToken,refToken}=await generateTokens(user?._id)
          return res
          .staus(200)
          .cookie("accessToken",accToken,options)
          .cookie("refreshToken",refToken,options)
          .json(
               new ApiResponse(
                    200,
                    {
                         accToken,refToken
                    },
                    "Accesstoken refreshed"
               )
          )
     
     } catch (error) {
          throw new ApiError(400,error?.message||"reftoken is invalid")
     }
})
const changeCurrentPassword= asyncHandler(async(req,res)=>{
     const {oldPassword,newPassword}=req.body
     const user=await User.findById(req.user?._id)
     const isPasswordCorrect= await user.
     isPasswordCorrect(oldPassword)
     if(!isPasswordCorrect){
          throw new ApiError(400,"invalid password")
     }
     user.password=newPassword
     await user.save({validateBeforeSave:false})
     return res
     .status(200)
     .json(new ApiResponse(200,{},"password changed succesfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
     return res.
     status(200)
     .json(new ApiResponse(200,req.user,"usert fetched succesfully"))
})

const updateAccountDetail=asyncHandler(async(req,res)=>{
     const {fullName,email}=req.body
     if(!fullName||!email){
          throw new ApiError(400,"all field are required")
     }
     const user=await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set:{
                    fullName,
                    email
               }
          },
          {new:true}

     ).select("-password")
     return res.
     status(200).
     json(new ApiResponse(200,user,"account detain updates"))
})
const updateAvatar=asyncHandler(async(req,res)=>{
     const avatarLocalPath = req.file?.path
     if(!avatarLocalPath){
          throw new ApiError(400,"avatar file is missing")
     }
     const avatar = await uploadOnCloudinary(avatarLocalPath)
     if(!avatar.url){
          throw new ApiError(400,'error while uploading avatar')
     }
     const user=await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set:{
               avatar:avatar.url
            }    
          },
          {new:true}
     ).select("-password")
     return res.
     status(200).
     json(new ApiResponse(200,user,"avatar image updates"))

})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
     const {username}=req.params

     if(!username?.trim()){
          throw new ApiError(400,"username is missing")
     }
     const channel = await User.aggregate([
          {
               $match:{
                    username:username?.toLowerCase()
               }
          },
          {
               $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
               }
          },
          {
               $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
               }
          },
          {
               $addfield:{
                    subscribersCount:{
                         $size:"$subscribers"
                    },
                    channelsubscriberToCount:{
                         $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        if:{$in:[req.user._id,"$subscribers._id"]},
                        then:true,
                        else:false
                    }
                    
               }
          },
          {
               $project:{
                    fullName:1,
                    username:1,
                    subscribersCount:1,
                    channelsubscriberToCount:1,
                    avatar:1,
                    isSubscribed:1,
                    coverImage:1,
                    email:1

               }
          }
     ])
     if (!channel) {
          throw new ApiError(400,"chaneel does not exist")
     } 
     return res
     .status(200)
     .json(
          new ApiResponse(200,channel[0],"user channel featched succesfully")
     )
})
const getWatchHistory=asyncHandler(async(req,res)=>{
     const user=await User.aggregate([
          {
               $match:{
                    _id:new mongoose.Types.ObjectId(req.user._id)
               }
          },{
               $lookup:{
                    from:"videos",
                    localField:"watchHistory",
                    foreignField:'_id',
                    as:"watchHistory",
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
                                             fullName:1,
                                             username:1,
                                             avatar:1
                                        }
                                   }
                              ]
                         }
                        },
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
     ])
     return res.
     status(200).
     json(
          new ApiResponse(
               200,
               user[0].watchHistory,
               "watched history featched succsfully"
          )
     )
})
export {registerUser
     ,loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetail,
     updateAvatar,
     getUserChannelProfile,
     getWatchHistory

}