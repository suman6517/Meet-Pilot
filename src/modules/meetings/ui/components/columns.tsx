"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MeetingGetMany } from "../../types"
import { GeneratedAvatar } from "@/components/generated-avater"
import { 
    CircleCheckIcon,
    CircleXIcon,
    ClockArrowUpIcon,
    ClockFadingIcon,
    CornerDownRightIcon,
    LoaderIcon,
 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import humanizeDuration from "humanize-duration";
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

function formatDuration(seconds:number)
{
    return humanizeDuration (seconds *1000 ,{
        largest:1,
        round:true,
        units:["h" , "m" , "s"],
    });
};

const statusIconMap ={
    upcoming:ClockArrowUpIcon,
    active:LoaderIcon,
    complited:CircleCheckIcon,
    processing:LoaderIcon,
    cancled: CircleXIcon
};

const statusColorMap ={
    upcoming:"bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
    active:"bg-blue-500/20 bg-blue-800 bg-blue-800/5",
    complited:"bg-emerald-500/20 bg-emerald-800 bg-emerald-800/5",
    cancled:"bg-rose-500/20 bg-rose-800 bg-rose-800/5",
    processing:"bg-gray-500/20 bg-gray-800 bg-gray-800/5",
}




export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell:({row}) => (
        <div className="flex flex-col gap-y-1">
            <span className="font-semibold capitalize">{row.original.name}</span>
                <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-1">
                    <CornerDownRightIcon className="size-3 text-muted-foreground"/>
                    <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
                        {row.original.agent.name}
                    </span>
                    </div>
                    <GeneratedAvatar 
                    variant="botttsNeutral"
                    seed={row.original.agent.name}
                    className="size-4"
                    />
                    <span className="text-sm text-muted-foreground">
                        {row.original.startedAt ? format(new Date(row.original.startedAt), "MMM d"): ""}
                    </span>
                </div>
            </div>
    )
  },
  {
    accessorKey: "status",
    "header":"Status",
    cell:({row}) => {
      const Icon = statusIconMap[row.original.status as keyof typeof statusIconMap];
      
      return (
        <Badge variant="outline" className={cn("capitalize [&>svg]:size-4 text-muted-foreground",
            statusColorMap[row.original.status as keyof typeof statusColorMap]
        )}>
          <Icon className={cn(
            row.original.status === "processing" && "animate-spin"
          )}/>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "duration",
    header:"Duration",
    cell:({row}) => {
      return (
        <Badge variant="outline" className="capitalize [&>svg]:size-4 flex items-center gap-x-2">
          <ClockFadingIcon className="text-blue-700"/>
          {row.original.duration ? formatDuration(row.original.duration) : "No Duration"}
        </Badge>
      );
    },
  }
]