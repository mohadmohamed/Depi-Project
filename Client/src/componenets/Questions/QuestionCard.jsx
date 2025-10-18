import React from 'react'
import './questionCard.css'


export default function QuestionCard(prop) {
    const [selectedChoice, setSelectedChoice] = React.useState(null);
    const [showExplanation, isShowExplanation] = React.useState(false)
    const [essayAnswer, setEssayAnswer] = React.useState();

      function handleEssayChange(e){
        const value = e.target.value;
        setEssayAnswer(value);
        prop.onAnswer(prop.id, value); 
    }

    function showExplanationHandler() {
        isShowExplanation((prev) => !prev)
    }
    console.log(prop)
    console.log("answer", prop.answers)
    const isEssay = prop.type === "essay";
    return (
        <div className='q-card'>
            <h2 className='q-header'>
                {prop.id}. {prop.question}
            </h2>
           {!isEssay && <div className='choices'>
                {prop.choices.map((choice, index) => (
                    <div key={index}
                        className={`
                        choice
                        ${prop.submitted ? "choice-as" : "choice-bs"}
                        ${prop.submitted && choice === selectedChoice && choice === prop.correct ? "correct" : ""}
                        ${!prop.submitted && choice === selectedChoice ? "choice-selected" : ""}
                        ${prop.submitted && choice === selectedChoice && choice !== prop.correct ? "wrong" : ""}
                        ${prop.submitted && choice === prop.correct && choice !== selectedChoice ? "correct-not-chosen" : ""}
                        ${prop.submitted && choice === prop.correct && choice !== selectedChoice ? "correct" : ""}
                    `}

                        onClick={() => {
                            if (!prop.submitted) { setSelectedChoice(choice); prop.onAnswer(prop.id, choice); }
                        }}
                    >
                        {choice}
                    </div>
                ))}
            </div>}
            {isEssay && <div className='essay-container'>
                <textarea
                    className='essay-box'
                    placeholder={prop.placeholder || "Write your answer..."}
                    disabled={prop.submitted}
                    onChange={handleEssayChange}
                />
            </div>
           
            }
            {/* <p className="selected-p">Selected: {selectedChoice? selectedChoice:"No choice"}</p> */}
            {prop.submitted && <button className='show-ex' onClick={showExplanationHandler}>{showExplanation ? "Hide Explanation" : "Show Explanation"}</button>}
            {showExplanation && <span className='q-explanation'>
                Explanation: {prop.explanation}
            </span>}
         

        </div>
    )


}

