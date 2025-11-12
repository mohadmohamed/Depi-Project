import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./Interviews.css";
import Header from "../resume/Header";
import Footer from "../resume/Footer";
import { getUserFriendlyError } from "../../utils/errorHandler";
import ErrorDisplay from "../../components/common/ErrorDisplay";

export default function Interviews() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [sessionDetails, setSessionDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const token = sessionStorage.getItem("authToken");
    let decryptedToken = null;
    
    try {
        decryptedToken = token ? jwtDecode(token) : null;
    } catch (error) {
        console.error("Invalid JWT token:", error);
        sessionStorage.removeItem("authToken");
    }



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
    // Fetch all interview sessions
    useEffect(() => {
        if (!decryptedToken?.sub) return;

        const fetchSessions = async () => {
            try {
                const response = await fetch(`http://localhost:5197/api/Interview/all?userid=${decryptedToken.sub}`);
                if (response.ok) {
                    const data = await response.json();
                    // If it's a single session, wrap it in an array
                    const sessionsArray = Array.isArray(data) ? data : [data];
                    setSessions(sessionsArray);
                    if (sessionsArray.length > 0) {
                        setSelectedSession(sessionsArray[0].id.toString());
                    }
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
                setError(getUserFriendlyError(error, 'sessions'));
            }
        };

        fetchSessions();
    }, [decryptedToken?.sub]);

    // Fetch session details when selection changes
    useEffect(() => {
        if (!selectedSession) return;

        const fetchSessionDetails = async () => {
            setLoading(true);
            setError('');
            
            try {
                const session = sessions.find(s => s.id.toString() === selectedSession);
                if (session) {
                    const questionsData = cleanAndParseJson(session.questionsJson);
                    setSessionDetails({
                        ...session,
                        parsedQuestions: questionsData
                    });
                }
            } catch (error) {
                console.error('Error parsing session details:', error);
                setError(getUserFriendlyError(error, 'session-details'));
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [selectedSession, sessions]);
    const calculateScore = () => {
        if (!sessionDetails?.parsedQuestions?.quiz) return { correct: 0, total: 0, percentage: 0 };
        
        let correctCount = 0;
        const totalQuestions = sessionDetails.parsedQuestions.quiz.length;
        
        sessionDetails.parsedQuestions.quiz.forEach((question, index) => {
            const userAnswer = sessionDetails.parsedQuestions.answers?.[index];
            if (userAnswer === question.correctAnswer) {
                correctCount++;
            }
        });
        
        const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        return { correct: sessionDetails.score/10, total: totalQuestions, percentage };
    };

    const scoreData = calculateScore();
    console.log("d",sessionDetails);
    return (
        <>
            <Header isLoggedIn={!!token} />
            <div className="interviews-container">
                <div className="interviews-content">
                    {/* Header Section */}
                    <div className="interviews-header">
                        <h1 className="interviews-title">Interview Sessions</h1>
                        <p className="interviews-subtitle">
                            Review your interview performance and analyze your answers
                        </p>
                        
                        {/* Session Selector */}
                        <div className="session-selector">
                            <select 
                                className="session-select"
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                            >
                                <option value="">Select an interview session</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id.toString()}>
                                        Interview Session {session.id} - {new Date(session.createdAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Interview Details */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : error ? (
                        <div className="interview-details">
                            <ErrorDisplay 
                                error={error}
                                title="Unable to Load Interview Sessions"
                                onRetry={() => setError('')}
                                showRefresh={true}
                                showRetry={true}
                            />
                        </div>
                    ) : !selectedSession ? (
                        <div className="interview-details">
                            <div className="no-session-message">
                                <p>Please select an interview session to view details</p>
                            </div>
                        </div>
                    ) : sessionDetails ? (
                        <div className="interview-details">
                            {/* Score Section */}
                            <div className="score-section">
                                <div className="score-circle">
                                    {sessionDetails.score}%
                                </div>
                                <div className="score-details">
                                    <h2 className="score-title">Interview Performance</h2>
                                    <p style={{color: '#666', marginBottom: '1rem'}}>
                                        Target Position: {sessionDetails.parsedQuestions?.targetJob || 'Not specified'}
                                    </p>
                                    <div className="score-stats">
                                        <div className="stat-item">
                                            <div className="stat-value">{scoreData.correct}</div>
                                            <div className="stat-label">Correct</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{scoreData.total - scoreData.correct}</div>
                                            <div className="stat-label">Incorrect</div>
                                        </div>
                                        <div className="stat-item">
                                            <div className="stat-value">{scoreData.total}</div>
                                            <div className="stat-label">Total Questions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questions Section */}
                            {sessionDetails.parsedQuestions?.quiz && (
                                <div className="questions-section">
                                    <h3 className="section-title">
                                        <div className="section-icon">Q</div>
                                        Question Review
                                    </h3>
                                    <div className="questions-grid">
                                        {sessionDetails.parsedQuestions.quiz.map((question, index) => {
                                            const userAnswer = sessionDetails.parsedQuestions.answers?.[index];
                                            const isCorrect = userAnswer === question.correctAnswer;
                                            console.log("userAnswer",userAnswer);
                                            return (
                                                <div key={index} className="question-card">
                                                    <div className="question-header">
                                                        <div className="question-number">{index + 1}</div>
                                                        <div className="question-text">{question.question}</div>
                                                    </div>
                                                    <div className="question-answers">
                                                        <div className={`answer-item correct`}>
                                                            <div className="answer-label correct"> 
                                                                {question.correctAnswer} : {question.options[question.correctAnswer]}
                                                            </div>
                                                        </div>
                                                </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
            <Footer />
        </>
    );
}