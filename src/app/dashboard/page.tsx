
import Dashboard from "@/components/Dashboard";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/clinet'
import { Loader2 } from 'lucide-react'
import dbConnect from "@/db/dbConfig";
import UserModel from "@/models/User";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const page = async() => {

    const {getUser} = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    await dbConnect();

    const dbUser = await UserModel.findOne({kindId:user.id });

    if(!dbUser) redirect('/auth-callback?origin=dashboard')


    const subscriptionPlan = await getUserSubscriptionPlan()
    return <Dashboard subscriptionPlan={subscriptionPlan} />
}

export default page