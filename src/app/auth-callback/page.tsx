"use client"

import { useRouter } from 'next/navigation'

import { Loader2 } from 'lucide-react'
import { trpc } from '../_trpc/clinet'

const Page = () => {
  const router = useRouter()
  const {data,isLoading} = trpc.authCallback.useQuery()
  

  if(isLoading){
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Setting up your account...
          </h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    )
  }
  if(data?.success == true){
    router.push('/dashboard')
   
  }else{
    router.push('/api/auth/login?')
   
  }
  
}

export default Page
