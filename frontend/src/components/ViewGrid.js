import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';

import '../css/components/Grid.css';
import { Loading } from './Loading';

export const ViewGrid = ({ nfts }) => {
    const { loading } = useSelector(state => state.wallet)

    const [ images, setImages ] = useState({}); 

    useEffect(() => {
        const fetchIpfsImages = async () => {
            const imageMap = {};

            await Promise.all(nfts.map(async (nft, index) => {
                if (nft.metadata?.image) {
                    try {
                        const response = await fetch(`https://localhost:433/fetch-image?cid=${nft.metadata.image}`);

                        if (response.ok) {
                            const blob = await response.blob();
                            imageMap[index] = URL.createObjectURL(blob);
                        } 
                        
                        else {
                            imageMap[index] = "placeholder.png"; 
                        }
                    } 
                    
                    catch (error) {
                        console.log("[error] fetching image: " + error);
                        imageMap[index] = "placeholder.png"; 
                    }
                } 
                
                else {
                    imageMap[index] = "placeholder.png";
                }
            }));

            setImages(imageMap);
        };

        fetchIpfsImages();
    }, [ nfts ]);

    if (nfts.length !== 0) {
        return (
            <div>
                {loading && <Loading />}
                <div className="grid-section">
                    {nfts.map((nft, index) => (
                        <div key={index} className="nft-card">
                            <img
                                src={images[index]}
                                alt={nft.metadata?.name}
                                className="nft-image"
                            />
                            <div className="nft-info">
                                <h3>{nft.metadata?.name}</h3> 
                                <p>{ethers.formatEther(nft.listing?.price)} ETH</p>
                                <p>{nft.metadata?.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } 
    
    else {
        return (
            <div>
                {loading && <Loading />}
                <div className="content">
                    <h2><span className="subtitle">No </span>results<span className="subtitle"> found </span></h2>
                </div>
                <div className="no-results-div">
                    <img className="no-results-image" src="no-results.png" alt="no-results"></img>
                </div>
            </div>
        );
    }
};
