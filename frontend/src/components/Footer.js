import React from 'react';

import '../css/components/Footer.css';

export const Footer = () => {
    return (
        <footer>
            <div className="footer-section">
                <h3>COMMUNITY</h3>
                <ul>
                    <li>Help Center</li>
                    <li>Commmunity Guidelines</li>
                    <li>Bug Bounty Program</li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>LEGAL</h3>
                <ul>
                    <li>Terms of Service</li>
                    <li>Privacy Notice</li>
                    <li>© 2025 Nfties</li>
                </ul>
            </div>
        </footer>
    );
}