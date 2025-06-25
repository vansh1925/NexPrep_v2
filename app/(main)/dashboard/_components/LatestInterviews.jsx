import { Button } from '@/components/ui/button';
import {  History, Plus } from 'lucide-react';
import React from 'react'

function LatestInterviews() {
    const [interviewsList, setInterviewsList] = React.useState([]);
  return (
    <div className='my-5'>
        <h2 className='text-2xl font-bold'>Previously Created Interviews</h2>
        {interviewsList.length==0 &&
            <div className=' mt-2 p-5 flex flex-col items-center justify-center rounded-lg bg-white border border-gray-200'>
                <History className='h-16 w-16 text-primary mx-auto my-4' />
                <h3 className='text-gray-500 text-center'>No interviews created yet</h3>
                <Button className={'mt-4'}><Plus /> Create New Interview</Button>
            </div>
        }
    </div>
  )
}

export default LatestInterviews