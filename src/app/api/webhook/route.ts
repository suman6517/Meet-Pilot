import{
    //CallEndedEvent,
    //CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    //CallRecordingReadyEvent,
    CallSessionStartedEvent
} from "@stream-io/node-sdk";

import {eq , and, not} from "drizzle-orm";
import { NextRequest , NextResponse } from "next/server";

import { db } from "@/db";
import { agents , meetings } from "@/db/schema";

import {streamVideo} from "@/lib/stream-video";
import { error } from "console";
import OpenAI from "openai";

function verifySignatureWithSDK (body : string , signature: string)
{
    return streamVideo.verifyWebhook(body , signature);
}

export async function POST(req:NextRequest) 
{
    console.log("Webhook received");
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if(!signature || !apiKey)
    {
        return NextResponse.json({error:"Missing Signture Or Api Key"} , 
        {status:400}
    );
    }

    const body = await req.text();

    if(!verifySignatureWithSDK(body , signature))
    {
        return NextResponse.json({error:"Invalid Signature"} , {status:401});
    }


    let payload :unknown;
    try 
    {
        payload = JSON.parse(body) as Record<string ,unknown>;
    } 
    catch
    {
        return NextResponse.json({error:"Invalid JSON"} ,{status:400});    
    }

    const eventType = (payload as Record<string ,unknown>) ?.type;
    console.log("Event Type:", eventType);

    if(eventType === "call.session_started")
    {
        const event = payload as CallSessionStartedEvent;
        console.log("Session started event received");
        const meetingId = event.call.custom?.meetingId;
        console.log("Meeting ID:", meetingId);

        if(!meetingId) 
        {
            return NextResponse.json({error:"Missing MeetingId"} , {status:400});
        }

        const[existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
            and(
                eq(meetings.id , meetingId),
                not(eq(meetings.status , "complited")),
                not(eq(meetings.status , "active")),
                not(eq(meetings.status , "cancled")),
                not(eq(meetings.status , "processing"))
            )
        );

        if(!existingMeeting)
        {
            console.log("Meeting not found");
            return NextResponse.json({error:"Meeting Not Found"} , {status:404});
        }

        await db.update(meetings)
        .set({
            status:"active",
            startedAt:new Date(),
        })
        .where(eq(meetings.id , existingMeeting.id));


        // Agent Set-Up for the call
        const[existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id , existingMeeting.agentId));

        if(!existingAgent)
        {
            return NextResponse.json({error:"Agent Not Found"} , {status:404});
        }

        const call = streamVideo.video.call("default" , meetingId);

        console.log("AI agent conecting");
        const realtimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey:process.env.GROQ_AI_API_KEY!,
            agentUserId:existingAgent.id,
            
        });

        console.log("AI agent connected");

        realtimeClient.updateSession({
            instructions:existingAgent.instructions,
        });

        // const groq = new OpenAI({
        //     apiKey: process.env.GROQ_AI_API_KEY,
        //     baseURL: "https://api.groq.com/openai/v1",
        //   });
          
        //   const completion = await groq.chat.completions.create({
        //     model: "llama-3.1-8b-instant",
        //     messages: [
        //       {
        //         role: "system",
        //         content: existingAgent.instructions,
        //       },
        //       {
        //         role: "user",
        //         content: "User joined the meeting",
        //       },
        //     ],
        //   });
          
        //   const aiResponse = completion.choices[0]?.message?.content;

        //   console.log("AI Response:", aiResponse);

        //   await call.sendCallEvent({
        //     user_id: existingAgent.id,
        //     user: {
        //       id: existingAgent.id,
        //     },
        //     custom: {
        //       type: "ai.message",
        //       text: aiResponse,
        //     },
        //   });
    }
    else if(eventType === "call.session_participant_left")
    {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        if(!meetingId)
        {
            return NextResponse.json({error:"Missing MeetingId"} , {status:400});
        }

        const call = streamVideo.video.call("default" , meetingId);
        await call.end();
    }


    return NextResponse.json({status : "ok"});


}