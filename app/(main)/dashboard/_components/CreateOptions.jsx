import { Mic, Notebook } from 'lucide-react'
import React from 'react'

function CreateOptions() {
  return (
    <div className='grid grid-cols-2 gap-4'>
        <div className='bg-white border border-gray-200 p-4 rounded-lg'>
            <Mic className='p-3 text-primary bg-blue-50 h-14 w-12' />
            <h2 className='text-xl font-bold'>Start AI Mock Interview</h2>
            <p className='text-gray-500'>Practice an interview with an AI interviewer. Get real-time feedback.</p>
        </div>
        <div className='bg-white border border-gray-200 p-4 rounded-lg'>
            <Notebook className='p-3 text-primary bg-blue-50 h-14 w-12' />
            <h2 className='text-xl font-bold'>Generate Interview Questions</h2>
            <p className='text-gray-500'>Create role-specific interview questions using AI</p>
        </div>
    </div>
  )
}

export default CreateOptions