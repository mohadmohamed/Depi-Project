import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from '../resume/Header';
import QuestionCard from './QuestionCard';
import './Questions.css';
import './questionCard.css';
import { useResume } from '../../context/ResumeContext';

export default function Questions() {
	const token = sessionStorage.getItem('authToken');
	const { selectedResumeId, selectedTargetJob } = useResume();

	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [answers, setAnswers] = useState([])
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score , setScore] = useState(0);
	const [disabled, setDisabled] = useState(false);
	const decryptToken = useMemo(() => {
		if (!token) {
			return null;
		}

		try {
			return jwtDecode(token);
		} catch (decodeError) {
			console.error('Failed to decode auth token:', decodeError);
			return null;
		}
	}, [token]);

	const effectiveResumeId = useMemo(() => {
		if (selectedResumeId) {
			return selectedResumeId;
		}

		const stored = sessionStorage.getItem('selectedResumeId');
		return stored ? parseInt(stored, 10) : null;
	}, [selectedResumeId]);

	const storageKey = useMemo(() => {
		if (!decryptToken?.sub || !effectiveResumeId) {
			return null;
		}
		return `technical-quiz-${decryptToken.sub}-${effectiveResumeId}-answers`;
	}, [decryptToken, effectiveResumeId]);
	console.log(decryptToken);
	useEffect(() => {
		if (!token) {
			setError('You must be logged in to access the technical quiz.');
			setLoading(false);
			return;
		}

		if (!decryptToken?.sub) {
			setError('Your session has expired. Please log in again.');
			setLoading(false);
			return;
		}

		if (!effectiveResumeId) {
			setError('Please choose a resume before starting the technical quiz.');
			setLoading(false);
			return;
		}
	
		const controller = new AbortController();
		const fetchQuestions = async () => {
			setLoading(true);
			setError('');

			const url = `http://localhost:5197/api/Interview/questions?userId=${decryptToken.sub}&resumeId=${effectiveResumeId}&sessionId=${sessionStorage.getItem("sessionId")}`;

			try {
				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${token}`
					},
					signal: controller.signal
				});

				if (!response.ok) {
					const message = await response.text();
					throw new Error(message || `Request failed with status ${response.status}`);
				}

				let data;
				try {
					data = await response.json();
				} catch (parseError) {
					console.error('Interview questions JSON parse error:', parseError);
					throw new Error('Received an unexpected response from the server.');
				}

				let normalized = [];
				if (Array.isArray(data)) {
					normalized = data;
				} else if (Array.isArray(data?.questions)) {
					normalized = data.questions;
				} else if (Array.isArray(data?.quiz)) {
					normalized = data.quiz;
				} else if (Array.isArray(data?.data)) {
					normalized = data.data;
				}

				if (!Array.isArray(normalized) || normalized.length === 0) {
					console.warn('Interview questions response contained no questions:', data);
					setQuestions([]);
					setAnswers([]);
					setError('No interview questions were returned for this resume yet. Please try generating a quiz again from the dashboard.');
					return;
				}

				setQuestions(normalized);
				setAnswers(new Array(normalized.length).fill(''));
			} catch (requestError) {
				if (requestError.name === 'AbortError') {
					return;
				}
				console.error('Error fetching interview questions:', requestError);
				setQuestions([]);
				setAnswers([]);
				setError(requestError.message || 'Unable to load interview questions right now. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchQuestions();

		return () => controller.abort();
	}, [token, decryptToken, effectiveResumeId]);

	useEffect(() => {
		if (!Array.isArray(questions) || questions.length === 0) {
			setAnswers([]);
			return;
		}

		if (!storageKey) {
			setAnswers((prev) => (prev.length === questions.length ? prev : new Array(questions.length).fill('')));
			return;
		}

		const storedAnswersRaw = localStorage.getItem(storageKey);
		if (storedAnswersRaw) {
			try {
				const parsed = JSON.parse(storedAnswersRaw);
				if (Array.isArray(parsed)) {
					const restored = questions.map((_, index) => {
						const value = parsed[index];
						return typeof value === 'string' ? value : '';
					});
					setAnswers(restored);
					return;
				}
			} catch (storageError) {
				console.warn('Failed to read stored quiz answers. Resetting.', storageError);
			}
		}

		setAnswers(new Array(questions.length).fill(''));
	}, [questions, storageKey]);

	const handleAnswer = useCallback((questionIndex, letter) => {
		const normalizedLetter = typeof letter === 'string' ? letter.toUpperCase() : letter;

		setAnswers((previous) => {
			const next = [...previous];
			next[questionIndex] = normalizedLetter;
			if (storageKey) {
				localStorage.setItem(storageKey, JSON.stringify(next));
			}
			return next;
		});
	}, [storageKey]);

	const handleSubmit = useCallback(() => {
		if (!Array.isArray(questions) || questions.length === 0) {
			return;
		}

		let calculatedScore = 0;

		questions.forEach((question, index) => {
			const correctAnswer = question.correctAnswer?.toString().toUpperCase();
			const userAnswer = answers[index]?.toString().toUpperCase();

			if (correctAnswer && userAnswer && userAnswer === correctAnswer) {
				calculatedScore += 1;
			}
		});

		setScore(calculatedScore);
		setIsSubmitted(true);
		console.log('Submitting answers:', JSON.stringify({
				userId: decryptToken?.sub,
				resumeId: effectiveResumeId,
				Answers : answers
			}) );
		fetch("http://localhost:5197/api/Interview/evaluate", {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem("authToken")}`
			},
			body: JSON.stringify({
				userId: decryptToken?.sub,
				resumeId: effectiveResumeId,
				sessionId: sessionStorage.getItem("sessionId"),
				Answers : answers
			})
		}).then(res=>res.json()).then((data)=>console.log(data)).catch((requestError) => {
			console.error('Failed to submit quiz evaluation:', requestError);
		});
		
		setDisabled(true);
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	}, [answers, questions, decryptToken, effectiveResumeId, storageKey]);

	const answeredCount = useMemo(() => answers.filter(Boolean).length, [answers]);

	const scoreMessage = useMemo(() => {
		if (!isSubmitted || !questions.length) {
			return '';
		}

		const percentage = Math.round((score / questions.length) * 100);

		if (percentage === 100) {
			return 'Outstanding! You nailed every question.';
		}
		if (percentage >= 70) {
			return 'Great work! You are well prepared.';
		}
		if (percentage >= 40) {
			return 'Solid effort. Revisit the tricky topics and give it another go.';
		}
		return 'Keep practicing—every attempt builds your confidence!';
	}, [isSubmitted, score, questions.length]);

	if (loading) {
		return (
			<>
				<Header isLoggedIn={!!token} />
				<main className="exam-main">
					<div className="loading-container">
						<div className="loading-spinner" />
						<p>Preparing your personalized interview…</p>
					</div>
				</main>
			</>
		);
	}
	console.log(answers);
	return (
		<>
			<Header isLoggedIn={!!token} />
			<main className="exam-main">
				<h1 className="exam-title">Technical Interview Quiz</h1>

				{error && (
					<div className="error-notice" role="alert">
						{error}
					</div>
				)}

				{!error && (
					<section className="interview-info">
						<h2>Mock Interview Session</h2>
						<div className="quiz-details">
							<span className="quiz-badge">Resume ID: {effectiveResumeId}</span>
							<span className="quiz-count">Questions: {questions.length}</span>
							<span className="quiz-count">Answered: {answeredCount}</span>
							{selectedTargetJob && (
								<span className="quiz-badge">Target Role: {selectedTargetJob}</span>
							)}
						</div>
					</section>
				)}

				{!error && questions.length === 0 && (
					<div className="error-notice" role="alert">
						We couldn’t find any questions to show. Try refreshing the page or generating a new quiz from the landing page.
					</div>
				)}

				{!error && questions.map((question, index) => (
					<QuestionCard
						key={question.id ?? index}
						index={index}
						question={question.question}
						options={question.options}
						selectedLetter={answers[index] ?? ''}
						onSelect={(letter) => handleAnswer(index, letter)}
					/>
				))}
				<button className="quiz-submit" onClick={handleSubmit} disabled={disabled}>Submit</button>
				{isSubmitted && (
					<section className="quiz-score" role="status" aria-live="polite">
						<div className="quiz-score__badge">Your Result</div>
						<div className="quiz-score__value">
							<span className="quiz-score__score">{score}</span>
							<span className="quiz-score__divider">/</span>
							<span className="quiz-score__total">{questions.length}</span>
						</div>
						<p className="quiz-score__message">{scoreMessage}</p>
					</section>
				)}
			</main>
		</>
	);
}
