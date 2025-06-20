"use client"
import { useUser } from '@/app/provider'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function InterviewHeader() {
  const {user}=useUser();
  return (
    <div className='p-4 shadow-md flex justify-between items-center'>
      <Link href={"/dashboard"}>
        <Image src={"/logo.png"}
          width={50}
          height={50}
          alt='logo'
          className='w-[50px]'
        />
      </Link>
      {user?.picture && <Image src={user?.picture} alt='user' width={40} height={40}  className='rounded-full'/>}
    </div>
  )
}

export default InterviewHeader