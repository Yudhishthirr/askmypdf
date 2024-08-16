"use client"

import { useRouter, useSearchParams } from 'next/navigation'

import { Loader2 } from 'lucide-react'
import { trpc } from '../_trpc/clinet'

const Page = () => {
  const router = useRouter()

  // const searchParams = useSearchParams()
  // const origin = searchParams.get('origin')
  const {data,isLoading} = trpc.authCallback.useQuery()
  
  if(data?.success == true){
    router.push('/dashboard')
    //console.log("Your are register in mogodb know you are go to dashboard MESAAGE FROM AUTH-CALL-BACK")
  }else{
    router.push('/api/auth/login?')
    //console.log("you go to first kind login page becouse you are not in both in db or kind MESAAGE FROM AUTH-CALL-BACK")
  }
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

export default Page
