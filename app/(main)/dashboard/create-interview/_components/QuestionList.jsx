"use client";
import React, { useState } from 'react';
import { CheckCircle, FileText, Play } from 'lucide-react';

function QuestionList({ questions = [], formData = {}, isLoading = false, onClose }) {
    const [activeQuestion, setActiveQuestion] = useState(null);
    
    // Parse the questions JSON if it's a string
    const parseQuestions = () => {
        if (!questions) return [];
        
        if (typeof questions === 'string') {
            try {
                // Remove any Markdown code block markers that might be present
                let cleanJson = questions;
                
                // Remove Markdown code block markers if present (```json and ```)
                cleanJson = cleanJson.replace(/```json\s*/, '');
                cleanJson = cleanJson.replace(/```\s*$/, '');
                cleanJson = cleanJson.replace(/```/, '');
                
                // Also handle any HTML tags that might have been included
                cleanJson = cleanJson.replace(/<\/?[^>]+(>|$)/g, '');
                
                // Try to parse the cleaned JSON
                console.log("Attempting to parse cleaned JSON:", cleanJson);
                return JSON.parse(cleanJson);
            } catch (firstError) {
                console.error("Failed to parse cleaned JSON:", firstError);
                
                try {
                    // If that fails, try to extract just the array part
                    const arrayMatch = questions.match(/\[\s*\{.*\}\s*\]/s);
                    if (arrayMatch) {
                        console.log("Attempting to parse extracted array:", arrayMatch[0]);
                        return JSON.parse(arrayMatch[0]);
                    }
                } catch (secondError) {
                    console.error("Failed to parse extracted array:", secondError);
                }
                
                console.error("All parsing attempts failed for:", questions);
                return [];
            }
        }
        
        return Array.isArray(questions) ? questions : [];
    };
    
    const parsedQuestions = parseQuestions();
    
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Generating Interview Questions</h2>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-6 text-lg text-gray-600">Our AI is crafting personalized questions for your interview...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!parsedQuestions.length) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 w-full max-w-3xl">
                    <h2 className="text-2xl font-bold mb-6">Generated Content</h2>
                    <p className="mb-3">The AI generated content, but it couldn't be parsed into the expected format.</p>
                    
                    {/* Show the raw response */}
                    <div className="border border-gray-300 rounded-md p-4 mb-6 bg-gray-50 max-h-96 overflow-y-auto">
                        <h3 className="font-bold mb-2">Raw Response:</h3>
                        <pre className="whitespace-pre-wrap text-sm">
                            {typeof questions === 'string' ? questions : JSON.stringify(questions, null, 2)}
                        </pre>
                    </div>
                    
                    <div className="flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Interview Questions Generated!</h2>
                            <p className="text-gray-600">Your personalized interview is ready</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Interview Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-semibold text-blue-900">Interview Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-blue-700 font-medium">Position:</span>
                            <p className="text-blue-800">{formData.jobPosition || 'Not specified'}</p>
                        </div>
                        <div>
                            <span className="text-blue-700 font-medium">Experience:</span>
                            <p className="text-blue-800">{formData.experienceLevel || 'Not specified'}</p>
                        </div>
                        <div>
                            <span className="text-blue-700 font-medium">Questions:</span>
                            <p className="text-blue-800">{parsedQuestions.length} questions</p>
                        </div>
                    </div>
                </div>
                
                {/* Questions List */}
                <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-gray-800 mb-4">Interview Questions ({parsedQuestions.length})</h3>
                    <div className="h-full overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {parsedQuestions.map((question, index) => (
                                <div 
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium leading-relaxed">
                                                {question.question}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Ready to start your interview? Click continue to begin.
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Start Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionList;