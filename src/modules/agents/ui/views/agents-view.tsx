"use client";
import {useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentFilers } from "../../hooks/use-agents-filter";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";


export const AgentView =() =>{
    const router = useRouter(); 
    const [filters , setFilters] = useAgentFilers();
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters,
    }));

    return(
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4 ">
            <DataTable 
            data={data.items} 
            columns={columns}
            onRowClick={(row) => router.push(`/agents/${row.id}`)}
            />
            <DataPagination
            page={filters.page}
            totalPages={data.totalPages}
            onPageChange={(page) => setFilters({page})}
            />
            {data.items.length === 0 && (
                <EmptyState
                title="Create Your First Agent"
                description="Create an agent to join your Mettings. Each agent will follow your instructions and can interact with particepant during the call."
                />
            )}
        </div>
    );
};

export const AgentViewLoading = ()=>{
    return(
          <LoadingState
          title="Loading Agent"
          description="This may take a few second"
          /> 
    );
}

export const AgentViewError = ()=>{
    return(
        <ErrorState 
            title="Error Loading Agent"
            description="Please try again later"
            />
    );
}