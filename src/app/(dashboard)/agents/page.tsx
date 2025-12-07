import { AgentView, AgenViewError, AgenViewLoading } from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page =() =>{
    const quearyClient = getQueryClient();
    void quearyClient.prefetchQuery(trpc.agents.getMany.queryOptions());


    return (
        <HydrationBoundary state={dehydrate(quearyClient)}>
            <Suspense fallback={<AgenViewLoading/>}>
            <ErrorBoundary fallback={<AgenViewError/>}>
            <AgentView/>
            </ErrorBoundary>
            

            </Suspense>
            
        </HydrationBoundary>
    
);
}
export default Page; 

