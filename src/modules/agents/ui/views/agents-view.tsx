"use client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

export const AgentView =() =>{
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    // if(isLoading)
    // {
    //     return(
    //       <LoadingState
    //       title="Loading Agents"
    //       description="This may take a few second"
    //       /> 
    //     );
    // }

    // if(isError)
    // {
    //     return(
    //         <ErrorState 
    //         title="Failed to load agents"
    //         description="Please try again later"
    //         />
    //     )
    // }
    return(
        <div>
            {JSON.stringify(data, null, 2)}
        </div>
    );
};

export const AgenViewLoading = ()=>{
    return(
          <LoadingState
          title="Loading Agents"
          description="This may take a few second"
          /> 
    );
}

export const AgenViewError = ()=>{
    return(
        <ErrorState 
            title="Failed to load agents"
            description="Please try again later"
            />
    );
}