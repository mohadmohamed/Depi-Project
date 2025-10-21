# Resume Parser Test Guide

## 🚀 Quick Start

### Step 1: Start the API Server
Open a terminal and run:
```bash
cd d:\Projects\depiProject\Depi-Project\ai-models
python resume_praser.py
```
You should see: `INFO: Uvicorn running on http://0.0.0.0:8000`

### Step 2: Start the React Client
The React client is already running at: http://localhost:5173

### Step 3: Test the Resume Parser
1. Open your browser and go to: http://localhost:5173
2. You should see the Resume Parser Test interface
3. Click "Load Sample Data" to load test resume and job description
4. Click "Parse Resume" to test the parser

## 📋 What You Can Test

### ✅ Features Available:
- **Personal Info Extraction**: Name, email, phone
- **Skills Detection**: Technical and soft skills
- **Education Parsing**: Degrees and institutions  
- **Experience Extraction**: Job titles and companies
- **Job Matching**: Compatibility score with job descriptions
- **API Status Check**: Real-time API health monitoring

### 🎯 Test Scenarios:

1. **Basic Resume Parsing**:
   - Load sample data and parse
   - Check extracted information

2. **Job Matching**:
   - Include job description for compatibility scoring
   - View matching keywords and missing skills

3. **Custom Data**:
   - Clear sample data
   - Paste your own resume text
   - Test with different resume formats

4. **Error Handling**:
   - Try parsing without API running
   - Test with empty resume text

## 🔧 API Endpoints

The parser provides these endpoints:
- `GET /` - API information
- `POST /parse_resume/` - Parse resume with optional job matching

## 📊 Expected Output

The parser will extract:
```json
{
  "full_name": "John Doe",
  "email": "john.doe@techcorp.com",
  "phone": "(555) 123-4567",
  "skills": ["Python", "React", "AWS", ...],
  "education": ["Bachelor in Computer Science"],
  "experience": ["Software Engineer at Tech Corp"],
  "job_matching": {
    "matching_score": 60.0,
    "common_keywords": [...],
    "missing_keywords": [...]
  }
}
```

## 🛠️ Troubleshooting

### API Not Running:
- Make sure Python is installed
- Check if port 8000 is available
- Install dependencies: `pip install fastapi uvicorn pdfminer.six python-multipart`

### React Client Issues:
- Refresh the page
- Check browser console for errors
- Ensure the API server is running first

### CORS Issues:
- The API allows all origins for testing
- No additional configuration needed

## 🎉 Success Indicators

You'll know it's working when:
- ✅ API Status shows "Running" 
- ✅ Sample data loads correctly
- ✅ Parse button returns results
- ✅ Skills and information are extracted
- ✅ Job matching score appears (if job description provided)

## 📝 Next Steps

After testing, you can:
1. Integrate the parser into your main application
2. Add file upload functionality
3. Enhance the UI with more detailed results
4. Add more resume parsing patterns
5. Implement user authentication