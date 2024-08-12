import ChatWrapper from "@/components/chat/ChatWrapper"
import PdfRenderer from "@/components/PdfRenderer"
import dbConnect from "@/db/dbConfig"
import FileModel from "@/models/File"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"

interface PageProps{
    params:{
        fileid:string
    }
}

const page = async({params}:PageProps) => {

    const {fileid}  = params
    
    const { getUser } = getKindeServerSession()
    const user =await getUser()

    if (!user || !user.id)
        redirect(`/auth-callback?origin=dashboard/${fileid}`)
    await dbConnect()
    
    const file = await FileModel.findOne({_id:fileid,userId:user.id})
    // console.log("file",file)
    if (!file) notFound()


    return (
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
                {/* Left sidebar & main wrapper */}
                <div className='flex-1 xl:flex'>
                <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                    {/* Main area */}
                   
                    <PdfRenderer url={file.url}/>
                   
                    
                </div>
                </div>

                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
                <ChatWrapper fileId={fileid} isSubscribed={false}/>
                
                </div>
            </div>
        </div>
    )    
}

export default page