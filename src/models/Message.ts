import mongoose, { Schema, Document } from 'mongoose';


export interface Message extends Document {
    text: string;
    isUserMessage:boolean;
    userId: mongoose.Schema.Types.String;
    fileId: mongoose.Schema.Types.String;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new mongoose.Schema({
    text: {
      type: String,
      required: true,
      trim:true
    },
    isUserMessage: {
      type: Boolean,
      required: true,
    },
    userId:{
      type:Schema.Types.String,
      ref:"User",
      required:true
    },
    fileId:{
      type:Schema.Types.String,
      ref:"File",
      required:true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
});
  

const MessageModel = (mongoose.models.Message as mongoose.Model<Message>) || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;