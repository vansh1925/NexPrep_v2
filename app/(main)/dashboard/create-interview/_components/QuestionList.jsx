"use client";
import React, { useState } from 'react';

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
                    <h2 className="text-2xl font-bold mb-6">Generating Interview Questions</h2>
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="mt-6 text-lg">Our AI is crafting personalized questions for this interview...</p>
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Generated Interview Questions</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
                    {/* Questions list sidebar */}
                    <div className="md:w-1/3 overflow-y-auto border-r pr-4 border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-2">Questions ({parsedQuestions.length})</h3>
                        <div className="space-y-2">
                            {parsedQuestions.map((q, index) => (
                                <div 
                                    key={index}
                                    className={`p-3 rounded-md cursor-pointer ${activeQuestion === index ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-100 border-l-4 border-transparent'}`}
                                    onClick={() => setActiveQuestion(index)}
                                >
                                    <p className="font-medium text-sm">{`Q${index + 1}: ${q.question.substring(0, 70)}${q.question.length > 70 ? '...' : ''}`}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Question detail view */}
                    <div className="md:w-2/3 overflow-y-auto">
                        {activeQuestion !== null ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <h3 className="font-bold text-lg mb-2">Question:</h3>
                                    <p>{parsedQuestions[activeQuestion].question}</p>
                                </div>
                                
                                <div className="p-4 bg-blue-50 rounded-md">
                                    <h3 className="font-bold text-lg mb-2">Tests:</h3>
                                    <p>{parsedQuestions[activeQuestion].tests}</p>
                                </div>
                                
                                <div className="p-4 bg-green-50 rounded-md">
                                    <h3 className="font-bold text-lg mb-2">Sample Answer:</h3>
                                    <p>{parsedQuestions[activeQuestion].sampleAnswer}</p>
                                </div>
                                
                                {parsedQuestions[activeQuestion].followUps && parsedQuestions[activeQuestion].followUps.length > 0 && (
                                    <div className="p-4 bg-purple-50 rounded-md">
                                        <h3 className="font-bold text-lg mb-2">Follow-up Questions:</h3>
                                        <ul className="list-disc pl-5">
                                            {parsedQuestions[activeQuestion].followUps.map((followUp, i) => (
                                                <li key={i} className="mb-1">{followUp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a question to view details
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionList;