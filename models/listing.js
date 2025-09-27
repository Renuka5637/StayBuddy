const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
    {
        title:{
            type: String,
            required: true
        },
        description: String,
        image: {
        filename:{
            type:String
        },
        url:{
        type: String,
        default:
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
        set: (v) =>
        v === "" 
        ? "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D"
        : v,
    }
    },
        price: Number,
        location: String,
        country: String,
        reviews:[
            {
                type:Schema.Types.ObjectId,
                ref:"Review",
            }

        ],
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },

        category:{
            type:String,
            enum:["Trending","Rooms","Iconic Cities","Mountains","Castles","Arctic","Camping","Farms"]
        }
    }
);

listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema); 

module.exports = Listing; 