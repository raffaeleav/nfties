import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';

import '../css/components/SellGrid.css';
import { Loading } from './Loading';
import cryptomonArtifact from '../abis/Cryptomon.json'
import { setIsLoading } from '../redux/actions/walletActions.js';

export const SellGrid = ({ nfts }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.wallet)

    const cryptomonContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const cryptomonContractABI = cryptomonArtifact.abi

    const [ images, setImages ] = useState({}); 
    const [ nftPrice, setNftPrice ] = useState(0);

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

    const sellNFT = async (tokenId) => {
        if ((isNaN(nftPrice) || Number(nftPrice) <= 0)) {
            alert("Please fill in the input field with a positive number!");
            console.log("[error] (SellGrid.js:sellNFT) price should be > 0");

            return null;
        }

        const weiNftPrice = ethers.parseUnits(String(nftPrice), "ether");

        dispatch(setIsLoading(true));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const nonce = await provider.getTransactionCount(await signer.getAddress());
            
            const contract = new ethers.Contract(
                cryptomonContractAddress, 
                cryptomonContractABI, 
                signer
            );

            const tx = await contract.setTokenPrice(tokenId, weiNftPrice, {
                nonce: nonce,
            });

            const receipt = await tx.wait();

            if (receipt.status === 0) {    
                throw new Error("Transaction failed");
            }
            
            console.log('[log] (SellGrid.js:sellNFT) nft listed successfully');
        }

        catch(error) {
            alert('An error during the transaction execution occurred. Please, try again later!');
            console.log('[error] (SellGrid.js:sellNFT) ' + error);
        }

        dispatch(setIsLoading(false));
    };

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
                                { nft.listing.isForSale ? (
                                    <div>
                                        <p>{ethers.formatEther(nft.listing?.price)} ETH</p>
                                        <p>Already listed</p>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                        e.preventDefault();
                                        sellNFT(nft.tokenId, nftPrice);
                                        }}
                                    >
                                        <div className="sell-text">
                                            <label>Price (ETH)</label>
                                            <input
                                                type="text"
                                                value={nftPrice}
                                                onChange={(e) => setNftPrice(e.target.value.toString())}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <button
                                            className="sell-button" 
                                        >
                                            Sell
                                        </button>
                                    </form>
                                )}
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
