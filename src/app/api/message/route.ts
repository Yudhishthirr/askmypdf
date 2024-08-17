import { pinecone } from "@/lib/pinecone";
import { SendMessageValdator } from "@/lib/validators/sendMessageValidator";
import FileModel from "@/models/File";
import MessageModel from "@/models/Message";
import { TaskType } from "@google/generative-ai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai'
import { createStreamableValue } from "ai/rsc";
import {GoogleGenerativeAI } from "@google/generative-ai"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts"

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dbConnect from '@/db/dbConfig';

export const POST = async(req:NextRequest,res:NextResponse)=>{
    // end point to ask questio to pdf
    const body =await req.json()

    const {getUser}= getKindeServerSession()
    const user = await getUser()

    const userId = user?.id
    // const {id:userId} = user.id

    if(!userId) return new Response("Unauthorized",{status:401})
    
    const {fileId,message} = SendMessageValdator.parse(body)

    const file = await FileModel.findOne({_id:fileId,userId:userId})

    if(!file) return new Response("Not Foud",{status:401})
    
    await MessageModel.create({
        text:message,
        isUserMessage:true,
        userId:userId,
        fileId:fileId
    })
    
    // vectorize message

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
    });

    const pineconeIndex = pinecone.Index("amp")

    const vectorStores = await PineconeStore.fromExistingIndex(embeddings,{
        pineconeIndex,
        namespace:fileId
    })

    const results = await vectorStores.similaritySearch(message,4)
    const prevMessages  = await MessageModel.find({_id:fileId}).limit(5).sort({ createdAt: -1 })

    const formattedPrevMessages = prevMessages.map((msg)=>({
        role:msg.isUserMessage ? "user" as const : "assistant" as const,
        content:msg.text
    }))
    
    // const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    // const model = genai.getGenerativeModel({model:'gemini-pro'})

    
    
    const response = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      // maxRetries: 2,
      // other params...
    });
    

    const prompt = PromptTemplate.fromTemplate(
      `Use the following pieces of context (or previous conversaton if needed) 
      to answer the users question in markdown format. \nIf you don't know the answer,
      just say that you don't know, don't try to make up an answer.
      
      \n----------------\n 
      
      PREVIOUS CONVERSATION:

      ${formattedPrevMessages.map((message) => {
        if (message.role === 'user')
          return `User: ${message.content}\n`
        return `Assistant: ${message.content}\n`
      })}
      
      \n----------------\n

      CONTEXT:
      ${results.map((r) => r.pageContent).join('\n\n')}
      
      
      USER INPUT: {message}`
    );

    
    // const formattedPrompt = await prompt.format({
    //   message: "what is pyhon",
    // });

    // const prompt12 = ChatPromptTemplate.fromTemplate(formattedPrompt);
    
    const parser = new StringOutputParser();

    
    const chain = prompt.pipe(response).pipe(parser);

    const stream = await chain.stream({
      message: message,
    });

    // console.log("stream output :",stream)
    let FinalResponse = ''
    for await (const chunk of stream) {
      FinalResponse += chunk
      console.log(`${chunk}|`);
      // return chunk
      // return res.json({message:"hello"})
      // new Response (return chunk
    }
    if(FinalResponse){
      await MessageModel.create({
        text:FinalResponse,
        isUserMessage:false,
        userId:userId,
        fileId:fileId
      })
    }
    // return FinalResponse.content
    // console.log("this is my final response for database :", FinalResponse)
    // const stream = await chain.stream(prompt12);
    // const streamingTextResponse = await model.generateContentStream(formattedPrompt)
    // console.log(streamingTextResponse)

    // const airesponse = new StreamingTextResponse(GoogleGenerativeAIStream(streamingTextResponse))
    // console.log(airesponse)
    // return new StreamingTextResponse(streamingTextResponse)
    // const FinalResponse = await response.invoke(formattedPrompt)   

    
    // console.log("this is final output",FinalResponse.content)

    // if(FinalResponse){
    //   await MessageModel.create({
    //     text:FinalResponse.content,
    //     isUserMessage:false,
    //     userId:userId,
    //     fileId:fileId
    //   })
    //   return FinalResponse.content
    // }
    
}     
