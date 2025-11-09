import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { CgProfile } from "react-icons/cg";

export default function Header({isLoggedIn})
{
    const [menuOpen, setMenuOpen] = useState(false);
    
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    
    return(
        <header className={menuOpen ? 'menu-open' : ''}>
            <ul>
                <li><Link to="/" className="logo">Depi</Link></li>
                <div className="links">
                    <li><Link to="/">Home</Link></li>
                    <li><a href="#">Process</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">Contact</a></li>
                </div>
                {!isLoggedIn && <div className="buttons">
                    <Link className="login" to="/login">Login</Link>
                    <Link className="signup" to="/signup">Sign Up</Link>
                </div>}
                {!!isLoggedIn && <div className="buttons">
                    <Link to="/profile"><CgProfile size={24} /></Link>
                </div>}
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </ul>
        </header>
    )
}