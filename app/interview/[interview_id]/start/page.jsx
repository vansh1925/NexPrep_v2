"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';     
import { Clock, Mic, MicOff, Camera, CameraOff, PhoneOff, Volume2, VolumeX, User, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { InterviewDetailsContext } from '@/context/InterviewDetails.context';
import { useUser } from '@/app/provider';

function Interview() {
  const { interview_id } = useParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useContext(InterviewDetailsContext);
  const user = useUser();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
   
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Set a safety timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached, attempting recovery...");
        
        // Try to recover data from localStorage
        try {
          const savedData = localStorage.getItem('interview_data');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setInterviewData(parsedData);
            console.log("Recovered data from localStorage");
          } else {
            setLoading(false);
            setLoadError(true);
          }
        } catch (e) {
          console.error("Error recovering data:", e);
          setLoading(false);
          setLoadError(true);
        }
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [loading, setInterviewData]);

  // When interview data is available, save to localStorage as backup
  useEffect(() => {
    console.log("Interview data:", interviewData);
    
    if (interviewData) {
      setLoading(false);
      
      // Save to localStorage for recovery
      try {
        localStorage.setItem('interview_data', JSON.stringify(interviewData));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    }
  }, [interviewData]);

  // Extract questions with safety check
  const questions = interviewData?.interviewData?.interview_questions || [];

  // Timer effect with fixed initial value
  const [time, setTime] = useState(30 * 60); // Default 30 minutes
  
  // Update timer when interview data is available
  useEffect(() => {
    if (interviewData?.interviewData?.interview_time) {
      setTime(interviewData.interviewData.interview_time * 60);
    }
  }, [interviewData]);

  // Timer countdown effect
  useEffect(() => {
    const timer = time > 0 && setInterval(() => setTime(time - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const userName = interviewData?.username;

  const handleEndCall = () => {
    if (confirm('Are you sure you want to end this interview?')) {
      router.push(`/interview/${interview_id}/feedback`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Handle going back to previous page
  const handleGoBack = () => {
    router.push(`/interview/${interview_id}`);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white">Setting up your interview...</p>
        </div>
      </div>
    );
  }

  if (loadError || !interviewData) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md text-center text-white">
          <div className="text-amber-500 mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Interview Data Not Found</h2>
          <p className="text-gray-300 mb-6">
            We couldn't retrieve your interview data. This might be because the session data was lost or there was a technical error.
          </p>
          <button 
            onClick={handleGoBack}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg"
          >
            Go Back to Interview Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      {/* Header with timer and controls */}
      <div className="bg-gray-800 p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center">
          
          <span className="ml-3 text-lg font-medium hidden md:inline">
            {interviewData?.interviewData?.job_position || 'Interview'} - {userName}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1.5 rounded-full">
            <Clock className="text-primary w-4 h-4" />
            <span className="text-sm font-medium">{formatTime(time)}</span>
          </div>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-full ${showChat ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-72px)]">
        {/* Video call area */}
        <div className={`flex-1 p-4 ${showChat ? 'md:w-2/3' : 'w-full'}`}>
          {/* Video containers */}
          <div className="flex flex-col md:flex-row gap-4 h-[65vh]">
            {/* AI interviewer video */}
            <div className="relative bg-gray-700 rounded-xl overflow-hidden flex-1 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800"></div>
              <div className="relative z-10 text-center">
                <div className="h-32 w-32 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4 overflow-hidden">
                  <Image 
                    src="/interview taker.jpg" 
                    alt="AI Interviewer" 
                    width={140} 
                    height={140} 
                    className="object-cover"
                  />
                </div>
                <p className="text-lg font-medium">AI Interviewer</p>
                <p className="text-sm text-gray-400">NexPrep Assistant</p>
                
                {/* Display current question here instead of in a separate box
                {questions.length > 0 && (
                  <div className="mt-6 max-w-md mx-auto bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <p className="text-base text-gray-100">"{questions[currentQuestion]?.question || "Let's begin with the interview."}"</p>
                  </div>
                )} */}
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm">
                AI Interviewer
              </div>
            </div>
            {/* User video */}
            <div className="relative bg-gray-700 rounded-xl overflow-hidden flex-1 flex items-center justify-center">
              {isCameraOff ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-600">
                    {user?.pfp ? (
                      <Image 
                        src={user?.pfp} 
                        alt="User Profile" 
                        width={140} 
                        height={140} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-600">
                        <span className="text-4xl font-medium text-gray-300">
                          {userName ? userName.charAt(0).toUpperCase() : "G"}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2">Camera is off</p>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-800"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center mb-4">
                      {user?.pfp ? (
                        <Image 
                          src={user?.pfp} 
                          alt="User Profile" 
                          width={140} 
                          height={140} 
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-600">
                          <span className="text-4xl font-medium text-gray-300">
                            {userName ? userName.charAt(0).toUpperCase() : "G"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm">
                {userName || "Guest"} (You)
              </div>
            </div>
          </div>
          {/* Controls */}
          <div className="mt-6 flex items-center justify-center space-x-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-4 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
              {isCameraOff ? <CameraOff className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              className={`p-4 rounded-full ${isSpeakerOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
              {isSpeakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Chat sidebar (conditionally shown) */}
        {showChat && (
          <div className="md:w-1/3 bg-gray-800 p-4 border-l border-gray-700 h-full overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Interview Chat</h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              <div className="bg-gray-700 p-3 rounded-lg max-w-[85%] ml-auto">
                <p className="text-sm">Hello, I'm ready for my interview.</p>
                <p className="text-xs text-gray-400 mt-1">You, just now</p>
              </div>
              
              <div className="bg-primary/20 p-3 rounded-lg max-w-[85%]">
                <p className="text-sm">Welcome to your interview for the {interviewData?.interviewData?.job_position || 'position'}. I'll be asking you some questions to evaluate your skills and experience.</p>
                <p className="text-xs text-gray-400 mt-1">AI Interviewer, just now</p>
              </div>
              
              <div className="bg-primary/20 p-3 rounded-lg max-w-[85%]">
                <p className="text-sm">{questions[currentQuestion]?.question || "Let's begin with the first question."}</p>
                <p className="text-xs text-gray-400 mt-1">AI Interviewer, just now</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your answer..." 
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
              />
              <button className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Interview;