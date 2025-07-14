"use client";
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'
import FormContainer from './_components/FormContainer';
import ConfirmationModal from './_components/ConfirmationModal';
import QuestionList from './_components/QuestionList';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/provider';
import { toast } from 'sonner'; 

function CreateInterview() {
  const user = useUser()
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [errors, setErrors] = React.useState({});
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    // Step 1
    jobPosition: "",
    jobDescription: "",
    experienceLevel: "",
    
    // Step 2
    interviewDuration: "",
    interviewType: [], // Changed to an array to store multiple selected types
    difficultyLevel: "",
    
    // Step 3
    requiredSkills: "",
    topicsTocover: "",
    interviewFormat: "",
    additionalNotes: ""
  });

  const updateFormData = (field, value) => {
    // Clear any error for this field when user updates it
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));

    if (field === 'interviewType') {
      // Special handling for interviewType as it's an array
      setFormData(prev => {
        const currentTypes = [...prev.interviewType];
        if (currentTypes.includes(value)) {
          // If type already exists, remove it (toggle)
          return {
            ...prev,
            interviewType: currentTypes.filter(type => type !== value)
          };
        } else {
          // Add the new type
          return {
            ...prev,
            interviewType: [...currentTypes, value]
          };
        }
      });
    } else {
      // Normal handling for other fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Validate form fields for the current step
  const validateStep = (currentStep) => {
    const newErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.jobPosition.trim()) {
        newErrors.jobPosition = "Job position is required";
        isValid = false;
      }
      if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = "Job description is required";
        isValid = false;
      }
      if (!formData.experienceLevel) {
        newErrors.experienceLevel = "Experience level is required";
        isValid = false;
      }
    }
    else if (currentStep === 2) {
      if (!formData.interviewDuration) {
        newErrors.interviewDuration = "Interview duration is required";
        isValid = false;
      }
      if (formData.interviewType.length === 0) {
        newErrors.interviewType = "At least one interview type is required";
        isValid = false;
      }
      if (!formData.difficultyLevel) {
        newErrors.difficultyLevel = "Difficulty level is required";
        isValid = false;
      }
    }
    else if (currentStep === 3) {
      // Step 3 validation (only required fields)
      if (!formData.requiredSkills.trim()) {
        newErrors.requiredSkills = "Required skills are needed";
        isValid = false;
      }
      if (!formData.interviewFormat) {
        newErrors.interviewFormat = "Interview format is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check user credits
  const checkUserCredits = () => {
    console.log("Checking user credits:", user?.user?.credits);
    
    if (!user || !user.user) {
      toast.error("Please login to create an interview");
      return false;
    }

    const userCredits = user.user.credits || 0;
    
    if (userCredits <= 0) {
      toast.error("You don't have enough credits to create an interview. Please add credits to continue.", {
        duration: 5000,
        action: {
          label: "Add Credits",
          onClick: () => router.push('/dashboard/billing') 
        }
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step < 3) {
      if (validateStep(step)) {
        setStep(step + 1);
      }
    } else {
      // Final submission - Check credits first
      if (validateStep(step)) {
        // Check credits before showing confirmation modal
        if (checkUserCredits()) {
          setShowConfirmationModal(true);
        }
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generationError, setGenerationError] = React.useState(null);
  const [generatedQuestions, setGeneratedQuestions] = React.useState(null);
  const [showQuestionList, setShowQuestionList] = React.useState(false);

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Double-check credits before proceeding with API call
      if (!checkUserCredits()) {
        return;
      }
      
      // Clear console to make output more visible
      console.clear();
      console.log("%c Submitting form data to AI...", "color: blue; font-size: 16px;");
      console.table(formData);
      
      // Submit the form data to the API
      const response = await fetch('/api/ai-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log("%c Interview questions generated successfully!", "color: green; font-size: 20px; font-weight: bold");
        console.log("Generated Questions:", result.questions);
        
        // Generate a unique interview ID
        const interviewId = uuidv4();
        
        // Get the current user's email
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || user?.user?.email || 'anonymous@example.com';
        
        // Save to Supabase
        const { data, error } = await supabase
          .from('InterviewDetails')
          .insert({
            interview_id: interviewId,
            job_position: formData.jobPosition,
            job_description: formData.jobDescription,
            experience_level: formData.experienceLevel,
            interview_time: parseInt(formData.interviewDuration) || 30,
            interview_type: Array.isArray(formData.interviewType) 
              ? formData.interviewType.join(', ') 
              : formData.interviewType,
            interview_questions: result.questions,
            user_email: userEmail
          })
          .select();
          
        if (error) {
          console.error("Error saving to Supabase:", error);
          toast.error("Questions were generated but there was an error saving them to the database.");
        } else {
          console.log("Interview saved to database:", data);
          
          // Deduct 1 credit from user
          try {
            const { error: creditError } = await supabase
              .from('Users')
              .update({ 
                credits: user.user.credits - 1 
              })
              .eq('email', userEmail);
              
            if (creditError) {
              console.error("Error updating credits:", creditError);
              toast.warning("Interview created but failed to update credits");
            } else {
              toast.success("Interview created successfully! 1 credit used.");
              // Update local user state if you have a method to refresh user data
              // user.refreshUser(); // Uncomment if you have this method
            }
          } catch (creditUpdateError) {
            console.error("Credit update failed:", creditUpdateError);
          }
        }
        
        // Store the generated questions
        setGeneratedQuestions(result.questions);
        
        // Close the confirmation modal and show the questions list
        setShowConfirmationModal(false);
        setShowQuestionList(true);
      } else {
        throw new Error(result.error || "Failed to generate interview questions");
      }
    } catch (error) {
      console.error("Error submitting interview:", error);
      setGenerationError(error.message);
      toast.error(`Error creating interview: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      if (!showQuestionList) {
        setShowConfirmationModal(false);
      }
    }
  };
  
  return (
    <div className='w-full px-10 md:px-24 lg:px-44 xl:px-56 pt-4'>
        <div className='flex items-center gap-2 mb-6'>
            <ArrowLeft onClick={() => router.back()} className='cursor-pointer'/>
            <h2 className='text-2xl font-bold text-gray-800'>Create Interview</h2>
        </div>

        {/* Display user credits */}
        {user?.user && (
          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-blue-700'>
                Available Credits: <strong>{user.user.credits || 0}</strong>
              </span>
              {(user.user.credits || 0) <= 0 && (
                <button 
                  onClick={() => router.push('/billing')}
                  className='text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'
                >
                  Add Credits
                </button>
              )}
            </div>
          </div>
        )}
        
        <FormContainer 
          step={step} 
          formData={formData} 
          updateFormData={updateFormData}
          errors={errors}
        />
        
        <div className='mt-6'>
            <div className='flex items-center justify-between mb-2'>
                <div className='text-sm text-gray-500'>Step {step} of 3</div>
                <div className='text-sm text-gray-500'>{Math.round(step*33.33)}% Complete</div>
            </div>
            <Progress value={step*33.33} className='w-full' />
            <div className='mt-6 flex justify-between'>
                <button 
                    onClick={() => step > 1 && setStep(step - 1)} 
                    className={`px-4 py-2 border border-gray-300 rounded-md ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    disabled={step === 1}
                >
                    Previous
                </button>
                <button 
                    onClick={handleNextStep} 
                    className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 ${
                      step === 3 && (!user?.user || user.user.credits <= 0) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={step === 3 && (!user?.user || user.user.credits <= 0)}
                >
                    {step === 3 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal 
          isOpen={showConfirmationModal}
          onClose={() => !isSubmitting && setShowConfirmationModal(false)}
          onConfirm={handleFinalSubmit}
          formData={formData}
          isSubmitting={isSubmitting}
        />
        
        {/* Questions List Modal */}
        {showQuestionList && (
          <>
          {console.log("-------Form data being passed to QuestionList:------", formData)}
          <QuestionList 
            questions={generatedQuestions}
            formData={formData}
            isLoading={isSubmitting}
            onClose={() => {
              setShowQuestionList(false);
              router.push('/dashboard');
            }}
          />
        </>
        )}
    </div>
  )
}

export default CreateInterview