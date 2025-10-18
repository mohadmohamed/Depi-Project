import Header from "./Header";
import Main from "./Main";
import "./resumeAnalysis.css";
import Footer from "./Footer";
import { useEffect } from "react";

// is logged in is hard coded for now 
export default function ResumeAnalysis() { 
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch("http://localhost:5197/WeatherForecast");
                if (!response.ok) {
                    throw new Error(`Unexpected status ${response.status}`);
                }
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error("Failed to fetch weather data:", error);
            }
        };

        fetchWeather();
    }, []);
    return(

        <div>
            <Header isLoggedIn={false} />
            <Main />
            <Footer />
        </div>
    )
}
