import {z} from "zod";

export const mettingInsertSchema = z.object({
    name:z.string().min(1,{message :"Name Is Required"}),
    agentId:z.string().min(1,{message :"Agent Is Required"}),
});

export const mettingsUpdateSchema = mettingInsertSchema.extend({
    id:z.string().min(1,{message: "Id is required"}),
})