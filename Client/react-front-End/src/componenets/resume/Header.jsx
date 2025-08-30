export default function Header({isLoggedIn})
{
    return(
        <header>
            <ul>
                <li><a href="#" className="logo">Logo</a></li>
                <div className="links">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Process</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">Contact</a></li>
                </div>
                {isLoggedIn && <div className="buttons">
                    <button className="login">Login</button>
                    <button className="signup">Sign Up</button>
                </div>}
            </ul>
        </header>
    )
}