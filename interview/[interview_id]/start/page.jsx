"use client";
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { Loader, Mic, Phone, Timer } from 'lucide-react';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import Vapi from "@vapi-ai/web";
import AlertConfirmation from './_components/AlertConfirmation';
import { toast } from 'sonner';
import axios from 'axios';
import { supabase } from '@/services/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

function StartInterview() {
  const { interview_id } = useParams();
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
  const [loading, setLoading] = useState(false);

  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState();
  const [seconds, setSeconds] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval;

    if (interviewInfo) {
      startCall();
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [interviewInfo]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const startCall = () => {
    let questionList = "";
    interviewInfo?.interviewData?.questionList.forEach((item) => {
      questionList += item?.question + ", ";
    });

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: `Hi ${interviewInfo?.userName}, how are you? Ready for your interview on ${interviewInfo?.interviewData?.jobPosition}?`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer"
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI voice assistant conducting interviews.\nYour job is to ask candidates provided interview questions, assess their responses.
            \nBegin the conversation with a friendly introduction, setting a relaxed yet professional tone. 
            Example:\n"Hey there! Welcome to your ${interviewInfo?.interviewData?.jobPosition} interview. 
            Let's get started with a few questions!"\nAsk one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. 
            Below are the questions: ${questionList}\nIf the candidate struggles, offer hints or rephrase the question without giving away the answer. 
            Example:\n"Need a hint? Think about how React tracks component updates!"\nProvide brief, encouraging feedback after each answer. 
            Example:\n"Nice! That's a solid answer."\n"Hmm, not quite! Want to try again?"\nKeep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
            \nAfter 5-7 questions, wrap up the interview smoothly by summarizing their performance. 
            Example:\n"That was great! You handled some tough questions well. Keep sharpening your skills!"\nEnd on a positive note:\n"Thanks for chatting! Hope to see you crushing projects soon!"
            \nKey Guidelines:\n* Be friendly, engaging, and witty 😉\n* Keep responses short and natural, like a real conversation\n* Adapt based on the candidate's confidence level\n* Ensure the interview remains focused on React`
          }
        ]
      }
    };

    vapi.start(assistantOptions);
  };

  useEffect(() => {
    const handleMessage = (message) => {
      if (message?.conversation) {
        const convoString = JSON.stringify(message?.conversation);
        setConversation(convoString);
      }
    }
    vapi.on("message", handleMessage);
    vapi.on("speech-start", () => {
      setActiveUser(false);
    });

    vapi.on("speech-end", () => {
      setActiveUser(true);
    });

    vapi.on("call-start", () => {
      toast.success("Interview Connected...");
    });

    vapi.on("call-end", () => {
      toast.success("Interview Ended...");
    });

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start",()=>console.log("END"));
      vapi.off("speech-start",()=>console.log("END"));
      vapi.off("call-end",()=>console.log("END"));
      vapi.off("speech-end",()=>console.log("END"));
    }
  })

  const stopInterview = () => {
    vapi.stop();
    toast.success("Interview Ended...");
    GenerateFeedback();
    setSeconds(0);
  };

  const GenerateFeedback = async () => {
    try {
      const result = await axios.post("/api/ai-feedback", {
        conversation: conversation
      });
      const CONTENT = result?.data?.message;
      const FINAL_CONTENT = CONTENT.replace(/```json\s*/gi, '').replace(/```/gi, '').trim();
      // save to database
      const { data, error } = await supabase
        .from('interview-feedback')
        .insert([
          {
            userName: interviewInfo?.userName,
            userEmail: interviewInfo?.userEmail,
            interview_id: interview_id,
            feedback: JSON.parse(FINAL_CONTENT),
            recommendation: false
          }
        ])
        .select();

      console.log(data);
      toast.success("Feedback Generated and Stored in DB.")
      router.replace("/interview/" + interview_id + "/completed");
    } catch (error) {
      console.error("Feedback generation failed", error);
    }
  };

  return (
    <div className='p-20 lg:px-48 xl:px-56'>
      <h2 className='font-bold text-xl flex justify-between'>AI Interview Session
        <span className='flex gap-2 items-center'>
          <Timer />
          {formatTime(seconds)}
        </span>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-7 mt-5'>
        <div className='bg-white h-[400px] rounded-lg border flex flex-col gap-3 items-center justify-center'>
          <div className='relative'>
            {!activeUser && <span className='absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping'></span>}
            <Image
              src={"/ai.png"} alt='ai' height={200} width={200}
              className='w-[80px] h-[80px] rounded-full object-contain'
            />
          </div>
          <h2>AI Recruiter</h2>
        </div>

        <div className='bg-white h-[400px] rounded-lg border flex-col gap-3 flex items-center justify-center'>
          <div className='relative'>
            {activeUser && <span className='absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping'></span>}
            <h2 className='text-2xl bg-primary text-white p-3 rounded-full px-5'>
              {interviewInfo?.userName?.[0]}
            </h2>
          </div>
          <h2>{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className='flex items-center justify-center gap-5 mt-7'>
        <Mic className='h-12 w-12 p-3 text-white bg-gray-500 rounded-full cursor-pointer' />
        {/* <AlertConfirmation stopInterview={stopInterview}>
          <Phone className='h-12 w-12 p-3 rounded-full text-white bg-red-500 cursor-pointer' />
        </AlertConfirmation> */}
        {
          !loading ?
            <Phone className='h-12 w-12 p-3 rounded-full text-white bg-red-500 cursor-pointer'
              onClick={() => stopInterview()}
            />
            :
            <Loader className='animate-spin' />
        }
      </div>

      <h2 className='text-sm text-center mt-5 text-gray-400'>Interview in Progress...</h2>
    </div>
  );
}

export default StartInterview;
