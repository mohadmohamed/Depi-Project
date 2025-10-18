
import React from "react";
import ProgressChart from "./ProgressChart";
import "./Profile.css";
import Header from "../resume/Header";
import Footer from "../resume/Footer";
export default function Profile() {
    const user = {
        userName: "John Doe" , 
        email: "john.doe@example.com"
    };
    
    return (
        <>
        <Header/>
        <div className="profile-container">
            <div className="profile-content">
                {/* User Header */}
                <div className="user-header">
                    <div className="user-avatar">
                        {user.userName.charAt(0)}
                    </div>
                    <div className="user-info">
                        <div className="user-name">Hello, {user.userName}</div>
                        <div className="user-email">{user.email}</div>
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
                        <div className="score-container">
                            <div className="score-circle score-blue">
                                75
                            </div>
                            <div className="score-info">
                                <div className="score-label">Score</div>
                                <div className="score-value">Computer Engineering</div>
                            </div>
                        </div>
                        <div className="info-box">
                            <div className="info-header">
                                <span className="count-badge count-red">5</span> 
                                issues found
                            </div>
                            <ul className="issue-list">
                                <li className="issue-item">Spelling mistakes</li>
                                <li className="issue-item">Grammar issues</li>
                                <li className="issue-item">Formatting problems</li>
                            </ul>
                        </div>
                        <button className="action-button button-blue">
                            View Details
                        </button>
                    </div>
                    
                    {/* Mock Interview Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Mock Interview</h2>
                            <span className="card-badge badge-completed">Completed</span>
                        </div>
                        <div className="score-container">
                            <div className="score-circle score-indigo">
                                82
                            </div>
                            <div className="score-info">
                                <div className="score-label">Score</div>
                                <div className="score-value">Software Development</div>
                            </div>
                        </div>
                        <div className="info-box">
                            <div className="info-header">
                                <span className="count-badge count-orange">3</span> 
                                areas to improve
                            </div>
                            <ul className="issue-list">
                                <li className="issue-item">Technical depth</li>
                                <li className="issue-item">Concise answering</li>
                                <li className="issue-item">Problem-solving approach</li>
                            </ul>
                        </div>
                        <button className="action-button button-indigo">
                            Practice Again
                        </button>
                    </div>
                </div>
                
                {/* Progress Chart Card */}
                <div className="progress-card">
                    <div className="progress-header">
                        <div className="progress-title-container">
                            <h2 className="progress-title">User Progress</h2>
                            <p className="progress-subtitle">Your weekly performance</p>
                        </div>
                        <div className="period-buttons">
                            <button className="period-button period-button-gray">
                                Week
                            </button>
                            <button className="period-button period-button-indigo">
                                Month
                            </button>
                            <button className="period-button period-button-gray">
                                Year
                            </button>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ProgressChart
                            values={[62, 70, 75, 68, 80, 85, 90]}
                            labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]}
                        />
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="action-button-large">
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Upload Resume
                    </button>
                    <button className="action-button-large action-button-indigo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        Start Interview
                    </button>
                    <button className="action-button-large action-button-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
}