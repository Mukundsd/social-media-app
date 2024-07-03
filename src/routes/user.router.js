import { Router } from "express"; // Importing the Express.js Router
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails
} from "../controllers/user.controller.js";import { upload } from "../middlewares/multer.middleware.js"; // Importing the upload middleware from the multer middleware
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router(); // Creating a new instance of the Express.js Router

// Defining a route for registering a new user
router.route("/register").post(
    // Uploading files using the multer middleware
    upload.fields([
        { name: "avatar", maxCount: 1 }, // Uploading a single avatar file
        { name: "coverImage", maxCount: 1 } // Uploading a single cover image file
    ]),
    registerUser // Calling the registerUser function to handle the registration process
);
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
//router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router; // Exporting the router instance