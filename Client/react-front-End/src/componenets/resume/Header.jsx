import React, { useState } from 'react';
import './Header.css';

export default function Header({isLoggedIn})
{
    const [menuOpen, setMenuOpen] = useState(false);
    
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    
    return(
        <header className={menuOpen ? 'menu-open' : ''}>
            <ul>
                <li><a href="#" className="logo">Depi</a></li>
                <div className="links">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Process</a></li>
                    <li><a href="#">Services</a></li>
                    <li><a href="#">Contact</a></li>
                </div>
                {!isLoggedIn && <div className="buttons">
                    <button className="login">Login</button>
                    <button className="signup">Sign Up</button>
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