import Header from "./Header"
import Main from "./Main"
import "./resumeAnalysis.css"
import Footer from "./Footer";
// is logged in is hard coded for now 
export default function ResumeAnalysis() { 
    return(

        <div>
            <Header isLoggedIn={false} />
            <Main />
            <Footer />
        </div>
    )
}
