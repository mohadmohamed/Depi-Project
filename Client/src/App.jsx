
import { useEffect, useState } from "react";
import ResumeAnalysis from "./componenets/resume/ResumeAnalysis";
import Login from "./componenets/authentication/Login";  
import Signup from "./componenets/authentication/Signup";
import Questions from "./componenets/Questions/Questions";
import MockInterview from "./componenets/Mock-Interview/mockInterview";
import ResumeParserTest from "./componenets/ResumeParserTest";


function App() {
  return (
    <>
      <ResumeParserTest />
    </>
  );
}

export default App;
