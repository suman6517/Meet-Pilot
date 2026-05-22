import{z} from "zod";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter , baseProcedure, protectedProcedure, premiumProcedure } from "@/trpc/init";
import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, MIN_PAGE_SIZE , MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE} from "@/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter ({


    update:protectedProcedure
            .input(agentsUpdateSchema)
            .mutation(async ({ctx, input}) =>{
                const[updatedAgent]= await db
                .update(agents)
                .set(input)
                .where(
                    and(
                        eq(agents.id , input.id),
                        eq(agents.userId , ctx.auth.user.id),
                    )
                ).returning();
                if(!updatedAgent)
                    {
                        throw new TRPCError({
                            code:"NOT_FOUND",
                            message:"Agent not found", 
                        });
                    }
                return updatedAgent;
            }),

    remove:protectedProcedure
        .input(z.object({id: z.string() }))
        .mutation(async ({ctx, input}) =>{
            const[removeAgent]= await db
                .delete(agents)
                .where(
                    and(
                        eq(agents.id , input.id),
                        eq(agents.userId , ctx.auth.user.id),
                    ),
                ).returning();
                if(!removeAgent)
                {
                    throw new TRPCError({
                        code:"NOT_FOUND",
                        message:"Agent not found",
                    });
                }
                return removeAgent;
        }),

    getOne: protectedProcedure.input(z.object({id:z.string() })).query(async ({input , ctx}) =>{
        const [existingAgent] =  await db
        .select({
            // Change to Actual Count

            meetingCount:sql<number>`6`,
            ...getTableColumns(agents)
        })
        .from(agents)
        .where(
            and(
            eq(agents.id , input.id),
            eq(agents.userId , ctx.auth.user.id),

        )
        );
        if(!existingAgent)
        {
             throw new TRPCError({code:"NOT_FOUND", message:"Agent not found"});
        }

        return existingAgent;
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
     })
    )

    .query(async ({ctx , input}) =>{
        const {search , page , pageSize} = input;
        const searchCondition = search && search.trim() ? ilike(agents.name , `%${search.trim()}%`) : undefined;
        
        const data =  await db
        .select({
            // Change to Actual Count

            meetingCount:sql<number>`6 `,
            ...getTableColumns(agents)
        })
        .from(agents)
        .where(
            and(
                eq(agents.userId , ctx.auth.user.id),
                searchCondition
            )
        )
        .orderBy(desc(agents.createdAt) , desc(agents.id))
        .limit(pageSize)
        .offset((page -1) *pageSize)

        const [total] = await db
        .select({count:count()})
        .from(agents)
        .where (
            and(
                eq(agents.userId , ctx.auth.user.id),
                searchCondition
            )
        );
        const totalPages = Math.ceil(total.count / pageSize);


        return {
            items:data,
            total:total.count,
            totalPages
        }
    }),

    create:premiumProcedure("agents")
    .input(agentsInsertSchema)
    .mutation(async ({input , ctx}) =>{
      const [createdAgent] = await db.insert(agents)
                                     .values({
                                        ...input, 
                                        userId:ctx.auth.user.id,
                                     })
                                     .returning();


         return createdAgent;
    }),
});