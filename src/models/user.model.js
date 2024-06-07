import mongoose, { Schema } from "mongoose"; // Importing Mongoose and Schema
import jwt from "jsonwebtoken"; // Importing JSON Web Token for authentication
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing

const userSchema = new Schema({ // Defining the user schema
    username: { // Username field
        type: String, // Data type: String
        required: true, // Required field
        unique: true, // Unique username
        lowercase: true, // Convert to lowercase
        trim: true, // Trim whitespace
        index: true // Create an index for efficient querying
    },
    email: { // Email field
        type: String, // Data type: String
        required: true, // Required field
        unique: true, // Unique email
        lowercase: true, // Convert to lowercase
        trim: true // Trim whitespace
    },
    fullname: { // Full name field
        type: String, // Data type: String
        required: true, // Required field
        trim: true, // Trim whitespace
        index: true // Create an index for efficient querying
    },
    avatar: { // Avatar field
        type: String, // Data type: String
        required: true // Required field (Cloudinary URL)
    },
    coverImage: { // Cover image field
        type: String // Data type: String (Cloudinary URL)
    },
    watchHistory: [ // Watch history field
        {
            type: Schema.Types.ObjectId, // Data type: ObjectId
            ref: "Video" // Reference to the Video model
        }
    ],
    password: { // Password field
        type: String, // Data type: String
        required: [true, "password is required"] // Required field with error message
    },
    refreshToken: { // Refresh token field
        type: String // Data type: String
    }
}, {
    timestamps: true // Enable timestamps for created and updated dates
});

userSchema.pre("save", async function(next) { // Pre-save hook
    if (!this.isModified("password")) return next(); // Skip if password is not modified
    this.password = await bcrypt.hash(this.password, 10); // Hash password with bcrypt
    next(); // Continue with the save operation
});

userSchema.method.isPasswordCorrect = async function(password) { // Method to check password correctness
    return await bcrypt.compare(password, this.password); // Compare password with hashed password
};

userSchema.method.generateAccessToken = async function() { // Method to generate access token
    return jwt.sign({ // Sign a JSON Web Token
        _id: this._id, // User ID
        email: this.email, // User email
        username: this.username, // User username
        fullname: this.fullname // User full name
    }, process.env.ACCESS_TOKEN_SECRET, { // Secret key and options
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiration time
    });
};

userSchema.method.generateRefreshToken = async function() { // Method to generate refresh token
    return jwt.sign({ // Sign a JSON Web Token
        _id: this._id // User ID
    }, process.env.REFRESH_TOKEN_SECRET, { // Secret key and options
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Token expiration time
    });
};

export const User = mongoose.model("User", userSchema); // Export the User model