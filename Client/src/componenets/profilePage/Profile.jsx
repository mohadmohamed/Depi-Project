import React, { useEffect } from "react";
import ProgressChart from "./ProgressChart";
import "./Profile.css";
import Header from "../resume/Header";
import Footer from "../resume/Footer";
import { jwtDecode } from "jwt-decode"; // Use named import instead of default import
import { useNavigate } from "react-router-dom";
import { useGlobalErrorHandler } from "../../hooks/useErrorHandler";
import ErrorDisplay, { InlineError } from "../../components/common/ErrorDisplay";
export default function Profile() {

    const token = sessionStorage.getItem("authToken");
    const navigate = useNavigate();
    const [latestResumeScan, setLatestResumeScan] = React.useState(null);
    const [latestInterviewScore, setLatestInterviewScore] = React.useState(null);
    const [resumeLoading, setResumeLoading] = React.useState(false);
    const [interviewLoading, setInterviewLoading] = React.useState(false);
    const [resumeError, setResumeError] = React.useState('');
    const [interviewError, setInterviewError] = React.useState('');
    const [parsedFeedback, setParsedFeedback] = React.useState({});
     const cleanAndParseJson = (jsonString) => {
                    if (!jsonString) return null;
                    
                    let cleanJson = jsonString.trim();
                    if (cleanJson.startsWith('```json')) {
                        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                    } else if (cleanJson.startsWith('```')) {
                        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
                    }
                    
                    try {
                        return JSON.parse(cleanJson);
                    } catch (error) {
                        console.error("Error parsing cleaned JSON, trying original:", error);
                        try {
                            return JSON.parse(jsonString);
                        } catch (fallbackError) {
                            console.error("Error parsing original JSON too:", fallbackError);
                            return null;
                        }
                    }
                };
    // Add error handling for token decoding
    let decryptedToken = null;
    try {
        decryptedToken = token ? jwtDecode(token) : null;
    } catch (error) {
        console.error("Invalid JWT token:", error);
        // Clear invalid token
        sessionStorage.removeItem("authToken");
    }
    
    console.log("Decrypted Token:", decryptedToken);    
    
    useEffect(() => {
        if (!decryptedToken?.sub) {
            return;
        }

        const controller = new AbortController();
        const url = `http://localhost:5197/api/Resume/latestAnalysis?userid=${decryptedToken.sub}`;

        setResumeLoading(true);
        setResumeError('');

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Resume analysis request failed (${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setLatestResumeScan(data);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('Failed to load resume analysis:', err);
                    setLatestResumeScan(null);
                    setResumeError('We couldn\'t load your latest resume analysis.');
                }
            })
            .finally(() => {
                setResumeLoading(false);
            });

        return () => controller.abort();
    }, [decryptedToken?.sub]);

    useEffect(() => {
        if (!decryptedToken?.sub) {
            return;
        }

        const controller = new AbortController();
        const url = `http://localhost:5197/api/Interview/id?userId=${decryptedToken.sub}`;

        setInterviewLoading(true);
        setInterviewError('');

        fetch(url, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Interview summary request failed (${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setLatestInterviewScore(data);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('Failed to load interview summary:', err);
                    setLatestInterviewScore(null);
                    setInterviewError('We couldn\'t load your latest interview summary.');
                }
            })
            .finally(() => {
                setInterviewLoading(false);
            });

        return () => controller.abort();
    }, [decryptedToken?.sub]);

    // Parse feedback when latestResumeScan changes
    useEffect(() => {
        if (latestResumeScan) {
            const feedbackJson = latestResumeScan.latestAnalysis?.feedbackJson || latestResumeScan.feedbackJson;
            const feedback = cleanAndParseJson(feedbackJson);
            setParsedFeedback(feedback || {});
        }
    }, [latestResumeScan]);

    console.log("Latest Resume Scan:", latestResumeScan);
    console.log("Latest Interview Score:", latestInterviewScore);
    console.log("Parsed Feedback:", parsedFeedback);
    return (
        <>
        <Header isLoggedIn={!!token}/>
        <div className="profile-container">
            <div className="profile-content">
                {/* User Header */}
                
                <div className="user-header">
                    <div className="left-side">
                    <div className="user-avatar">
                        {decryptedToken.name.charAt(0)}
                    </div>
                    <div className="user-info">
                        <div className="user-name">Hello, {decryptedToken.name}</div>
                        <div className="user-email">{decryptedToken.email}</div>
                    </div>
                </div>
                    <div className="logout">
                        <button className="logout-button" onClick={() => {
                            sessionStorage.removeItem("authToken");
                            navigate("/");
                            window.location.reload();
                        }}>
                            Logout
                        </button>
                    </div>
                </div>
                
                {/* Main Grid */}
                <div className="main-grid">
                    {/* Resume Scan Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Latest Resume Scan</h2>
                            <span className="card-badge badge-recent">Recent</span>
                        </div>
                        {resumeLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner">Loading...</div>
                            </div>
                        ) : resumeError ? (
                            <div className="error-container">
                                <p className="error-message">{resumeError}</p>
                            </div>
                        ) : latestResumeScan ? (
                            <>
                                <div className="score-container">
                                    <div className="score-circle score-blue">
                                        {(() => {
                                            try {
                                                // Check if we have the nested structure or direct structure
                                                const feedbackJson = latestResumeScan.latestAnalysis?.feedbackJson || latestResumeScan.feedbackJson;
                                                if (!feedbackJson) return 'N/A';
                                                const feedback = cleanAndParseJson(feedbackJson);
                                                console.log('Parsed feedback:', feedback);
                                                return feedback?.overallScore.score+ "%" || 'N/A';
                                            } catch (error) {
                                                console.error('Error parsing feedback JSON:', error);
                                                return 'N/A';
                                            }
                                        })()}
                                    </div>
                                    <div className="score-info">
                                        <div className="score-label">job</div>
                                        <div className="score-value">
                                            {(() => {
                                                try {
                                                    // Check if we have the nested structure or direct structure
                                                    const feedbackJson = latestResumeScan.latestAnalysis?.feedbackJson || latestResumeScan.feedbackJson;
                                                    if (!feedbackJson) return 'Not specified';
                                                    const feedback = cleanAndParseJson(feedbackJson);
                                                    return feedback?.targetJob || 'Not specified';
                                                } catch (error) {
                                                    console.error('Error parsing feedback JSON:', error);
                                                    return 'Not specified';
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-box">
                                    <div className="info-header">
                                        <span className="count-badge count-red">
                                            {parsedFeedback?.criticalGaps ? parsedFeedback.criticalGaps.length : 0}
                                        </span> 
                                        critical gaps found
                                    </div>
                                    <ul className="issue-list">
                                        {parsedFeedback?.criticalGaps && parsedFeedback.criticalGaps.length > 0 ? (
                                            parsedFeedback.criticalGaps.slice(0, 3).map((gap, index) => (
                                                <li key={index} className="issue-item">{gap}</li>
                                            ))
                                        ) : (
                                            <li className="issue-item">No critical gaps identified</li>
                                        )}
                                        {parsedFeedback?.criticalGaps && parsedFeedback.criticalGaps.length > 3 && (
                                            <li className="issue-item">...and {parsedFeedback.criticalGaps.length - 3} more</li>
                                        )}
                                    </ul>
                                </div>
                                <button className="action-button button-blue" onClick={()=>{
                                    navigate("/resume")
                                }}>
                                    View Details
                                </button>
                            </>
                        ) : (
                            <div className="no-data-container">
                                <p>No resume analysis available</p>
                                <button className="action-button button-blue">
                                    Upload Resume
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Mock Interview Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Mock Interview</h2>
                            <span className="card-badge badge-completed">
                                {latestInterviewScore ? 'Completed' : 'No Data'}
                            </span>
                        </div>
                        {interviewLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner">Loading...</div>
                            </div>
                        ) : interviewError ? (
                            <div className="error-container">
                                <p className="error-message">{interviewError}</p>
                            </div>
                        ) : latestInterviewScore ? (
                            <>
                                <div className="score-container">
                                    <div className="score-circle score-indigo">
                                        {(() => {
                                            try {
                                                const questionsData = cleanAndParseJson(latestInterviewScore.questionsJson);
                                                if (!questionsData?.quiz) return '0%';
                                                
                                                return `${latestInterviewScore.score}%`;
                                            } catch (error) {
                                                console.error('Error calculating score percentage:', error);
                                                return latestInterviewScore.score ? `${latestInterviewScore.score}%` : '0%';
                                            }
                                        })()}
                                    </div>
                                    <div className="score-info">
                                        <div className="score-label">Score</div>
                                        <div className="score-value">
                                            {(() => {
                                                try {
                                                    const questionsData = cleanAndParseJson(latestInterviewScore.questionsJson);
                                                    console.log('Parsed questions data:', questionsData);
                                                    return questionsData?.targetJob || latestInterviewScore.targetJob || 'Not specified';
                                                } catch {
                                                    return latestInterviewScore.targetJob || 'Not specified';
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-box">
                                    <div className="info-header"> 
                                        questions answeres
                                    </div>
                                    <ul className="issue-list">
                                        {(() => {
                                            try {
                                                const questionsData = cleanAndParseJson(latestInterviewScore.questionsJson);
                                                if (!questionsData?.quiz) return <li className="issue-item">No questions available</li>;
                                                
                                                return questionsData.quiz.slice(0, 5).map((question, index) => (
                                                    <li key={index} className="issue-item">
                                                        Q{index + 1}: {question.correctAnswer}
                                                    </li>
                                                ));
                                            } catch (error) {
                                                console.error('Error parsing quiz data:', error);
                                                return <li className="issue-item">Unable to load correct answers</li>;
                                            }
                                        })()}
                                        {(() => {
                                            try {
                                                const questionsData = cleanAndParseJson(latestInterviewScore.questionsJson);
                                                if (questionsData?.quiz && questionsData.quiz.length > 6) {
                                                    return <li className="issue-item">...and {questionsData.quiz.length - 3} more answers</li>;
                                                }
                                                return null;
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    </ul>
                                </div>
                                <button className="action-button button-indigo" onClick={()=>{
                                    navigate("/interviews")
                                }}>
                                    View Full Interview
                                </button>
                            </>
                        ) : (
                            <div className="no-data-container">
                                <p>No interview data available</p>
                                <button className="action-button button-indigo">
                                    Start Interview
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="action-button-large" onClick={()=>{
                        navigate("/upload");
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Upload Resume
                    </button>
                    <button className="action-button-large action-button-indigo" onClick={()=>{
                        navigate("/interviews")
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        latest Interviews
                    </button>
                    <button className="action-button-large action-button-indigo" onClick={()=>{
                        navigate("/resume")
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        latest resume analysis
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
}