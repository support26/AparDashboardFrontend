import React from 'react';
import './Navbar.css';

function Navbar({ isAuthenticated, onLogout }) {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-logo">Anaxee Dashboard App</div>
                {isAuthenticated && (
                    <button className="logout-button" onClick={onLogout}>Logout</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
