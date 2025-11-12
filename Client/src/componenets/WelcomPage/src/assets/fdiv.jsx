import BackGround from "./backgrond.jpg";
import Img from "./image.png"
function fdiv(){
     return(
            <div className="fdiv">
             <h1>MOCK INTERVIEW WITH AI </h1>
  <div class="circle c1"></div>
  <div class="circle c2"></div>
  <div class="circle c3"></div>
              {/* <img src={BackGround} alt="" /> */}        
               <h3>resume scan and find recruiter. </h3>
              <p>In puplishing and graphic design,lorem ipsum is a placeholder text commonly used</p> 
               <p> to domonistrsdt the visual </p>
               <button>Start for free</button>
                <button style={{background: 'none', color: '#080808', border:'1px solid black', left:'80px',bottom:'2px',top:'70px'}}>strat demo video</button>
               <div className="imgcontainer">
                <img src={Img} alt="" />
               </div> 
            </div>
     );
}
export default fdiv;