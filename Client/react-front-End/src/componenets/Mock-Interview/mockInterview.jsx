import React from 'react'
import './mockInterview.css'
import attemptsFile from '../../data/attempts.json'
import AttemptsCard from './attemptsCard'
import AttemptsGraph from './attemptsGraph'

export default function MockInterview() {
    const [end, setEnd] = React.useState(2);
    const noOfAttempts = attemptsFile.attempts.length;
    
    const mappedAttempts = attemptsFile.attempts.slice(0,end).map(
        (attempt) => <AttemptsCard
            key={attempt.id}
            {...attempt}
        />
    )


    return (
        <>
            <main className='mi-main'>
                <div className='mock-interview'>
                    <h1 className='mi-header'>Mock Interview</h1>
                    <p className='mi-text'>Practice your skills with our mock interviews. Review your past attempts and track your progress over time.</p>
                    <button  className='mi-start-btn'>Start Mock Interview</button>
                </div>
                {noOfAttempts > 0 ? <section className='mi-attempts'>
                    <div className='mapped-attempts'>
                        <h2 className='mi-subtitle'>Your Attempts ({noOfAttempts})</h2>
                        {mappedAttempts}

                        {end < noOfAttempts && (
                            <button
                                className="load-more-btn"
                                onClick={() => setEnd(prev => prev + 2)} 
                            >
                                Load More
                            </button>
                        )}
                    </div>
                    <AttemptsGraph />
                </section> : null}


                {noOfAttempts === 0 ? <div className="no-attempts">
                    <h2 className="no-attempts-title">No Attempts Yet</h2>
                    <p className="no-attempts-text">You haven't attempted any mock interviews yet. Start practicing now!</p>
                    <button className="mi-start-btn">Start Your First Attempt Now</button>
                </div> : null}


            </main>
        </>
    )
}