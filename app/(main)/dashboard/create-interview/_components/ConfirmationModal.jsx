"use client";
import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, formData, isSubmitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Interview Confirmation</h2>
        {isSubmitting ? (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4">Generating interview questions with AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        ) : (
          <>
            <p className="mb-4">Are you sure you want to create this interview?</p>
            
            <div className="mb-4 max-h-52 overflow-y-auto bg-gray-50 p-3 rounded-md">
              <div className="mb-2">
                <span className="font-medium">Job Position:</span> {formData.jobPosition}
              </div>
              <div className="mb-2">
                <span className="font-medium">Experience:</span> {
                  {
                    'entry': 'Entry Level (0-2 years)',
                    'mid': 'Mid Level (2-5 years)',
                    'senior': 'Senior Level (5-8 years)',
                    'expert': 'Expert Level (8+ years)'
                  }[formData.experienceLevel]
                }
              </div>
              <div className="mb-2">
                <span className="font-medium">Duration:</span> {formData.interviewDuration}
              </div>
              <div className="mb-2">
                <span className="font-medium">Types:</span> {formData.interviewType.join(', ')}
              </div>
              <div className="mb-2">
                <span className="font-medium">Difficulty:</span> {formData.difficultyLevel}
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                disabled={isSubmitting}
              >
                Confirm & Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
