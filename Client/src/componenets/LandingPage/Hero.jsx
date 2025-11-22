import React, { useEffect, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import { useResume } from '../../context/ResumeContext';
import { handleError } from '../../utils/errorHandler';
import { InlineError } from '../../components/common/ErrorDisplay';

export default function Hero() {
    const token = sessionStorage.getItem("authToken");
    const [targetJob, setTargetJob] = React.useState("");
    const [resumesLoading, setResumesLoading] = React.useState(false);
    const [analysisLoading, setAnalysisLoading] = React.useState(false);
    const [interviewLoading, setInterviewLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [sessionId , setSessionId] = React.useState(0);
    const navigate = useNavigate();
    
    // Use Resume Context
    const { 
        selectedResumeId, 
        resumes, 
        selectResume, 
        setResumes 
    } = useResume();
    
    // Memoize decryptToken to prevent infinite loops
    const decryptToken = useMemo(() => {
        try {
            return token ? jwtDecode(token) : null;
        } catch (error) {
            console.error("Invalid JWT token:", error);
            sessionStorage.removeItem("authToken");
            return null;
        }
    }, [token]);
    
    const handleCv = () => {
        if (!selectedResumeId || !targetJob) {
            setError("Please select a resume and enter a target job");
            return;
        }
        
        setAnalysisLoading(true);
        setError(null);
        
        // Store selection in context
        selectResume(selectedResumeId, targetJob);
        
        console.log("Starting analysis with:", {
            userId: decryptToken?.sub,
            resumeId: selectedResumeId,
            targetJob: targetJob
        });

        fetch("http://localhost:5197/api/Resume/Analyze", {
            method: "POST",
            body: JSON.stringify({
                "userid": decryptToken?.sub,
                "resumeId": selectedResumeId,
                "targetJob": targetJob
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            console.log("Analysis API Response status:", res.status);
            if (!res.ok) {
                return res.text().then(text => Promise.reject(`Analysis API Error: ${res.status} - ${text}`));
            }
            return res.json();
        })
        .then(data => {
            console.log("Analysis API Response data:", data);
            setAnalysisLoading(false);
            navigate("/resume");
        })
        .catch(error => {
            const userMessage = handleError(error, 'resume-analysis');
            setAnalysisLoading(false);
            setError(userMessage);
        });
    }
    console.log("Selected Resume ID in Hero:", selectedResumeId);
    const handleInterview = () => {
        if (!selectedResumeId || !targetJob) {
            setError("Please select a resume and enter a target job");
            return;
        }

        setInterviewLoading(true);
        setError(null);

        console.log("Starting interview generation with:", {
            userid: decryptToken?.sub,
            resumeid: selectedResumeId,
            targetJob: targetJob
        });

        const formData = new FormData();
        formData.append('userid', parseInt(decryptToken?.sub));
        formData.append('resmueid', parseInt(selectedResumeId));
        formData.append('targetJob', targetJob);
        console.log("Sending interview request with:", {
            userid: parseInt(decryptToken?.sub),
            resumeid: parseInt(selectedResumeId),
            targetJob: targetJob
        });

        fetch(`http://localhost:5197/api/Interview/generate`,{
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body : formData
        })
        .then((res)=> {
            console.log("Interview API Response status:", res.status);
            if (!res.ok) {
                return res.text().then(text => Promise.reject(`Interview API Error: ${res.status} - ${text}`));
            }
            return res.json();
        })
        .then((data)=>{
            console.log("Interview API Response data:", data);
            setInterviewLoading(false);
            setSessionId(data.sessionId);
            sessionStorage.setItem("sessionId", data.sessionId);
            navigate("/questions");
        })
        .catch(error => {
            const userMessage = handleError(error, 'interview');
            setInterviewLoading(false);
            setError(userMessage);
        });
    }

    const handleChange = (e) => {
        setTargetJob(e.target.value);
    }

    const handleResumeChange = (e) => {
        const selectedValue = parseInt(e.target.value);
        console.log("Selected resume ID:", selectedValue); // Debug log
        selectResume(selectedValue, targetJob);
    }

    useEffect(() => {
        // Only fetch if we have a valid decoded token
        if (decryptToken && decryptToken.sub) {
            setResumesLoading(true);
            console.log("Fetching resumes for user:", decryptToken.sub);
            
            fetch(`http://localhost:5197/api/Resume/id?userid=${decryptToken.sub}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                console.log("Resumes API Response status:", res.status);
                if (!res.ok) {
                    return res.text().then(text => Promise.reject(`Resumes API Error: ${res.status} - ${text}`));
                }
                return res.json();
            })
            .then(data => {
                console.log("Resumes API Response data:", data);
                setResumes(data);
                setResumesLoading(false);
            })
            .catch(error => {
                handleError(error, 'resume');
                setResumes([]); // Ensure it stays as array
                setResumesLoading(false);
            });
        }
    }, [decryptToken, token, setResumes]);

    console.log("Resumes:", resumes);
    console.log("Current selectedResumeId:", selectedResumeId);
    console.log("decryptToken?.sub:", decryptToken?.sub);
    console.log("targetJob", targetJob);
    return (
        <section className="hero">
            <div className="hero-inner justify-center">
                <div className="hero-left justify-center ">
                    <h1 className="hero-title">ResumeAnalysis & Mock Interview
                        <span className="hero-subtitle-block">with AI</span>
                    </h1>
                    <p className="hero-lead">Analyze your resume and get a personalized mock interview for Free</p>
                    {!!token && (
                        <div className="hero-email-signup">
                            <input 
                                className="hero-email-input" 
                                type="text" 
                                placeholder="Enter target job position" 
                                id="hero-target-job" 
                                value={targetJob}
                                onChange={handleChange}
                            />
                            <select 
                                name="Resumes" 
                                id="Resume" 
                                value={selectedResumeId || 0} 
                                onChange={handleResumeChange}
                                className="hero-resume-select"
                                key={`select-${selectedResumeId}`}
                                disabled={resumesLoading}
                            >
                                <option value={0}>
                                    {resumesLoading ? "Loading resumes..." : "Select resume"}
                                </option>
                                {Array.isArray(resumes.resume) && resumes.resume.map((resume) => (
                                    <option key={resume.id} value={resume.id}>
                                        {resume.parsedText.slice(0, 25)}...
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {error && (
                        <div className="hero-error">
                            <InlineError error={error} onRetry={() => setError(null)} />
                        </div>
                    )}
                    <div className="hero-ctas">
                        {!token && <button className="cta primary"    onClick={() => navigate("/signup")}>Start for free</button>}
                        {!!token && (
                            <button 
                                className="cta primary" 
                                onClick={handleInterview}
                                disabled={interviewLoading || analysisLoading || resumesLoading}
                            >
                                {interviewLoading ? (
                                    <>
                                        <span className="loading-spinner-small"></span>
                                        Starting Interview...
                                    </>
                                ) : (
                                    "Go to Interview"
                                )}
                            </button>
                        )}
                        {/* {!token && <button className="cta ghost"   onClick={() => {
    document.querySelector(".howitworks")?.scrollIntoView({
      behavior: "smooth"
    });}}> Learn More</button>} */}
                        {!!token && (
                            <button 
                                className="cta ghost" 
                                onClick={handleCv} 
                                disabled={analysisLoading || resumesLoading}
                            >
                                {analysisLoading ? (
                                    <>
                                        <span className="loading-spinner-small"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    "Analyze CV"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}