import FileModel from "@/models/File";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from '@/lib/pinecone'
import { OpenAIEmbeddings } from "@langchain/openai";
// import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
// import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PineconeStore } from "@langchain/pinecone";
// import { PineconeStore } from 'langchain/vectorstores/pinecone'
const f = createUploadthing();
 

 

export const ourFileRouter = {

  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })

    .middleware(async ({ req }) => {     

      const {getUser} = getKindeServerSession();
      const user = await getUser();

      if(!user || !user.id)  throw new UploadThingError("Unauthorized");

      // here we get value by returning value from onUplodComplete function
      return {userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createFile = await FileModel.create({
        name:file.name,
        url:`https://utfs.io/f/${file.key}`,
        key:file.key,
        uploadstatus:"PROCESSING",
        userId:metadata.userId
      })
      console.log(typeof createFile._id);
      const idString = createFile._id!.toString();
      console.log(typeof idString);
      console.log("createed file id ",idString)




      try{
          const response = await fetch(`https://utfs.io/f/${file.key}`)
          console.log("core ts file response ",response)
          const bob = await response.blob()
          const loader = new PDFLoader(bob)
          const pageLevelDocs = await loader.load()


          if(pageLevelDocs){
            console.log("core ts pageLevelDocs ",pageLevelDocs)
          }else{
            console.log("core ts file error while page level docs")
          }

          const pineconeIndex = pinecone.Index("amp")
          
          console.log("pineconeIndex",pineconeIndex)
         

          const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004", // 768 dimensions
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            title: "Document title",
          });
          
          const pinecone_res = await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,
            {
              pineconeIndex,
              namespace: idString,
            }
          )
    
          if(pinecone_res){
            console.log("pinecone_res",pinecone_res)
          }else{
            console.log("pinecone_res not found ")
          }

           if(embeddings){
            console.log("embeddings",embeddings)
          }else{
            console.log("embeddings not found ")
          }
          
          const datares= await FileModel.findByIdAndUpdate(createFile._id,{$set:{uploadstatus:'SUCCESS'}})
          if(datares){
            console.log("upload status updated successfully",datares)
          }else{
            console.log("failld to update status")
          }

      } catch (error) {
        await FileModel.updateOne({_id:createFile._id},{$set:{uploadStatus:'FAILED'}})
      }


    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;