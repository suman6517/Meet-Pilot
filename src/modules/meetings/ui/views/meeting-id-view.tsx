"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import {useConfirm} from "@/hooks/use-confirm"
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { useState } from "react";

interface Props {
     meetingId:string
}

export const MeetingIdView = ({meetingId}:Props) =>
{

    const trpc = useTRPC();
    const quearyClient = useQueryClient();
    const router = useRouter();


    const[RemoveConfirmation , confirmRemove ] = useConfirm(
        "Are You Sure?",
        "The following action will remove this meeting"
    );

    const [updateMeetingDilogOpen , setupdateMeetingDilogOpen] = useState(false);

    const {data} = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({id:meetingId})
    );


    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess:() => {
                quearyClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push("/meetings");

                // Todo: invalidate free tier usage
            },
        }),
    );

    const handleremoveMeeting = async () =>{
        const ok = await confirmRemove();

        if(!ok) return;

        await removeMeeting.mutateAsync({id:meetingId});
    }

    return(
        <>
        <RemoveConfirmation/>
        <UpdateMeetingDialog
        open={updateMeetingDilogOpen}
        onOpenChange={setupdateMeetingDilogOpen}
        initialValues={data}
        />
        <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <MeetingIdViewHeader
            meetingID={meetingId}
            meetingName={data.name}
            onEdit={() =>setupdateMeetingDilogOpen(true)}
            onRemove={handleremoveMeeting}
            />
            {JSON.stringify(data, null ,2)}
        </div>
        </>
    )
};


export const MeetingIdViewLoading = () =>
{
    return(
        <LoadingState 
        title="Loading Meeting"
        description="It May Take A Few Secounds"
        />   
)
}


export const MeetingIdViewError = () =>
{
        return(
            <ErrorState 
            title="Error Loading Meeting"
            description="Please try again later"
            />   
    )
    }