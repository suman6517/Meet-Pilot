"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewAgentDialog } from "./new-agent-dialog";
import { useState } from "react";
import { useAgentFilers } from "../../hooks/use-agents-filter";
import { AgentSearchFilter } from "./agent-search-filter";
import { DEFAULT_PAGE } from "@/constants";


//http://localhost:3000/agents?search=Name

export const AgentListHeader = () =>{
    const [filters , setFilters] = useAgentFilers();
    const [isDilogOpen , setiisDilogOpen] = useState(false);

    const isAnyFilterModified = !!filters.search;
    const onClearFilters = () =>{
        setFilters({
            search:"",
            page:DEFAULT_PAGE,
        });
    }

    return(
        <>
        <NewAgentDialog open={isDilogOpen} onOpenChange={setiisDilogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Agents</h5>
                <Button onClick={() => setiisDilogOpen(true)}>
                    <PlusIcon />
                    New Agent
                </Button>
            </div>
            <div className="flex items-center gap-x-2">
                <AgentSearchFilter/>
                {isAnyFilterModified && (
                    <Button variant="outline" size="sm" onClick={onClearFilters}> 
                        <XCircleIcon/>
                        Clear
                    </Button>
                )}
            </div>
        </div>
        </>
    );
}