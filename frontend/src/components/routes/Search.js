import React from 'react';
import { useLocation } from "react-router-dom";

import { Grid } from '../Grid';
import '../../css/components/routes/Results.css';

export const Search = () => {
    const location = useLocation();
    const nfts = location.state.nfts; 

    if (nfts.length !== 0) {
        return (
            <div>
                <div className="search-results">
                    <h2><span className="subtitle">Your </span>search<span className="subtitle"> results</span></h2>
                </div>
                <Grid nfts={nfts} />
            </div>
        );
    }

    else {
        return <Grid nfts={nfts} />;
    }
}