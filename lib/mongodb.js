import mongoose from "mongoose"

export const connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to Database")
    }catch(error){
        console.log("Error connecting to Database: ", error)
    }
}