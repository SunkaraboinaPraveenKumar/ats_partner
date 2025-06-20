"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InterviewDataContext } from '@/context/InterviewDataContext'
import { supabase } from '@/services/supabaseClient'
import { Clock, Info, Loader, Video } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

function Interview() {
    const {interview_id}=useParams();
    const [interviewData,setInterviewData]=useState();
    useEffect(()=>{
        interview_id&&GetInterviewDetails();
    },[interview_id])
    const [userName,setUserName]=useState();
    const [userEmail,setUserEmail]=useState();
    const [loading,setLoading]=useState(false);
    const {interviewInfo,setInterviewInfo}=useContext(InterviewDataContext);
    const router=useRouter();
    const GetInterviewDetails=async()=>{
        setLoading(true);
        try{
            let {data:Interviews, error} = await supabase
            .from('Interviews')
            .select('jobPosition,jobDescription,duration,type')
            .eq('interview_id',interview_id)
            if(Interviews?.length==0){
                toast.error('Incorrect Interview Link')
            }
            setInterviewData(Interviews[0]);
        }
        catch(e){
            console.log(e);
            toast.error('Incorrect Interview Link')
        }
        setLoading(false);
    }
    const onJoinInterview=async()=>{
        setLoading(true);
        let {data:Interviews, error} = await supabase
            .from('Interviews')
            .select('*')
            .eq('interview_id',interview_id)

        setInterviewInfo({
            userName:userName,
            userEmail:userEmail,
            interviewData:Interviews[0]
        });
        setLoading(false);
        router.push('/interview/'+interview_id+'/start')
    }
    return (
        <div className='px-10 md:px-28 lg:px-48 xl:px-60 mt-7'>
            <div className='flex flex-col items-center justify-center border rounded-lg bg-white p-7
            lg:px-32 xl:px-52 mb-20
            '>
                <Image src={"/logo.png"}
                    width={50}
                    height={50}
                    alt='logo'
                    className='w-[50px]'
                />
                <h2 className='mt-3 font-bold'>AI Powered Interview Platform</h2>
                <Image
                    src={"/login.png"}
                    alt='interview'
                    width={500}
                    height={500}
                    className='w-[280px] my-6 rounded-lg'
                />
                <h2 className='font-bold text-xl'>{interviewData?.jobPosition} Interview</h2>
                <h2 className='flex gap-2 items-center text-gray-500 mt-3'><Clock className='h-4 w-4' /> {interviewData?.duration} Minutes</h2>

                <div className='w-full'>
                    <h2 className='mb-1 font-medium'>Enter Your full name</h2>
                    <Input placeholder='e.g Praveen Kumar' onChange={(e)=>setUserName(e.target.value)}/>
                </div>
                <div className='w-full'>
                    <h2 className='mb-1 font-medium'>Enter Your Email</h2>
                    <Input placeholder='e.g kumar@gmail.com' onChange={(e)=>setUserEmail(e.target.value)}/>
                </div>

                <div className='p-3 flex gap-4 bg-blue-100 rounded-lg mt-5'>
                    <Info className='text-primary' />
                    <div>
                        <h2 className='font-bold'>Before you begin</h2>
                        <ul>
                            <li className='text-sm text-primary'>-- Ensure you have a Stable Internet Connection</li>
                            <li className='text-sm text-primary'>-- Use a quiet and well-lit environment</li>
                            <li className='text-sm text-primary'>-- Have your webcam and microphone ready</li>
                        </ul>
                    </div>
                </div>
                <Button 
                className={'mt-5 w-full font-bold cursor-pointer'} 
                disabled={loading||!userName}
                onClick={()=>onJoinInterview()}
                >
                    <Video />
                    {loading?
                    <Loader className='animate-spin'/>
                    :
                    'Join Interview'
                    }
                </Button>
            </div>
        </div>
    )
}

export default Interview