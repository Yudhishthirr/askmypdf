import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  kindId:string;
  username: string;
  email: string;
  stripeCustommerId:string;
  stripeSubscriptionId:string;
  stripePriceId:string;
  stripeCurrentPeriodEnd:Date;
  // file:File[]
}

// Updated User schema
const UserSchema: Schema<User> = new mongoose.Schema({

  kindId:{
    type:String,
    required:true,
    unique:true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    // unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  stripeCustommerId: {
    type: String,
    // unique: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
  },
  stripePriceId: {
    type: String,
    unique: true,
  },
  stripeCurrentPeriodEnd:{
    type: Date,
    unique:true
  },
  // file:[
  //   {
  //     type:Schema.Types.ObjectId,
  //     ref:"File"
  //   }
  // ]
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;
