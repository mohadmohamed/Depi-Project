import Fdiv from "./assets/fdiv";
import Card from"./assets/card";
import Review from"./assets/review";
import Card1 from"./assets/card1.png";
import Card2 from"./assets/card2.jpg";
import Card3 from"./assets/card3.jpg";
import Review1 from"./assets/review.png";
// import BackGround from "./assets/backgrond.jpg";

function App() {
   const styles={
    color:"white",
    fontFamily:"poppins",
     position:"relative",
     zIndex:1,
     left:"180px",
    top:"120px",
    fontSize:"small",
   }
   const styling={
    color:"white",
    fontFamily:"poppins",
     position:"relative",
     zIndex:1,
     left:"500px",
     top:"90px",
     fontSize:"small",
   }
  return(
    <>
   <Fdiv />
  < div className="cards-container">
   <h1 className="txt" >How It Work?</h1>
   <p className="txt">in publishing and graphic design,
        demonstrat the visusal</p>
  <p style={styles}>Uplaod File</p>
  <p style={styling}>What Recruiter Do You Want?</p>
  <div className="con">
      <Card
      image={Card1}
        title="Import Your Resume"
        description="in publishing and graphic design,
        demonstrat the visusal"
      />
      <Card
      image={Card2}
        title="Choose Your Recruiter"
        description="in publishing and graphic design,
        demonstrat the visusal"
      />
      <Card
      image={Card3}
        title="Get Interview With AI"
        description="in publishing and graphic design,
        demonstrat the visusal"
      />
      </div>
      </div>
      {/* <div className="review-section"> */}
     {/* <Review
     image={Review1}
     />
      <Review
     image={Review1}
     />
      </div> */}
   </>
  );
}

export default App;
