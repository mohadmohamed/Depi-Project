import React from 'react'
import { jwtDecode } from 'jwt-decode';
export default function Hero() {
	const token = sessionStorage.getItem("authToken");
	const [targetJob , setTargetJob] = React.useState("");
	const decryptToken = token ? jwtDecode(token) : null;
	const handleCv = ()=>{

	}
	const handleInterview = ()=>{
		fetch("" , {
			body : {

			}
		})
	}
	const handleChange =(e)=>{
		setTargetJob(e.target.value);
	}
	return (
		<section className="hero">
			<div className="hero-inner justify-center">
				<div className="hero-left justify-center ">
					<h1 className="hero-title">ResumeAnalysis & Mock Interview
						<span className="hero-subtitle-block">with AI</span>
					</h1>
					<p className="hero-lead">Resume scan and find recruiter.</p>
					<div className="hero-email-signup">
						{!!token && <input 
							className="hero-email-input" 
							type="email" 
							placeholder="Please Enter the required job " 
							id="hero-email" 
						/>}
					</div>
					<div className="hero-ctas">
						{!token && <button className="cta primary">Start for free</button>}
						{!!token && <button className="cta primary" onClick={handleInterview}>Go to Interview</button>}
						{!token && <button className="cta ghost"> Learn More</button>}
						{!!token && <button className="cta ghost" onChange={handleChange} onClick={handleCv}>Analyze CV</button>}
					</div>
				</div>
			</div>
		</section>
	)
}