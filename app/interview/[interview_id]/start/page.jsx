"use client";
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';     
import { Clock, Mic, MicOff, PhoneOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { InterviewDetailsContext } from '@/context/InterviewDetails.context';
import { useUser } from '@/app/provider';
import Vapi from '@vapi-ai/web';
import { supabase } from '@/services/supabaseClient';

let vapiInstance = null;

function Interview() {
  const { interview_id } = useParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useContext(InterviewDetailsContext);
  const user = useUser();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
   
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  const [Conversation, setConversation] = useState([]);

  useEffect(() => {
    if (interviewData) {
      setLoading(false);
      
      // Initialize VAPI if it doesn't exist yet
      if (!vapiInstance) {
        try {
          vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY);
          
          // Set up basic event listeners
          vapiInstance.on('call-start', () =>{
            setIsCallActive(true);
            setIsTimerActive(true);
          }); 
          vapiInstance.on('call-end', () => {
            setIsCallActive(false);
            setIsTimerActive(false);
          });
          vapiInstance.on('error', (error) => console.error("VAPI error:", error));

          
        }
        catch (error) {
            console.error("Error initializing VAPI:", error);
            setLoadError(true);
        }
      }
    } else {
      // Show error after timeout if data doesn't load
      const timeoutId = setTimeout(() => {
        if (!interviewData) {
          setLoadError(true);
          setLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Clean up VAPI on component unmount
    return () => {
      if (vapiInstance && isCallActive) {
        try {
          vapiInstance.stop();
        } catch (e) {
          console.error("Error stopping VAPI:", e);
        }
      }
    };
  }, [interviewData]);

  // Extract questions from interview data
  const questions = interviewData?.interviewData?.interview_questions?.map(q => q.question) || [];
  
  // Timer logic
  const [time, setTime] = useState(30 * 60);
  
  useEffect(() => {
    if (interviewData?.interviewData?.interview_time) {
      setTime(interviewData.interviewData.interview_time * 60);
    }
  }, [interviewData]);

  useEffect(() => {
    if (!isTimerActive || time <= 0) return;
    const timer = time > 0 && setInterval(() => setTime(time - 1), 1000);
    return () => clearInterval(timer);
  }, [time,isTimerActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const userName = interviewData?.username;



  // Simple function to start the VAPI call
  const startCall = () => {
    if (!interviewData || !vapiInstance) {
      return;
    }
    
    try {
      const assistantOptions = {
        name: "AI Interviewer",
        firstMessage: `Hi ${userName || "there"}, ready for your interview?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses,
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your ${interviewData?.interviewData?.job_position || "Software Development"} interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below Are the questions:
${JSON.stringify(questions)}
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5-7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"
Key Guidelines:
✅ Be friendly, engaging, and witty
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate's confidence level
✅ Ensure the interview remains focused on ${interviewData?.interviewData?.job_position || "Software Development"}`
            }
          ]
        }
      };
      
      // Start the call
      vapiInstance.start(assistantOptions);
      vapiInstance.on('message', (message) => {
        if (message?.conversation) {
          setConversation(prev => [...prev, ...message.conversation]);
        }
      });
    } catch (error) {
      console.error("Error starting VAPI call:", error);
    }
  };


  // Simple function to end the call
  const handleEndCall = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndCall = async () => {
    setShowEndConfirmation(false);
    try {
      if (vapiInstance) {
        vapiInstance.stop();
      }
      await GenerateFeedback();
      router.push(`/interview/${interview_id}/feedback`);
    } catch (error) {
      console.error("Error stopping VAPI call:", error);
      router.push(`/interview/${interview_id}/feedback`);
    }
  };

  const cancelEndCall = () => {
    setShowEndConfirmation(false);
  };
  const GenerateFeedback = async () => {
    if (!interviewData || !vapiInstance) {
      return;
    }
    
    try {
      // Check if feedback already exists for this interview
      const { data: existingFeedback, error: checkError } = await supabase
        .from('postinterview')
        .select('interview_id')
        .eq('interview_id', interviewData?.interviewData?.interview_id)
        .limit(1);
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing feedback:", checkError);
      }
      
      if (existingFeedback && existingFeedback.length > 0) {
        return;
      }
      
      // Check if we have conversation data
      if (!Conversation || Conversation.length === 0) {
        // Create a default feedback entry to avoid errors
        const defaultFeedback = {
          feedback: {
            summary: "Interview completed but no conversation data was recorded.",
            recommendation: "Incomplete",
            recommendationMsg: "Unable to provide feedback due to missing conversation data.",
            rating: {
              technicalSkills: 0,
              communication: 0,
              problemSolving: 0,
              overall: 0
            }
          }
        };
        
        const { error: insertError } = await supabase
          .from('postinterview')
          .insert([
            { 
              interview_id: interviewData?.interviewData?.interview_id, 
              interview_review: defaultFeedback 
            },
          ]);
          
        if (insertError) {
          console.error("Error inserting default feedback:", insertError);
        }
        return;
      }

      const result = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          conversation: Conversation
        }),
      });
      
      if (!result.ok) {
        throw new Error(`API request failed with status ${result.status}`);
      }
      
      const data = await result.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid feedback data received from API");
      }
      
      const { error: insertError } = await supabase
        .from('postinterview')
        .insert([
          { 
            interview_id: interviewData?.interviewData?.interview_id, 
            interview_review: data 
          },
        ]);
        
      if (insertError) {
        console.error("Error inserting feedback:", insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }
        
    } catch (error) {
      console.error("Error generating feedback:", error);
      
      // Create a fallback feedback entry so the feedback page doesn't crash
      try {
        // Check again if feedback was created by another process
        const { data: doubleCheck } = await supabase
          .from('postinterview')
          .select('interview_id')
          .eq('interview_id', interviewData?.interviewData?.interview_id)
          .limit(1);
          
        if (doubleCheck && doubleCheck.length > 0) {
          return;
        }
        
        const fallbackFeedback = {
          feedback: {
            summary: "Interview completed but feedback generation encountered an error.",
            recommendation: "Review Required",
            recommendationMsg: "Manual review needed due to technical issues with feedback generation.",
            rating: {
              technicalSkills: 5,
              communication: 5,
              problemSolving: 5,
              overall: 5
            }
          },
          error: error.message
        };
        
        const { error: fallbackError } = await supabase
          .from('postinterview')
          .insert([
            { 
              interview_id: interviewData?.interviewData?.interview_id, 
              interview_review: fallbackFeedback 
            },
          ]);
          
        if (fallbackError) {
          console.error("Error inserting fallback feedback:", fallbackError);
        }
      } catch (fallbackError) {
        console.error("Failed to insert fallback feedback:", fallbackError);
      }
    }
  };

  // Simple function to toggle microphone
  const handleMicToggle = () => {
    try {
      if (vapiInstance) {
        if (isMuted) {
          vapiInstance.mic.unmute();
        } else {
          vapiInstance.mic.mute();
        }
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    router.push(`/interview/${interview_id}`);
  };

  // Loading state
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

  // Error state
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

  // Main UI
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      {/* End Interview Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md mx-4 text-center">
            <div className="text-red-500 mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20">
              <PhoneOff className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">End Interview?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this interview? Your responses will be saved and feedback will be generated.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={cancelEndCall}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                No, Continue
              </button>
              <button 
                onClick={confirmEndCall}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Yes, End Interview
              </button>
            </div>
          </div>
        </div>
      )}

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
                
                {/* Call controls */}
                {isCallActive ? (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                    <span className="text-sm text-green-300">Call active</span>
                  </div>
                ) : (
                  <button 
                    onClick={startCall}
                    className="mt-4 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg flex items-center mx-auto"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Interview
                  </button>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm">
                AI Interviewer
              </div>
            </div>
            
            {/* User video */}
            <div className="relative bg-gray-700 rounded-xl overflow-hidden flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-600">
                  {user?.user?.pfp ? (
                    <Image 
                      src={user.user.pfp} 
                      alt="User Profile" 
                      width={140} 
                      height={140} 
                      className="object-cover h-full w-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png"; 
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-600">
                      <span className="text-4xl font-medium text-gray-300">
                        {userName ? userName.charAt(0).toUpperCase() : "G"}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-lg font-medium text-white">{userName || "Guest"}</p>
                
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm">
                {userName || "Guest"} (You)
              </div>
            </div>
          </div>
          
          {/* Display current question
          {questions.length > 0 && (
            <div className="mt-4 max-w-2xl mx-auto bg-gray-700/50 p-3 rounded-lg border border-gray-600">
              <p className="text-center text-base text-gray-100">"{questions[currentQuestion] || "Let's begin with the interview."}"</p>
            </div>
          )} */}
          
          {/* Controls */}
          <div className="mt-6 flex items-center justify-center space-x-6">
            <button 
              onClick={handleMicToggle}
              className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
              disabled={!isCallActive}
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
              onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              className={`p-4 rounded-full ${isSpeakerOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
              disabled={!isCallActive}
            >
              {isSpeakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Chat sidebar */}
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
                <p className="text-sm">{questions[currentQuestion] || "Let's begin with the first question."}</p>
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