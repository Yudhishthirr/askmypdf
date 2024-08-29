import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import dbConnect from '@/db/dbConfig';
import UserModel from '@/models/User';
import FileModel from '@/models/File';
import { PLANS } from '@/config/stripe'
import {z} from "zod"
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import MessageModel from '@/models/Message';
//import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan,stripe } from '@/lib/stripe';
export const appRouter = router({
    authCallback:publicProcedure.query(async ()=>{
        const {getUser} = getKindeServerSession()
        const user =await getUser()
        if(!user || !user.id){
            // return {success: false,code:"UNAUTHORIZED"}
            return {success: false}
        //   throw new TRPCError({code:"UNAUTHORIZED"})
        }
        await dbConnect();

        const dbuser = await UserModel.findOne({ kindId:user.id });

        if(!dbuser)
        {
            const newUser = new UserModel({
            kindId:user.id,
            username:user.given_name,
            email:user.email,
            }); 
            await newUser.save(); 
            
            
        }
        
        return { success: true }
        
       

    }),
    // accepting ctx where we passed from miidlaee ware
    // Dashboard componetns
    getUserFiles:privateProcedure.query(async ({ctx})=>{
        const {userId} = ctx
        await dbConnect()
        // console.log(userId);
        return await FileModel.find({userId:userId})
        // return await 
    }),
// chat wrapper
    getFileUploadStatus:privateProcedure
    .input(z.object({fileId:z.string()}))
    .query(async({ctx,input})=>{
        const {userId} = ctx
        await dbConnect();
        const file = await FileModel.findOne({_id:input.fileId,userId:userId})
        
        if(!file) return {status:"PENDING" as const}
        // return file.uploadstatus
        // const status = 
        return {status:file.uploadstatus}
    }),
    // Upload Button 
    getFile:privateProcedure
        .input(z.object({key:z.string()}))
        .mutation(async({ctx,input})=>{

        const {userId} = ctx
        await dbConnect();
        const file = await FileModel.findOne({key:input.key,userId:userId})

        if(!file){
            throw new TRPCError({code:"NOT_FOUND"})
            // return {success: false,code:"NOT_FOUND"}
        }else{
            return file
        }
    }),
// Dashboard componetns
    deleteFile:privateProcedure.input(z.object({id:z.string()})
    ).mutation(async({ctx,input})=>{

        const {userId} = ctx
        await dbConnect();
        const file = await FileModel.findOne({_id:input.id,userId:userId})
        if(!file){
            return {success: false,code:"NOT_FOUND"}
        }

        await FileModel.deleteOne({_id:input.id})

        return file
    }),

    createStripeSession: privateProcedure.mutation(
        async({ctx})=>{
        const { userId } = ctx
        //const billingUrl = absoluteUrl('/dashboard/billing')
        const billingUrl = 'https://www.askmypdf.in/dashboard/billing'
        if (!userId)
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        console.log("createStripeSession :",userId)
        await dbConnect()
        const dbUser = await UserModel.findOne({kindId:userId})

        if (!dbUser)
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        // console.log("createStripeSession afert user found:",dbUser)
        const subscriptionPlan = await getUserSubscriptionPlan()

        if (subscriptionPlan.isSubscribed && dbUser.stripeCustommerId) {

            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: dbUser.stripeCustommerId,
                return_url: billingUrl,
            })
    
            return { url: stripeSession.url }
        }


        const stripeSession = await stripe.checkout.sessions.create(
        {
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ['card', 'paypal'],
          mode: 'subscription',
          billing_address_collection: 'auto',
          line_items: [
            {
              price: PLANS.find((plan) => plan.name === 'Pro')?.price.priceIds.test,
              quantity: 1,
            },
          ],
          metadata: {userId: userId},
        })
        return { url: stripeSession.url }
    }),

    // Messages Chat Componets
    getFileMessages: privateProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).nullish(),
                cursor: z.string().nullish(),
                fileId: z.string(),
            })
        )
        .query(async({ctx,input})=>{
            const {userId} = ctx
            const { fileId, cursor } = input
            // const { fileId } = input
            const limit = input.limit ?? INFINITE_QUERY_LIMIT
            
            cursor: cursor ? { id: cursor } : undefined


            await dbConnect();
            const file = await FileModel.findOne({_id:fileId},{userId:userId})
            if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
            
            const messages = await MessageModel
            .find({fileId:fileId})
            .sort({createdAt:-1})
            .limit(limit)
            .select('id isUserMessage createdAt text')

            let nextCursor: typeof cursor | undefined = undefined

            if (messages.length > limit) {
                const nextItem = messages.pop()
                nextCursor = nextItem?.id
            }
            
            return {
                messages,
                nextCursor,
            }
        })
        

});

export type AppRouter = typeof appRouter;
