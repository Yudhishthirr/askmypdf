import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();
const middlware = t.middleware

const isAuth = middlware(async (opts:any)=>{

    const {getUser} = getKindeServerSession()
    const user =await getUser()

    if(!user || !user.id){
        return {success: false,code:"UNAUTHORIZED"}
    }
    // we are passing values to one middlere were to anothr 
    return opts.next({
        ctx:{
            userId:user.id,
            user,
        }
    })
})

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth)
// it when is used is private end point it make sure is user is authenticated