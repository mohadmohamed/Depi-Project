import React from 'react';
import './upload.css';

export const Body = () => {
  return (
    <div className="center-page">
      <h1 className="custom-h1">
        Smart Feedback <br /> For Your Dream Job
      </h1>
      <h3 className="custom-h3">
        Drop your resume for an ATS Score and improvement tips.
      </h3>

      <form className="form-section">
        <label htmlFor="company-name">Company Name</label>
        <input
          type="text"
          id="company-name"
          className="custom-textarea"
          placeholder="Enter company name"
        />

        <label htmlFor="job-title">Job Title</label>
        <input
          type="text"
          id="job-title"
          className="custom-textarea"
          placeholder="Enter job title"
        />

        <label htmlFor="job-description">Job Description</label>
        <textarea
          id="job-description"
          className="custom-textarea"
          placeholder="Enter job description"
          rows={4}
        ></textarea>

        <div
          className="upload-box"
          tabIndex={0}
          onClick={() => document.getElementById('resume-upload').click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('resume-upload').click();
            }
          }}
        >
          <label htmlFor="resume-upload">Upload Resume</label>
          <p>Click to upload your resume</p>
          <small>pdf, png or jpg (max. 10MB)</small>
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
          />
        </div>

        <button type="submit" className="save-btn">
          Save & Analyze Resume
        </button>
      </form>
    </div>
  );
};