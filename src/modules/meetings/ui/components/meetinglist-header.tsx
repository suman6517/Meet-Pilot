"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon , XCircleIcon} from "lucide-react";
import { useState } from "react";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import { StatusFilter } from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";
import { useMeetingsFilers } from "../../hooks/use-meetings-filter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";



//http://localhost:3000/agents?search=Name

export const MeetingsListHeader = () =>{

    const[isDilogOpen , setIsDilogOpen] = useState(false);
    const [filters , setFilters] = useMeetingsFilers();


    const isAnyFilterModified = 
    !!filters.status || !!filters.search || !!filters.agentId;

    const onCleaFilter = () =>{
        setFilters({
            status:null,
            agentId:"",
            search:"",
            page:1
        });
    }

    return(
        <>
          <NewMeetingDialog open={isDilogOpen} onOpenChange={setIsDilogOpen}/>

        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Meetings</h5>
                <Button onClick={() => setIsDilogOpen(true)}>
                    <PlusIcon />
                    New Meeting
                </Button>
            </div>

            <ScrollArea>
            <div className="flex items-center gap-x-2">
               <MeetingsSearchFilter/>
               <StatusFilter/>
               <AgentIdFilter/>
               {
                isAnyFilterModified && (
                    <Button variant="outline" onClick={onCleaFilter}>
                        <XCircleIcon className="size-4"/>
                        Clear
                    </Button>
                )
               }
            </div>
            <ScrollBar orientation="horizontal"/>
            </ScrollArea>
        </div>
        </>
    );
}