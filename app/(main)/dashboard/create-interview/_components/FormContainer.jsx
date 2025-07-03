"use client";
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InterviewType } from '@/services/Constant'

function FormContainer({ step = 1, formData, updateFormData, errors = {} }) {
  // This ensures our component can render even if props aren't provided
  const data = formData || {};
  const updateData = updateFormData || (() => {});

  // Helper function to display error message
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm border border-gray-100'>
        {/* Step 1: Job Details */}
        <div className={`${step === 1 ? 'block' : 'hidden'}`}>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Job Position</h2>
              <Input 
                placeholder="ex- Frontend Developer" 
                value={data.jobPosition || ''} 
                onChange={(e) => updateData('jobPosition', e.target.value)}
                className={errors.jobPosition ? 'border-red-500' : ''}
              />
              <ErrorMessage field="jobPosition" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Job Description</h2>
              <Textarea 
                placeholder="Describe the job role and responsibilities" 
                className={`min-h-[150px] ${errors.jobDescription ? 'border-red-500' : ''}`}
                value={data.jobDescription || ''} 
                onChange={(e) => updateData('jobDescription', e.target.value)}
              />
              <ErrorMessage field="jobDescription" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Experience Level</h2>
              <Select 
                value={data.experienceLevel || ''} 
                onValueChange={(value) => updateData('experienceLevel', value)}
              >
                <SelectTrigger className={`w-full ${errors.experienceLevel ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (5-8 years)</SelectItem>
                  <SelectItem value="expert">Expert Level (8+ years)</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage field="experienceLevel" />
          </div>
        </div>

        {/* Step 2: Interview Configuration */}
        <div className={`${step === 2 ? 'block' : 'hidden'}`}>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Interview Duration</h2>
              <Select
                value={data.interviewDuration || ''}
                onValueChange={(value) => updateData('interviewDuration', value)}
              >
                  <SelectTrigger className={`w-full ${errors.interviewDuration ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="5 Min">5 minutes</SelectItem>
                      <SelectItem value="15 Min">15 minutes</SelectItem>
                      <SelectItem value="30 Min">30 minutes</SelectItem>
                      <SelectItem value="60 Min">1 hour</SelectItem>
                      <SelectItem value="90 Min">1.5 hours</SelectItem>
                  </SelectContent>
              </Select>
              <ErrorMessage field="interviewDuration" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Interview Type</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Select one or more interview types (click to toggle)</p>
                {Array.isArray(data.interviewType) && data.interviewType.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {data.interviewType.length} selected
                  </span>
                )}
              </div>
              <div className={`flex gap-4 flex-wrap mt-2 ${errors.interviewType ? 'border border-red-500 p-2 rounded-md' : ''}`}>
                  {InterviewType.map((type,index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 border px-4 py-2 rounded-md cursor-pointer transition-all duration-200
                          ${Array.isArray(data.interviewType) && data.interviewType.includes(type.title)
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-white border-gray-200 hover:bg-secondary/80'}`}
                        onClick={() => updateData('interviewType', type.title)}
                      >
                          <type.icon className={`h-6 w-6 ${Array.isArray(data.interviewType) && data.interviewType.includes(type.title) ? 'text-primary' : ''}`} />
                          <span>{type.title}</span>
                          {Array.isArray(data.interviewType) && data.interviewType.includes(type.title) && (
                            <span className="ml-2 text-primary">✓</span>
                          )}
                      </div>
                  ))}
              </div>
              <ErrorMessage field="interviewType" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Difficulty Level</h2>
              <div className={`flex gap-4 ${errors.difficultyLevel ? 'border border-red-500 p-2 rounded-md' : ''}`}>
                {["Easy", "Medium", "Hard"].map((level) => (
                  <div 
                    key={level} 
                    className={`flex-1 border rounded-md p-3 text-center cursor-pointer transition-all
                      ${data.difficultyLevel === level
                        ? 'bg-primary/10 border-primary' 
                        : 'border-gray-200 hover:bg-secondary/80'}`}
                    onClick={() => updateData('difficultyLevel', level)}
                  >
                    {level}
                  </div>
                ))}
              </div>
              <ErrorMessage field="difficultyLevel" />
          </div>
        </div>

        {/* Step 3: Additional Requirements */}
        <div className={`${step === 3 ? 'block' : 'hidden'}`}>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Required Skills</h2>
              <Textarea 
                placeholder="Enter key skills separated by commas (e.g., React, JavaScript, CSS)" 
                className={`min-h-[100px] ${errors.requiredSkills ? 'border-red-500' : ''}`}
                value={data.requiredSkills || ''}
                onChange={(e) => updateData('requiredSkills', e.target.value)}
              />
              <ErrorMessage field="requiredSkills" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Specific Topics to Cover</h2>
              <Textarea 
                placeholder="Enter any specific topics you want the interview to focus on" 
                className={`min-h-[100px] ${errors.topicsTocover ? 'border-red-500' : ''}`}
                value={data.topicsTocover || ''}
                onChange={(e) => updateData('topicsTocover', e.target.value)}
              />
              <ErrorMessage field="topicsTocover" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Interview Format</h2>
              <div className={`flex flex-wrap gap-4 ${errors.interviewFormat ? 'border border-red-500 p-2 rounded-md' : ''}`}>
                {[
                  { id: "conversational", name: "Conversational" },
                  { id: "structured", name: "Structured Q&A" },
                  { id: "technical", name: "Technical Assessment" },
                  { id: "mixed", name: "Mixed Format" }
                ].map((format) => (
                  <div 
                    key={format.id} 
                    className={`flex-1 min-w-[180px] border rounded-md p-3 text-center cursor-pointer transition-all
                      ${data.interviewFormat === format.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'border-gray-200 hover:bg-secondary/80'}`}
                    onClick={() => updateData('interviewFormat', format.id)}
                  >
                    {format.name}
                  </div>
                ))}
              </div>
              <ErrorMessage field="interviewFormat" />
          </div>
          <div className="mb-6">
              <h2 className='text-xl font-bold mb-2'>Additional Notes</h2>
              <Textarea 
                placeholder="Any additional information that might help tailor the interview" 
                className={`min-h-[100px] ${errors.additionalNotes ? 'border-red-500' : ''}`}
                value={data.additionalNotes || ''}
                onChange={(e) => updateData('additionalNotes', e.target.value)}
              />
              <ErrorMessage field="additionalNotes" />
          </div>
          
          {/* Summary section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Interview Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">Job Position:</h3>
                  <p>{data.jobPosition || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Experience Level:</h3>
                  <p>{data.experienceLevel ? {
                    'entry': 'Entry Level (0-2 years)',
                    'mid': 'Mid Level (2-5 years)',
                    'senior': 'Senior Level (5-8 years)',
                    'expert': 'Expert Level (8+ years)'
                  }[data.experienceLevel] : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Interview Duration:</h3>
                  <p>{data.interviewDuration || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Difficulty Level:</h3>
                  <p>{data.difficultyLevel || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Interview Type:</h3>
                  <p>{Array.isArray(data.interviewType) && data.interviewType.length > 0 
                    ? data.interviewType.join(', ') 
                    : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Interview Format:</h3>
                  <p>{data.interviewFormat ? {
                    'conversational': 'Conversational',
                    'structured': 'Structured Q&A',
                    'technical': 'Technical Assessment',
                    'mixed': 'Mixed Format'
                  }[data.interviewFormat] : 'Not specified'}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Required Skills:</h3>
                <p className="whitespace-pre-wrap">{data.requiredSkills || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default FormContainer