import React from 'react'
import { IoMdBook } from "react-icons/io";
function StepCard({title, children}){
	return (
		<div className="how-card">
			<div className="how-card-icon" > <IoMdBook size={30} /></div>
			<h4>{title}</h4>
			<p>{children}</p>
		</div>
	)
}

export default function HowItWorks() {
	return (
		<section className="howitworks">
			<div className="how-inner">
				<h3 className="how-heading">How it works?</h3>
				<div className="how-grid">
					<StepCard title="Import Your Resume">Click to upload or drag and drop - we parse your resume automatically.</StepCard>
					<StepCard title="Analyze Your Resume">Analyze you resume to find strengths and areas for improvement. </StepCard>
					<StepCard title="Get a Mock Interview with AI">Practice with AI-generated interview questions and get tailored feedback.</StepCard>
				</div>
			</div>
		</section>
	)
}