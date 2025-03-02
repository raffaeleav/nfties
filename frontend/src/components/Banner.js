import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import '../css/components/Banner.css'; 

export const Banner = () => {
    const [ showConsent, setShowConsent ] = useState(false);

    useEffect(() => {
        const consent = Cookies.get('cookiesConsent');
        if (!consent) {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        // e-privacy states that consent should be renewed at least once a year
        Cookies.set('cookiesConsent', 'accepted', { expires: 180 });
        setShowConsent(false);
    };

    const declineCookies = () => {
        Cookies.set('cookiesConsent', 'declined', { expires: 180 }); 
        setShowConsent(false);
    };

    return (
        showConsent && (
            <div className="cookie-consent-popup">
                <div className="cookie-consent-content">
                <p>
                    This website uses technical cookies to ensure a better browsing experience.  
                    These cookies are essential for authentication (<a href="https://eips.ethereum.org/EIPS/eip-4361">Sign In with Ethereum</a>) and session management.
                    Optional cookies are used to personalise content. 
                </p>
                    <div className="cookie-buttons-wrapper">
                        <div className="cookie-buttons-section">
                            <div className="cookie-buttons-title">
                                <h3>
                                    Necessary
                                </h3>
                            </div>
                            <div className="cookie-buttons">
                                <button disabled="true">Accept</button>
                                <button disabled="true">Decline</button>
                            </div>
                        </div>
                        <div className="cookie-buttons-section">
                            <div className="cookie-buttons-title">
                                <h3>
                                    Preferences
                                </h3>
                            </div>
                            <div className="cookie-buttons">
                                <button onClick={acceptCookies}>Accept</button>
                                <button onClick={declineCookies}>Decline</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};
