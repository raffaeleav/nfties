import React from "react";
import '../css/components/Loading.css';

export const Loading = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-spinner"></div>
        </div>
    );
};