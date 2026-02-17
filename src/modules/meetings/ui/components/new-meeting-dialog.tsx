import { ResponsiveDialog } from "@/components/reponsive-dilog";
import { MeetingForm } from "./meeting-form";
import { useRouter } from "next/navigation";

interface newMeetingDialogProps{
    open:boolean;
    onOpenChange:(open:boolean) =>void;
}

export const NewMeetingDialog = ({
    open,
    onOpenChange
}:newMeetingDialogProps)=>{
    const router =useRouter();
    return(
        <ResponsiveDialog
        title="New Meeting"
        description="Create a new Meeting"
        open={open}
        onOpenChange={onOpenChange}
        >
            <MeetingForm
            onSuccess={(id) => {
                onOpenChange(false);
                router.push(`/meetings/${id}`);
            }}
            onCancel={() => onOpenChange}
            />
        </ResponsiveDialog>
    )                                                                                   
};