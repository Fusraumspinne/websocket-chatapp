import mongoose from "mongoose"

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Verbunden mit MongoDB")
    } catch (error) {
        console.error("Ein Fehler ist beim verbinden mit MongoDB aufgetreten: ", error)
    }
}