"use client"
import { trpc } from "@/app/_trpc/clinet"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { PropsWithChildren, useState } from "react"

const Provider = ({children}:PropsWithChildren) => {

    const [queryClient] = useState(()=> new QueryClient())
    const [trpcClient] = useState(()=>
        trpc.createClient({
            links:[
                httpBatchLink({
                    
                    url:"https://www.askmypdf.in/api/trpc",
                })
            ]
        })
    )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </trpc.Provider>
  )
}

export default Provider
