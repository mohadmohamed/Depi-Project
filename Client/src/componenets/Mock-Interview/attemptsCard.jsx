import './mockInterview.css'

export default function attemptCard(props){
console.log(props.noOfAttempts)  
return(   
    
    <div className="mi-attempt-card">
      <section> 
        <h3 className="attempt-title">Attempt {props.id}</h3>
        <p className="attempt-date">Date: {props.date.split("T")[0]}</p>
        <p className="attempt-duration">Duration: {(props.durationSec/60).toFixed(2)} mins</p>
        <p className="attempt-score">Score: {props.score}/{props.total}</p>
      </section>
      <button className="view-details-btn">View Details</button>
    </div>
      
      

)
}