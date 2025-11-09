import React from "react"
import Header from "../resume/Header"
import Footer from "../resume/Footer"
import Hero from "./Hero"
import HowItWorks from "./HowItWorks"
import "./LandingPage.css"
import Upload from "../upload/upload"
import "../upload/upload.css"
import { useState } from "react"
export default function LandingPage() {
    const [resumeNumber , setResumeNumber] = useState(0);
    const token = sessionStorage.getItem("authToken");
    return (
        <>
            <Header isLoggedIn={!!token} />
            <main>
                <Hero />
                <HowItWorks />
            </main>
            <Footer />
        </>
    )
}