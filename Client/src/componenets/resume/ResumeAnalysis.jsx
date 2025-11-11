import Header from "./Header";
import Main from "./Main";
import "./resumeAnalysis.css";
import Footer from "./Footer";
import { useEffect } from "react";

// is logged in is hard coded for now 
export default function ResumeAnalysis(props) {
    const token = sessionStorage.getItem("authToken");
    console.log(props); 
    return(

        <div>
            <Header isLoggedIn={!!token} />
            <Main />
            <Footer />
        </div>
    )
}
