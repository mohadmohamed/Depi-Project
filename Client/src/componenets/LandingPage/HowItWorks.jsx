import React from 'react'
import { IoMdBook } from "react-icons/io";
import { FaUpload, FaChartLine, FaComments, FaCheckCircle, FaBriefcase, FaStar } from "react-icons/fa";

function StepCard({title, children, icon: Icon, stepNumber}){
	return (
		<div className="how-card">
			<div className="step-number">{stepNumber}</div>
			<div className="how-card-icon"><Icon size={30} /></div>
			<h4>{title}</h4>
			<p>{children}</p>
		</div>
	)
}

function FeatureCard({title, children, icon: Icon}){
	return (
		<div className="feature-card">
			<div className="feature-icon"><Icon size={24} /></div>
			<h4>{title}</h4>
			<p>{children}</p>
		</div>
	)
}

export default function HowItWorks() {
	return (
		<>
			<section className="howitworks">
				<div className="how-inner">
					<div className="how-badge">How It Works</div>
					<h3 className="how-heading">Get Interview-Ready in 3 Simple Steps</h3>
					<p className="how-subheading">
						Our AI-powered platform helps you prepare for your dream job with personalized feedback and practice.
					</p>
					<div className="how-grid">
						<StepCard 
							title="Import Your Resume" 
							icon={FaUpload}
							stepNumber="1"
						>
							Click to upload or drag and drop - we parse your resume automatically and extract key information.
						</StepCard>
						<StepCard 
							title="Analyze Your Resume" 
							icon={FaChartLine}
							stepNumber="2"
						>
							Get instant AI-powered analysis to find strengths and areas for improvement tailored to your target role.
						</StepCard>
						<StepCard 
							title="Practice Mock Interviews" 
							icon={FaComments}
							stepNumber="3"
						>
							Practice with AI-generated interview questions based on your resume and get real-time tailored feedback.
						</StepCard>
					</div>
				</div>
			</section>

			<section className="features-section">
				<div className="features-inner">
					<div className="features-header">
						<div className="how-badge">Features</div>
						<h3 className="how-heading">Why Choose Our Platform?</h3>
						<p className="how-subheading">
							Everything you need to ace your next interview and land your dream job.
						</p>
					</div>
					<div className="features-grid">
						<FeatureCard 
							title="AI-Powered Analysis" 
							icon={FaChartLine}
						>
							Get intelligent insights about your resume with advanced AI that understands industry standards and best practices.
						</FeatureCard>
						<FeatureCard 
							title="Personalized Feedback" 
							icon={FaCheckCircle}
						>
							Receive specific, actionable feedback tailored to your target role and experience level.
						</FeatureCard>
						<FeatureCard 
							title="Industry-Specific Questions" 
							icon={FaBriefcase}
						>
							Practice with questions relevant to your field, from tech to finance, healthcare to marketing.
						</FeatureCard>
						<FeatureCard 
							title="Track Your Progress" 
							icon={FaStar}
						>
							Monitor your improvement over time with detailed analytics and performance metrics.
						</FeatureCard>
					</div>
				</div>
			</section>
		</>
	)
}