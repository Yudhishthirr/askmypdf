import { NextRequest } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import MessageModel from "@/models/Message";
import dbConnect from "@/db/dbConfig";
import mongoose  from "mongoose";

export const GET = async (req: NextRequest) => {


  await dbConnect()
  // Assuming you have a Mongoose model called `MyModel`
  const deleted = await MessageModel.deleteMany()
 
  
}