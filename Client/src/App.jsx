
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./componenets/authentication/Login";
import Signup from "./componenets/authentication/Signup";
import LandingPage from "./componenets/LandingPage/LandingPage";
import MockInterview from "./componenets/Mock-Interview/mockInterview";
import Questions from "./componenets/Questions/Questions";
import ResumeAnalysis from "./componenets/resume/ResumeAnalysis";
import Profile from "./componenets/profilePage/Profile";
import Upload from "./componenets/upload/upload";
import {useState} from "react"
function App() {
  const [resumeId , setResumeId] = useState(0);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
