import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import{
    UpgradgeViewError,
    UpgradgeViewLoading,
    UpgradgeView
} from "@/modules/premium/ui/views/upgradge-views"

const Page = async() =>{

    const session = await auth.api.getSession({
        headers:await headers(),
    })

    if(!session)
    {
        redirect("/sign-in");
    }


    const quearyClient = getQueryClient();
    void quearyClient.prefetchQuery(
        trpc.premium.getCurrentSubscription.queryOptions(),
    )

    void quearyClient.prefetchQuery(
        trpc.premium.getProducts.queryOptions(),
    )
    return (
        <HydrationBoundary state={dehydrate(quearyClient)}>
            <Suspense fallback={<UpgradgeViewLoading/>}>
                <ErrorBoundary fallback={<UpgradgeViewError/> }> 
                    <UpgradgeView/>
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    );
}

export default Page;