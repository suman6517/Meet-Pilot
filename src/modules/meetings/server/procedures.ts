import{z} from "zod";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter , baseProcedure, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike , sql} from "drizzle-orm";
import { DEFAULT_PAGE, MIN_PAGE_SIZE , MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE} from "@/constants";
import { TRPCError } from "@trpc/server";
import { mettingInsertSchema, mettingsUpdateSchema } from "../schemas";
import { duration } from "drizzle-orm/gel-core";
import { MeetingStatus } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvaterUri } from "@/lib/avater";

export const meetingsRouter = createTRPCRouter ({


    generateToken: protectedProcedure.mutation(async ({ctx}) =>{
        await streamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                name:ctx.auth.user.name,
                role: "admin",
                image:
                    ctx.auth.user.image ??
                    generateAvaterUri({seed : ctx.auth.user.name , varriant: "initials"}),
            },
        ]);

        const expirationTime = Math.floor(Date.now() /1000) +3600; // 1 hour
        const issuedAt = Math.floor(Date.now() /1000) -60;

        const token = streamVideo.generateUserToken({
            user_id:ctx.auth.user.id,
            exp:expirationTime,
            validity_in_seconds:issuedAt
        })

        return token;
    }),


    remove:protectedProcedure
    .input(z.object({id:z.string() }))
    .mutation(async ({ctx, input}) =>{
        const[removeMeeting]= await db
        .delete(meetings)
        .where(
            and(
                eq(meetings.id , input.id),
                eq(meetings.userId , ctx.auth.user.id),
            )
        ).returning();
        if(!removeMeeting)
            {
                throw new TRPCError({
                    code:"NOT_FOUND",
                    message:"Meeting not found",
                });
            }
        return removeMeeting;
    }),





    update:protectedProcedure
    .input(mettingsUpdateSchema)
    .mutation(async ({ctx, input}) =>{
        const[updatedMeeting]= await db
        .update(meetings)
        .set(input)
        .where(
            and(
                eq(meetings.id , input.id),
                eq(meetings.userId , ctx.auth.user.id),
            )
        ).returning();
        if(!updatedMeeting)
            {
                throw new TRPCError({
                    code:"NOT_FOUND",
                    message:"Meeting not found",
                });
            }
        return updatedMeeting;
    }),

    create:protectedProcedure
    .input(mettingInsertSchema)
    .mutation(async ({input , ctx}) =>{
      const [createdMeeting] = await db.insert(meetings)
                                     .values({
                                        ...input, 
                                        userId:ctx.auth.user.id,
                                     })
                                     .returning();


        //Todo: - Creat Stream Call , Upseart Stream User
        const call = streamVideo.video.call("default" , createdMeeting.id);

        await call.create({
            data:{
                created_by_id: ctx.auth.user.id,
                custom:{
                    meetingId:createdMeeting.id,
                    meetingName: createdMeeting.name
                },
                settings_override:{
                    transcription:{
                        language:"en",
                        mode:"auto-on",
                        closed_caption_mode:"auto-on"
                    },
                recording:{
                    mode:"auto-on",
                    quality:"1080p",
                },
                },
            },
        });

        const[existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId));


        if(!existingAgent)
        {
            throw new TRPCError({
                code:"NOT_FOUND",
                message: "Agent not found"
            });

            await streamVideo.upsertUsers([
                {
                    id:existingAgent.id,
                    name:existingAgent.name,
                    role:"user",
                    image:generateAvaterUri({
                        seed:existingAgent.name,
                        varriant:"botttsNeutral",
                    })
                }
            ]);
        }

         return createdMeeting;
    }),



    getOne: protectedProcedure
    .input(z.object({id:z.string() }))
    .query(async ({input , ctx}) =>{
        const [existingMeeting] =  await db
        .select({
            ...getTableColumns(meetings),
            agent:agents,
            duration: sql<number> `EXTRACT(EPOCH FROM(ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents , eq(meetings.agentId , agents.id))
        .where(
            and(
            eq(meetings.id , input.id),
            eq(meetings.userId , ctx.auth.user.id),

        )
        );
        if(!existingMeeting)
        {
             throw new TRPCError({code:"NOT_FOUND", message:"Meeting not found"});
        }

        return existingMeeting;
    }),

    


    
    getMany: protectedProcedure
     .input(
        z.object({
         page: z.number().default(DEFAULT_PAGE),
         pageSize: z.number()
           .min(MIN_PAGE_SIZE)
           .max(MAX_PAGE_SIZE)
           .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agenId: z.string().nullish(),
        status: z.
        enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
        ]).nullish(),

     })
    )

    .query(async ({ctx , input}) =>{
        const {search , page , pageSize , status, agenId} = input;
        const searchCondition = search && search.trim() ? ilike(meetings.name , `%${search.trim()}%`) : undefined;
        
        const data =  await db
        .select({
            // Change to Actual Count
            ...getTableColumns(meetings),
            agent:agents,
            duration: sql<number> `EXTRACT(EPOCH FROM(ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents , eq(meetings.agentId , agents.id))
        .where(
            and(
                eq(meetings.userId , ctx.auth.user.id),
                search? ilike(meetings.name , `%${search}%`) : undefined,
                status ? eq(meetings.status , status) : undefined,
                agenId ? eq(meetings.agentId , agenId) : undefined,
            )
        )
        .orderBy(desc(meetings.createdAt) , desc(meetings.id))
        .limit(pageSize)
        .offset((page -1) *pageSize)

        const [total] = await db
        .select({count:count()})
        .from(meetings)
        .innerJoin(agents , eq(meetings.agentId , agents.id))
        .where (
            and(
                eq(meetings .userId , ctx.auth.user.id),
                search? ilike(meetings.name , `%${search}%`) : undefined,
                status ? eq(meetings.status , status) : undefined,
                agenId ? eq(meetings.agentId , agenId) : undefined,
            )
        );
        const totalPages = Math.ceil(total.count / pageSize);


        return {
            items:data,
            total:total.count,
            totalPages
        }
    }),
});