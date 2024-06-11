import express from "express"; // Importing the Express.js framework
import cors from "cors"; // Importing the CORS middleware to enable cross-origin resource sharing
import cookieParser from "cookie-parser"; // Importing the cookie-parser middleware to parse cookies

const app = express(); // Creating an instance of the Express.js app

// Configuring CORS to allow requests from the specified origin and enabling credentials
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Configuring Express.js to parse JSON data from requests with a limit of 16KB
app.use(express.json({
    limit: "16kb"
}));

// Configuring Express.js to parse URL-encoded data from requests
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.router.js"

//routes declaration
app.use("/api/v1/users",userRouter)

export { app }; // Exporting the Express.js app instance

