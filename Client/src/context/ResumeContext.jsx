import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext();

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};

export const ResumeProvider = ({ children }) => {
    // Initialize from sessionStorage if available
    const [selectedResumeId, setSelectedResumeId] = useState(() => {
        const stored = sessionStorage.getItem('selectedResumeId');
        return stored ? parseInt(stored) : null;
    });
    const [selectedTargetJob, setSelectedTargetJob] = useState(() => {
        return sessionStorage.getItem('selectedTargetJob') || '';
    });
    const [resumes, setResumes] = useState([]);
    const [analysisData, setAnalysisData] = useState(null);
    
    const selectResume = (resumeId, targetJob = '') => {
        setSelectedResumeId(resumeId);
        setSelectedTargetJob(targetJob);
        // Also store in sessionStorage as backup
        sessionStorage.setItem('selectedResumeId', resumeId);
        sessionStorage.setItem('selectedTargetJob', targetJob);
    };
    
    const clearSelection = () => {
        setSelectedResumeId(null);
        setSelectedTargetJob('');
        setAnalysisData(null);
        sessionStorage.removeItem('selectedResumeId');
        sessionStorage.removeItem('selectedTargetJob');
    };
    
    const value = {
        // State
        selectedResumeId,
        selectedTargetJob,
        resumes,
        analysisData,
        
        // Actions
        selectResume,
        clearSelection,
        setResumes,
        setAnalysisData,
        setSelectedResumeId,
        setSelectedTargetJob
    };
    
    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};