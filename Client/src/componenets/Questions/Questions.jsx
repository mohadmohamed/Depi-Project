import React, { use } from 'react'
import questionsFile from '../../data/questions.json'
import QuestionCard from './QuestionCard'
import Header from '../resume/Header';
import Footer from '../resume/Footerhead';
import jwtDecode from 'jwt-decode';


export default function Questions() {
    const [showExam, setShowExam] = React.useState(false)
    const [score, setScore] = React.useState(null);
    const token = sessionStorage.getItem("authToken");
    const decryptToken = token ? jwtDecode(token) : null;
    const timePerQuestion = 120;
    const mcqCount = questionsFile.questions.filter(q => q.type === "mcq").length;
    const totalTime = mcqCount * timePerQuestion;
    
    // Initialize state from localStorage or defaults
    const [answers, setAnswers] = React.useState(() => {
        const savedAnswers = localStorage.getItem('quiz-answers');
        return savedAnswers ? JSON.parse(savedAnswers) : {};
    });
    
    const [submitted, setSubmitted] = React.useState(() => {
        const savedSubmitted = localStorage.getItem('quiz-submitted');
        return savedSubmitted === 'true';
    });
    
    const [timeLeft, setTimeLeft] = React.useState(() => {
        const savedStartTime = localStorage.getItem('quiz-start-time');
        
        if (savedStartTime) {
            // Calculate elapsed time from the original start time
            const now = Date.now();
            const elapsed = Math.floor((now - parseInt(savedStartTime)) / 1000);
            const remainingTime = totalTime - elapsed;
            return Math.max(0, remainingTime);
        }
        
        // Initialize timer for new quiz
        localStorage.setItem('quiz-start-time', Date.now().toString());
        return totalTime;
    });
    // Define handleSubmit before useEffect that uses it
    const handleSubmit = React.useCallback(() => {
        setSubmitted(true);
        let newScore = 0;
        questionsFile.questions.forEach(q => {
            if (q.type === "mcq" && q.correct === answers[q.id]) {
                newScore++;
            }
        });
        setScore(newScore);
        
        // Clear localStorage when quiz is submitted
        localStorage.removeItem('quiz-answers');
        localStorage.removeItem('quiz-submitted');
        localStorage.removeItem('quiz-start-time');
    }, [answers]);

    // Save state to localStorage whenever it changes
    React.useEffect(() => {
        localStorage.setItem('quiz-answers', JSON.stringify(answers));
    }, [answers]);

    React.useEffect(() => {
        localStorage.setItem('quiz-submitted', submitted.toString());
    }, [submitted]);

    React.useEffect(() => {
        if (submitted) return
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timerId = setInterval(() => {
            // Calculate accurate remaining time from original start time
            const savedStartTime = localStorage.getItem('quiz-start-time');
            if (savedStartTime) {
                const now = Date.now();
                const elapsed = Math.floor((now - parseInt(savedStartTime)) / 1000);
                const remainingTime = totalTime - elapsed;
                setTimeLeft(Math.max(0, remainingTime));
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, submitted, handleSubmit, totalTime]);

    // Reset quiz function (for development/testing)
    const resetQuiz = () => {
        localStorage.removeItem('quiz-answers');
        localStorage.removeItem('quiz-submitted');
        localStorage.removeItem('quiz-start-time');
        window.location.reload();
    };

    function handleAnswer(id, choice) {
        setAnswers(prev => {
            const newAnswers = { ...prev, [id]: choice };
            localStorage.setItem('quiz-answers', JSON.stringify(newAnswers));
            return newAnswers;
        });
    }

    const mappedQuestions = questionsFile.questions.map(
        (q) => <QuestionCard
            key={q.id}
            {...q}
            selectedAnswer={answers[q.id]}
            submitted={submitted}
            onAnswer={handleAnswer}
            answers={answers}
            type={q.type}
        />
    )
    console.log(answers[6])
    React.useEffect(() => {
        fetch(`http://localhost:5197/api/Interview/questions?userId=${decryptToken.sub}&resumeId=4`)
    } , []);
    return (
        <>
        <Header isLoggedIn={!!token}/>
                <main className='exam-main'>
                {!submitted && <div className="circle-timer">
                    <div className="circle" style={{ '--percent': (timeLeft / totalTime) * 100 }}>
                        <span className="time-text">
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </span>
                    </div>
                </div>}
                <h1 className='exam-title' onDoubleClick={resetQuiz} title="Double-click to reset quiz">{questionsFile.title}</h1>
                {mappedQuestions}
                <button className='exam-submit' onClick={handleSubmit}>Submit</button>
                {submitted && (
                    <div className="exam-result">
                        <div className="result-icon">✔</div>
                        <h2 className="result-message">Congratulations, you made it!</h2>
                        <h2 className="score-exam">
                            You scored {score} / {mcqCount} correct answers
                        </h2>
                    </div>
                )}
            </main>
        </>
    )
}