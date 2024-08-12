import mongoose, { Schema, Document } from 'mongoose';


enum uploadstatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    FAILED = 'FAILED',
    SUCCESS = 'SUCCESS'
}

export interface File extends Document {
    name: string;
    url:string;
    key:string;
    uploadstatus:uploadstatus;
    userId?: mongoose.Schema.Types.String;
    createdAt: Date;
}

const FileSchema: Schema<File> = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    uploadstatus:{
      type:String,
      enum:uploadstatus
    },
    userId:{
      type:Schema.Types.String,
      ref:"User",
      required:true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
});
  

const FileModel = (mongoose.models.File as mongoose.Model<File>) || mongoose.model<File>('File', FileSchema);

export default FileModel;