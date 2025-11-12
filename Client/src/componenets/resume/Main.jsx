import ResumeScoreCard from "./ResumeScoreCard";
import React from "react"
import { jwtDecode } from 'jwt-decode';
import { useResume } from '../../context/ResumeContext';
import './resumeAnalysis.css';

export default function Main() {
    const [resumeAnalysis, setResumeAnalysis] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [loadingMessage, setLoadingMessage] = React.useState("Initializing...");
    const [error, setError] = React.useState(null);
    const [pastAnalyses, setPastAnalyses] = React.useState([]);
    const [selectedAnalysisId, setSelectedAnalysisId] = React.useState('latest');
    const [analysesLoading, setAnalysesLoading] = React.useState(false);
    const token = sessionStorage.getItem("authToken");
    
    // Use Resume Context
    const { 
        analysisData, 
        setAnalysisData 
    } = useResume();
    
    // Memoize decryptToken to prevent infinite loops
    const decryptToken = React.useMemo(() => {
        try {
            return token ? jwtDecode(token) : null;
        } catch (error) {
            console.error("Invalid JWT token:", error);
            sessionStorage.removeItem("authToken");
            return null;
        }
    }, [token]);
    
    // Fetch all past analyses for dropdown
    React.useEffect(() => {
        if (decryptToken?.sub) {
            setAnalysesLoading(true);
            fetch(`http://localhost:5197/api/Resume/id?userid=${decryptToken.sub}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch analyses');
                return res.json();
            })
            .then(data => {
                console.log("Past analyses data:", data);
                setPastAnalyses(data.resume || []);
                setAnalysesLoading(false);
            })
            .catch(error => {
                console.error("Error fetching past analyses:", error);
                setPastAnalyses([]);
                setAnalysesLoading(false);
            });
        }
    }, [decryptToken, token]);
    
    React.useEffect(() => {
        if (decryptToken?.sub) {
            setLoading(true);
            setError(null);
            
            if (selectedAnalysisId === 'latest') {
                setLoadingMessage("🔍 Loading your latest resume analysis...");
                console.log("Fetching latest analysis for user:", decryptToken.sub);
                
                setTimeout(() => {
                    setLoadingMessage("📊 Retrieving your most recent analysis...");
                }, 500);
                
                fetch(`http://localhost:5197/api/Resume/latestAnalysis?userid=${decryptToken.sub}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                console.log("Latest Analysis API Response status:", res.status);
                if (!res.ok) {
                    return res.text().then(text => Promise.reject(`Latest Analysis API Error: ${res.status} - ${text}`));
                }
                return res.json();
            })
            .then(data => {
                console.log("Latest Analysis Raw API Response:", data);
                setLoadingMessage("🔄 Processing your latest analysis...");
                setResumeAnalysis(data);
                
                let parsedAnalysis = null;
                
                // Helper function to clean and parse JSON
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
                
                if (data && data.latestAnalysis && data.latestAnalysis.feedbackJson) {
                    // If feedbackJson is in latestAnalysis object
                    parsedAnalysis = cleanAndParseJson(data.latestAnalysis.feedbackJson);
                    if (parsedAnalysis) {
                        console.log("Parsed from latestAnalysis.feedbackJson:", parsedAnalysis);
                    }
                } else if (data && data.feedbackJson) {
                    // If feedbackJson is directly in data
                    parsedAnalysis = cleanAndParseJson(data.feedbackJson);
                    if (parsedAnalysis) {
                        console.log("Parsed latest analysis:", parsedAnalysis);
                    }
                } else if (data && typeof data === 'object' && data.targetJob) {
                    parsedAnalysis = data;
                    console.log("Latest analysis data is already parsed:", parsedAnalysis);
                }
                
                if (parsedAnalysis) {
                    setLoadingMessage("✅ Your latest analysis is ready!");
                    setTimeout(() => {
                        setAnalysisData(parsedAnalysis);
                        setLoading(false);
                    }, 300);
                } else {
                    console.error("No valid latest analysis data found:", data);
                    setError("No recent analysis found. Please analyze a resume first.");
                    setLoading(false);
                }
            })
                .catch(error => {
                    console.error("Latest Analysis fetch error:", error);
                    setError(`Failed to load latest analysis: ${error.toString()}`);
                    setLoading(false);
                });
            } else {
                // Fetch specific analysis by resume ID
                setLoadingMessage("🔍 Loading selected resume analysis...");
                console.log("Fetching specific analysis for resume:", selectedAnalysisId);
                
                setTimeout(() => {
                    setLoadingMessage("📊 Retrieving selected analysis...");
                }, 500);
                
                fetch(`http://localhost:5197/api/Resume/analysis?userid=${decryptToken.sub}&resumeid=${selectedAnalysisId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(res => {
                    console.log("Specific Analysis API Response status:", res.status);
                    if (!res.ok) {
                        return res.text().then(text => Promise.reject(`Specific Analysis API Error: ${res.status} - ${text}`));
                    }
                    return res.json();
                })
                .then(data => {
                    console.log("Specific Analysis Raw API Response:", data);
                    setLoadingMessage("🔄 Processing selected analysis...");
                    setResumeAnalysis(data);
                    
                    let parsedAnalysis = null;
                    
                    // Helper function to clean and parse JSON
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
                    
                    if (data && data.resumeAnalysis && data.resumeAnalysis.feedbackJson) {
                        parsedAnalysis = cleanAndParseJson(data.resumeAnalysis.feedbackJson);
                        if (parsedAnalysis) {
                            console.log("Parsed from resumeAnalysis.feedbackJson:", parsedAnalysis);
                        }
                    } else if (data && data.feedbackJson) {
                        parsedAnalysis = cleanAndParseJson(data.feedbackJson);
                        if (parsedAnalysis) {
                            console.log("Parsed from direct feedbackJson:", parsedAnalysis);
                        }
                    } else if (data && typeof data === 'object' && data.targetJob) {
                        parsedAnalysis = data;
                        console.log("Data is already parsed analysis:", parsedAnalysis);
                    }
                    
                    if (parsedAnalysis) {
                        setLoadingMessage("✅ Selected analysis is ready!");
                        setTimeout(() => {
                            setAnalysisData(parsedAnalysis);
                            setLoading(false);
                        }, 300);
                    } else {
                        console.error("No valid analysis data found for selected resume:", data);
                        setError("No analysis data found for this resume. Please run an analysis first.");
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error("Specific Analysis fetch error:", error);
                    setError(`Failed to load selected analysis: ${error.toString()}`);
                    setLoading(false);
                });
            }
        }
    }, [decryptToken, token, selectedAnalysisId, setAnalysisData]);

    console.log("Resume Analysis:", resumeAnalysis);
    console.log("Parsed Analysis Data:", analysisData);

    // Handle dropdown selection change
    const handleAnalysisSelection = (e) => {
        const selectedValue = e.target.value;
        setSelectedAnalysisId(selectedValue);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{loadingMessage}</p>
                <div className="loading-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
                <small>This may take a few moments...</small>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>❌ Error Loading Analysis</h3>
                <p>{error}</p>
                <div className="error-actions">
                    <button onClick={() => window.location.reload()}>🔄 Retry</button>
                    <button onClick={() => window.history.back()}>← Go Back</button>
                </div>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="no-data-container">
                <h3>📄 No Analysis Data Found</h3>
                <p>Please make sure you have analyzed a resume first.</p>
                <div className="debug-info">
                    <details>
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify({ resumeAnalysis, analysisData }, null, 2)}</pre>
                    </details>
                </div>
                <button onClick={() => window.history.back()}>← Return to Upload</button>
            </div>
        );
    }

    const score = analysisData.overallScore?.score || 0;
    const getScoreClass = (score) => score >= 70 ? 'good' : score >= 50 ? 'average' : 'needs-improvement';

    return (
        <div className="resume-analysis-container">
            {/* Analysis Selection Dropdown */}
            <div className="analysis-selector">
                <label htmlFor="analysis-dropdown">Select Analysis:</label>
                <select 
                    id="analysis-dropdown"
                    value={selectedAnalysisId} 
                    onChange={handleAnalysisSelection}
                    disabled={analysesLoading}
                    className="analysis-dropdown"
                >
                    <option value="latest">
                        {analysesLoading ? "Loading..." : "Latest Analysis"}
                    </option>
                    {pastAnalyses.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                            Analysis for Resume #{resume.id} - {new Date(resume.uploadedAt || Date.now()).toLocaleDateString()}
                        </option>
                    ))}
                </select>
            </div>
            {/* Overall Score Card */}
            <div className="overall-score">
                <div className={`score-circle ${getScoreClass(score)}`}>
                    <span className="score-number">{score}</span>
                    <span className="score-label text-white" style={{color : "white"}}>Overall Score</span>
                </div>
                <div className="score-summary">
                    <h2>Resume Analysis for {analysisData.targetJob || 'Latest Analysis'}</h2>
                    <p>{analysisData.overallScore?.summary}</p>
                </div>
            </div>

            {/* Key Strengths */}
            <div className="analysis-section strengths">
                <h3>🎯 Key Strengths</h3>
                <div className="strengths-list">
                    {analysisData.keyStrengths && analysisData.keyStrengths.length > 0 ? (
                        analysisData.keyStrengths.map((strength, index) => (
                            <div key={index} className="strength-item">
                                <p>{strength}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No key strengths identified.</p>
                    )}
                </div>
            </div>

            {/* Critical Gaps */}
            <div className="analysis-section gaps">
                <h3>⚠️ Areas for Improvement</h3>
                <div className="gaps-list">
                    {analysisData.criticalGaps && analysisData.criticalGaps.length > 0 ? (
                        analysisData.criticalGaps.map((gap, index) => (
                            <div key={index} className="gap-item">
                                <p>{gap}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">No critical gaps identified.</p>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            <div className="analysis-section recommendations">
                <h3>💡 Recommendations</h3>
                <div className="recommendations-grid">
                    <div className="recommendation-card">
                        <h4>Summary</h4>
                        <p>{analysisData.recommendations?.summary}</p>
                    </div>
                    <div className="recommendation-card">
                        <h4>Skills</h4>
                        <p>{analysisData.recommendations?.skills}</p>
                    </div>
                    <div className="recommendation-card">
                        <h4>Experience</h4>
                        <p>{analysisData.recommendations?.experience}</p>
                    </div>
                </div>
            </div>

            {/* Final Verdict */}
            <div className={`final-verdict ${analysisData.finalVerdict?.hireDecision === 'Interview' ? 'positive' : 'negative'}`}>
                <h3>📋 Final Verdict</h3>
                <div className="verdict-content">
                    <div className="decision">
                        <span className="decision-label">Decision:</span>
                        <span className="decision-value">{analysisData.finalVerdict?.hireDecision}</span>
                    </div>
                    <p className="reasoning">{analysisData.finalVerdict?.reasoning}</p>
                </div>
            </div>
        </div>
    );
}