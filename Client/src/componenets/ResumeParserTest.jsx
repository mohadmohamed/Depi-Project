// ResumeParserTest.jsx
// Component to test the resume parser API

import React, { useState } from 'react';
import './ResumeParserTest.css';

const ResumeParserTest = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedResult, setParsedResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiStatus, setApiStatus] = useState('unknown');
    const [useAI, setUseAI] = useState(false);
    const [apiInfo, setApiInfo] = useState(null);

    // Sample resume text for testing
    const sampleResume = `John Doe
Senior Software Engineer
john.doe@techcorp.com
Phone: (555) 123-4567

PROFESSIONAL EXPERIENCE

Senior Software Engineer at Tech Corporation
January 2020 - Present
• Developed web applications using Python, React, and Node.js
• Led team of 5 developers on microservices architecture
• Implemented CI/CD pipelines with Docker and Kubernetes
• Worked with AWS cloud services and PostgreSQL databases

Software Developer at StartupXYZ Inc.
June 2018 - December 2019
• Built REST APIs using Python FastAPI framework
• Performed data analysis with SQL and machine learning
• Collaborated with cross-functional teams using Git version control

EDUCATION

Bachelor of Science in Computer Science
University of Technology, 2012-2016

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, Java, SQL
Frontend: React, Angular, HTML, CSS
Backend: Node.js, FastAPI, Django
Tools: Git, Docker, Kubernetes, AWS, Azure
Databases: PostgreSQL, MongoDB
Other: Machine Learning, AI, Project Management, Leadership`;

    const sampleJob = `We are seeking a Senior Python Developer to join our team. 

Requirements:
- 5+ years of experience with Python programming
- Experience with FastAPI or Django frameworks
- Knowledge of React for frontend development
- Familiarity with Docker and Kubernetes
- Experience with AWS cloud services
- Strong SQL and database skills
- Git version control experience
- Leadership and project management abilities`;

    // Check if API is running
    const checkApiStatus = async () => {
        try {
            const response = await fetch('http://localhost:8001/');
            if (response.ok) {
                const info = await response.json();
                setApiInfo(info);
                setApiStatus('running');
                return true;
            }
        } catch (err) {
            console.log('API check failed:', err);
            setApiStatus('not-running');
            setApiInfo(null);
            return false;
        }
        return false;
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type === 'text/plain') {
                setSelectedFile(file);
                setResumeText(''); // Clear text when file is selected
                setError(null);
            } else {
                setError('Please select a PDF or TXT file');
                setSelectedFile(null);
            }
        }
    };

    // Parse resume function
    const parseResume = async () => {
        setLoading(true);
        setError(null);
        setParsedResult(null);

        try {
            // Check if API is running first
            const isApiRunning = await checkApiStatus();
            if (!isApiRunning) {
                throw new Error('Resume Parser API is not running. Please start it first.');
            }

            // Check if we have either file or text
            if (!selectedFile && !resumeText.trim()) {
                throw new Error('Please select a file or enter resume text');
            }

            const formData = new FormData();
            
            // Add file or text
            if (selectedFile) {
                formData.append('file', selectedFile);
            } else {
                formData.append('resume_text', resumeText);
            }
            
            // Add job description if provided
            if (jobDescription.trim()) {
                formData.append('job_description', jobDescription);
            }

            // Add AI preference
            formData.append('use_ai', useAI);

            // Add AI preference
            formData.append('use_ai', useAI);

            // Debug: Log what we're sending
            console.log('Sending FormData:');
            for (let [key, value] of formData.entries()) {
                console.log(key, ':', value);
            }

            const response = await fetch('http://localhost:8001/parse_resume/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('API Success Response:', result);
            setParsedResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load sample data
    const loadSampleData = () => {
        setResumeText(sampleResume);
        setJobDescription(sampleJob);
    };

    // Clear all data
    const clearData = () => {
        setResumeText('');
        setJobDescription('');
        setSelectedFile(null);
        setParsedResult(null);
        setError(null);
    };

    return (
        <div className="resume-parser-test">
            <div className="header">
                <h2>🤖 Resume Parser Test</h2>
                <div className="api-status">
                    <span className={`status-indicator ${apiStatus}`}></span>
                    API Status: {apiStatus === 'running' ? '✅ Running' : apiStatus === 'not-running' ? '❌ Not Running' : '❓ Unknown'}
                    {apiInfo && (
                        <div className="api-details">
                            <small>
                                v{apiInfo.version} | 
                                AI: {apiInfo.features?.ai_parsing ? '✅' : '❌'} | 
                                PDF: {apiInfo.features?.pdf_upload ? '✅' : '❌'}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            <div className="controls">
                <button onClick={loadSampleData} className="sample-btn">
                    📄 Load Sample Data
                </button>
                <button onClick={clearData} className="clear-btn">
                    🗑️ Clear All
                </button>
                <button onClick={checkApiStatus} className="check-btn">
                    🔄 Check API
                </button>
                
                <div className="ai-toggle">
                    <label htmlFor="ai-checkbox" className="ai-label">
                        <input
                            id="ai-checkbox"
                            type="checkbox"
                            checked={useAI}
                            onChange={(e) => setUseAI(e.target.checked)}
                            disabled={!apiInfo?.features?.ai_parsing}
                        />
                        🤖 Use AI Parsing {!apiInfo?.features?.ai_parsing && '(Not Available)'}
                    </label>
                </div>
            </div>

            <div className="input-section">
                <div className="input-group">
                    <label htmlFor="file-upload">📎 Upload Resume File (PDF or TXT):</label>
                    <div className="file-upload-container">
                        <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,.txt"
                            onChange={handleFileSelect}
                            className="file-input"
                        />
                        {selectedFile && (
                            <div className="file-info">
                                <span className="file-name">📄 {selectedFile.name}</span>
                                <button 
                                    onClick={() => setSelectedFile(null)} 
                                    className="remove-file-btn"
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="divider">
                        <span>OR</span>
                    </div>
                    
                    <label htmlFor="resume">Resume Text:</label>
                    <textarea
                        id="resume"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste resume text here..."
                        rows={8}
                        disabled={selectedFile !== null}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="job">Job Description (Optional):</label>
                    <textarea
                        id="job"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job description here for matching..."
                        rows={8}
                    />
                </div>
            </div>

            <div className="parse-section">
                <button 
                    onClick={parseResume} 
                    disabled={(!resumeText.trim() && !selectedFile) || loading}
                    className="parse-btn"
                >
                    {loading ? '⏳ Parsing...' : '🚀 Parse Resume'}
                </button>
            </div>

            {error && (
                <div className="error-section">
                    <h3>❌ Error:</h3>
                    <p>{error}</p>
                    <div className="error-help">
                        <p>To start the API server:</p>
                        <code>cd ai-models && python resume_parser_hybrid.py</code>
                        <p>API should be running on: <strong>http://localhost:8001</strong></p>
                        <p><em>Note: AI features require additional dependencies (transformers, torch)</em></p>
                    </div>
                </div>
            )}

            {parsedResult && (
                <div className="results-section">
                    <h3>✅ Parsing Results:</h3>
                    
                    <div className="result-grid">
                        <div className="result-card">
                            <h4>👤 Personal Info</h4>
                            <p><strong>Name:</strong> {parsedResult.parsed_resume.full_name}</p>
                            <p><strong>Email:</strong> {parsedResult.parsed_resume.email}</p>
                            <p><strong>Phone:</strong> {parsedResult.parsed_resume.phone}</p>
                        </div>

                        <div className="result-card">
                            <h4>💼 Skills ({parsedResult.parsed_resume.skills.length})</h4>
                            <div className="skills-list">
                                {parsedResult.parsed_resume.skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="result-card">
                            <h4>🎓 Education</h4>
                            {parsedResult.parsed_resume.education.length > 0 ? (
                                <ul>
                                    {parsedResult.parsed_resume.education.map((edu, idx) => (
                                        <li key={idx}>{edu}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No education found</p>
                            )}
                        </div>

                        <div className="result-card">
                            <h4>💻 Experience</h4>
                            {parsedResult.parsed_resume.experience.length > 0 ? (
                                <ul>
                                    {parsedResult.parsed_resume.experience.map((exp, idx) => (
                                        <li key={idx}>{exp}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No experience found</p>
                            )}
                        </div>

                        {parsedResult.parsed_resume.job_matching && (
                            <div className="result-card">
                                <h4>📊 Job Matching</h4>
                                <p><strong>Score:</strong> {parsedResult.parsed_resume.job_matching.matching_score}%</p>
                                <p><strong>Common Keywords:</strong> {parsedResult.parsed_resume.job_matching.common_keywords.length}</p>
                                <p><strong>Missing Keywords:</strong> {parsedResult.parsed_resume.job_matching.missing_keywords.join(', ') || 'None'}</p>
                            </div>
                        )}

                        <div className="result-card">
                            <h4>📈 Summary</h4>
                            <p><strong>Parsing Method:</strong> {parsedResult.parsed_resume.parsing_method}</p>
                            <p><strong>Text Length:</strong> {parsedResult.original_text_length} chars</p>
                            <p><strong>Skills Found:</strong> {parsedResult.parsed_resume.summary.total_skills_found}</p>
                            <p><strong>Education:</strong> {parsedResult.parsed_resume.summary.total_education_entries}</p>
                            <p><strong>Experience:</strong> {parsedResult.parsed_resume.summary.total_experience_entries}</p>
                            {parsedResult.processing_info && (
                                <p><strong>File Type:</strong> {parsedResult.processing_info.file_type}</p>
                            )}
                        </div>
                    </div>

                    <div className="json-output">
                        <h4>🔍 Raw JSON Output:</h4>
                        <pre>{JSON.stringify(parsedResult, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeParserTest;