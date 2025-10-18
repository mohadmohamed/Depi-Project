import './login.css'
import React, { useState } from 'react';
import Header from '../resume/Header'
import Footer from '../resume/Footer'
export default function Login() {
 const [showPassword, setShowPassword] = useState(false);
 function toggleShowPassword() {
  setShowPassword((prev) => !prev);
}
  return (
    <>
    {/* <Header isLoggedIn={true}/> */}
    <main className='login-main'>
       <form action="">
        <div className="card-outer float">
          <div className="card-inner">
       <h1>Welcome Back!</h1>
       <p>Log In to Continue Your Job Journey!</p>
            <div>
              <label htmlFor="email">Email Address</label>
              <input type="email" name="email" id="email" placeholder="Enter your email" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input type={showPassword? 'text' : 'password'} name="password" id="password" placeholder="Enter your password" />
                  <span className='pass-toggle-icon' onClick={toggleShowPassword} style={{
                  color: showPassword ? '#312f2fff' : '#888888',
                  fontSize: '0.78rem',
                  textAlign: 'right',
                  cursor: 'pointer',
                  marginTop: '5px',
                }}>Show password</span>
            </div>

            <button type="submit" id="submit">Log In</button>
          </div>
        </div>
       </form>
    <span>Don't have an account? <a href="">Sign Up</a></span>
    </main>
    {/* <Footer/> */}
   </>
  )
  
 
}

