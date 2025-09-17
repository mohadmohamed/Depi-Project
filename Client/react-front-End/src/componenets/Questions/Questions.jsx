import React from 'react'
import questionsFile from '../../data/questions.json'
import QuestionCard from './QuestionCard'



export default function Questions() {
    const [showExam, setShowExam] = React.useState(false)
    const [answers, setAnswers] = React.useState({});
    const [submitted, setSubmitted] = React.useState(false);
    const [score, setScore] = React.useState(null);

    const timePerQuestion = 120;
    const mcqCount = questionsFile.questions.filter(q => q.type === "mcq").length;
    const totalTime = mcqCount * timePerQuestion;
    const [timeLeft, setTimeLeft] = React.useState(totalTime);

    React.useEffect(() => {
        if (submitted) return
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, submitted]);

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function handleSubmit() {
        setSubmitted(true)
        let newScore = 0
        questionsFile.questions.forEach(q => {
            if (q.type === "mcq" && q.correct === answers[q.id]) {
                newScore++
            }
            setScore(newScore)
        })
    }

    function handleAnswer(id, choice) {
        setAnswers(prev => ({ ...prev, [id]: choice }));
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
    return (
        <>

            {!showExam && <div >
                <button className='quiz-start' onClick={() => setShowExam(prev => !prev)}>Start Exam!</button>
            </div>}

            {showExam && <main className='exam-main'>
                {!submitted && <div className="circle-timer">
                    <div className="circle" style={{ '--percent': (timeLeft / totalTime) * 100 }}>
                        <span className="time-text">
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </span>
                    </div>
                </div>}
                <h1 className='exam-title'>{questionsFile.title}</h1>
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

            </main>}
        </>
    )
}