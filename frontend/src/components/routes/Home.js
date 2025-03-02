import React from 'react';
import { useSelector } from 'react-redux';

import '../../css/components/routes/Home.css';
import { Loading } from '../Loading';

export const Home = () => {
    const { loading } = useSelector(state => state.wallet);

    return (
        <div>
            {loading && <Loading />}
            <div className="home">
                <div className="home-title">
                <h2><span className="subtitle">Enter </span>Nfties<span className="subtitle">, and discover </span>Cryptomons</h2>
                </div>
                <div className="home-content">
                    <div className="home-image">
                        <img src="covermatter.png" alt="covermatter"></img>
                    </div>
                    <div className="home-image-text">
                        <p>
                            Cryptomons is a Digimon-inspired NFT collection featuring a unique set of digital monsters, each with its own distinctive design and personality. Created for collectors and fans of nostalgic creature designs, Cryptomons brings a fresh twist to the world of digital art and blockchain collectibles. With vibrant artwork and a limited supply, this collection is perfect for those looking to own a piece of digital nostalgia in the form of exclusive NFTs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}