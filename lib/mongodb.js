import mongoose from "mongoose";

let isConnected = false;

export const connectMongoDB = async () => {
    if (isConnected) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            maxPoolSize: 10,
            minPoolSize: 1,
        });
        isConnected = true;
        console.log("Connected to Database");
    } catch (error) {
        console.log("Error connecting to Database: ", error);
    }
};