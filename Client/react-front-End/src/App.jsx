
import { useEffect, useState } from "react";
import ResumeAnalysis from "./componenets/resume/ResumeAnalysis";
import Login from "./componenets/resume/authintication/Login";  
import Signup from "./componenets/resume/authintication/Signup";

function App() {

  return (
    <>
      <ResumeAnalysis />
      <Login />
      <Signup />
    </>
  );
}

export default App;
