import mongoose, {Schema, models} from "mongoose"

const messageSchema = new Schema(
    {
        message: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        roomName: {
            type: String,
            required: true
        },
        timestamp: {
            type: String,
            required: true
        },
    },
    {timestamps: true}
)

const Message = models.Message || mongoose.model("Message", messageSchema)

export default Message