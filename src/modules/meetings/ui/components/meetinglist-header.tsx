"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon} from "lucide-react";
import { useState } from "react";
import { NewMeetingDialog } from "./new-meeting-dialog";



//http://localhost:3000/agents?search=Name

export const MeetingsListHeader = () =>{

    const[isDilogOpen , setIsDilogOpen] = useState(false);
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
            <div className="flex items-center gap-x-2">
                Todo: Filters
            </div>
        </div>
        </>
    );
}