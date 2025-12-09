"use client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";


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
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4 ">
            <DataTable data={data} columns={columns}/>
            {data.length === 0 && (
                <EmptyState
                title="Create Your First Agent"
                description="Create an agent to join your Mettings. Each agent will follow your instructions and can interact with particepant during the call."
                />
            )}
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