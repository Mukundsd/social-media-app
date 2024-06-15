import { Router } from "express"; // Importing the Express.js Router
import { loginUser,logoutUser,registerUser } from "../controllers/user.controller.js"; // Importing the registerUser function from the user controller
import { upload } from "../middlewares/multer.middleware.js"; // Importing the upload middleware from the multer middleware
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

export default router; // Exporting the router instance