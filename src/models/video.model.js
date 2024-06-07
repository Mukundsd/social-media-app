import mongoose, { Schema } from "mongoose"; // Importing Mongoose and Schema
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Importing mongoose-aggregate-paginate-v2 for pagination

const videoSchema = new Schema({ // Defining the video schema
    videoFile: { // Video file field
        type: String, // Data type: String (Cloudinary URL)
        required: true // Required field
    },
    thumbnail: { // Thumbnail field
        type: String, // Data type: String (Cloudinary URL)
        required: true // Required field
    },
    title: { // Title field
        type: String, // Data type: String
        required: true // Required field
    },
    description: { // Description field
        type: String, // Data type: String
        required: true // Required field
    },
    duration: { // Duration field
        type: Number, // Data type: Number
        required: true // Required field
    },
    views: { // Views field
        type: Number, // Data type: Number
        default: 0 // Default value: 0
    },
    isPublished: { // Is published field
        type: Boolean, // Data type: Boolean
        default: true // Default value: true
    },
    owner: { // Owner field
        type: Schema.Types.ObjectId, // Data type: ObjectId
        ref: "User" // Reference to the User model
    }
}, {
    timestamps: true // Enable timestamps for created and updated dates
});

videoSchema.plugin(mongooseAggregatePaginate); // Adding pagination plugin to the schema

export const Video = mongoose.model("Video", videoSchema); // Exporting the Video model