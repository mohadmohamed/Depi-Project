import React, { useState } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiUser, FiMail, FiBriefcase } from 'react-icons/fi';
import './upload.css';
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import Header from '../resume/Header';
import Footer from '../resume/Footer';
export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);

    try {
      // Get and validate token
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to upload your resume");
      }

      let decryptedToken;
      try {
        decryptedToken = jwtDecode(token);
      } catch (err) {
        console.error("JWT decode error:", err);
        throw new Error("Invalid session. Please log in again");
      }

      const formData = new FormData();
      formData.append('userId', decryptedToken.Sub || decryptedToken.sub || decryptedToken.userId);
      formData.append('file', file);
      console.log('Uploading file:', file.name, 'for userId:', decryptedToken.Sub || decryptedToken.sub || decryptedToken.userId);
      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch("http://localhost:5197/api/Resume/Upload", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorMessage = await response.text();
        }
        
        throw new Error(`Upload failed (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      setUploadSuccess(true);
      Navigate('/resume')
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
    setError(null);
  };
  const token = sessionStorage.getItem("authToken");
  return (
    <>
    <Header isLoggedIn={!!token} />
    <section className="upload-section">
      <div className="upload-container">
        <div className="upload-header">
          <h1 className="upload-title">Upload Your Resume</h1>
          <p className="upload-subtitle">
            Get AI-powered insights and prepare for your next interview
          </p>
        </div>

        <div className="upload-content">
          <div className="upload-left">
            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <>
                  <div className="upload-icon">
                    <FiUpload size={48} />
                  </div>
                  <h3>Drag & drop your resume here</h3>
                  <p>or click to browse files</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <div className="supported-formats">
                    <small>Supported formats: PDF</small>
                  </div>
                </>
              ) : (
                <div className="file-preview">
                  <div className="file-info">
                    <FiFile size={32} />
                    <div className="file-details">
                      <h4>{file.name}</h4>
                      <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={removeFile} className="remove-file">
                      <FiX size={20} />
                    </button>
                  </div>
                  
                  {uploadSuccess ? (
                    <div className="upload-success">
                      <FiCheck size={24} />
                      <span>Upload successful!</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="upload-btn"
                    >
                      {uploading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {uploadSuccess && (
              <div className="next-steps">
                <h3>What's Next?</h3>
                <div className="steps-grid">
                  <div className="step-card">
                    <FiUser />
                    <span>AI Analysis</span>
                  </div>
                  <div className="step-card">
                    <FiBriefcase />
                    <span>Mock Interview</span>
                  </div>
                  <div className="step-card">
                    <FiMail />
                    <span>Get Feedback</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="upload-right">
            <div className="benefits-card">
              <h3>Why Upload Your Resume?</h3>
              <ul className="benefits-list">
                <li>
                  <FiCheck className="check-icon" />
                  <span>Get personalized interview questions</span>
                </li>
                <li>
                  <FiCheck className="check-icon" />
                  <span>Receive AI-powered feedback</span>
                </li>
                <li>
                  <FiCheck className="check-icon" />
                  <span>Track your progress over time</span>
                </li>
                <li>
                  <FiCheck className="check-icon" />
                  <span>Match with relevant recruiters</span>
                </li>
              </ul>
            </div>

            <div className="tips-card">
              <h4>Tips for Best Results</h4>
              <ul>
                <li>Use a recent, updated resume</li>
                <li>Include relevant skills and experience</li>
                <li>Ensure clear formatting</li>
                <li>Keep file size under 5MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
  </>
  );
}