import './login.css'

export default function Login() {
 
  return (
    <main>
       <h1>Welcome Back!</h1>
       <p>Log In to Continue Your Job Journey</p>
       <form action="">
        <div className="card-outer">
          <div className="card-inner">
            <div>
              <label htmlFor="email">Email Address</label>
              <input type="email" name="email" id="email" placeholder="Enter your email" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" placeholder="Enter your password" />
            </div>

            <button type="submit" id="submit">Log In</button>
          </div>
        </div>
       </form>
    <span>Don't have an account? <a href="">Sign Up</a></span>

    
    </main>
   
  )
  
 
}

