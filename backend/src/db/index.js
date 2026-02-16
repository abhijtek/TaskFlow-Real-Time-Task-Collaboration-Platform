import mongoose from "mongoose"

// you could diorectly use mogoose.process .. but tha comes with error so wrap it up in try catch

const connectDB = async()=>{
    
try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB Connected");
    
} catch (error) {
    console.log("Mongo DB connection error",error)
    process.exit(1);
}
}

export default connectDB;