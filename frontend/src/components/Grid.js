import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import '../css/components/Grid.css';
import { Loading } from './Loading';
import cryptomonArtifact from '../abis/Cryptomon.json'
import { setIsLoading } from '../redux/actions/walletActions.js';
import { setIsConnected, setWalletAddress, setIsModerator } from '../redux/actions/walletActions.js';

export const Grid = ({ nfts }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isConnected, walletAddress, loading } = useSelector(state => state.wallet)

    const cryptomonContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const cryptomonContractABI = cryptomonArtifact.abi

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
                        console.log("[error] (Grid.js:fetchIpfsImages) " + error);
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

    const buyNFT = async (tokenId) => {
        if (!isConnected) {
            alert('To buy an NFT you should connect your wallet first!');

            return ;
        }

        const token = Cookies.get('jwt');
        
        if (token) {
            const jwtResponse = await fetch('https://localhost:434/verify-jwt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ token }),
            });
        
            const { success } = await jwtResponse.json();
        
            if (!success) {
                alert('Authentication failed, try connecting your wallet again!');
                        
                dispatch(setIsConnected(false));
                dispatch(setWalletAddress(''));
                dispatch(setIsModerator(false));
                        
                Cookies.set('walletAddress', '');
        
                console.log('[log] (Grid.js:buyNFT) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
                navigate('/');
        
                return ;
            }
        }
        
        else {
            alert('Authentication failed, try connecting your wallet again!');
                    
            dispatch(setIsConnected(false));
            dispatch(setWalletAddress(''));
            dispatch(setIsModerator(false));
                        
            Cookies.set('walletAddress', '');
        
            console.log('[log] (Grid.js:buyNFT) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
            navigate('/');
        
            return ;
        }

        dispatch(setIsLoading(true));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const contract = new ethers.Contract(
                cryptomonContractAddress, 
                cryptomonContractABI, 
                signer
            );

            if (Cookies.get('cookiesConsent') === 'accepted') {
                const preferences = Cookies.get('preferences');
                preferences.push(tokenId);
                Cookies.set('preferences', preferences);
            }

            const price = await contract.getTokenPrice(tokenId);

            const nonce = await provider.getTransactionCount(await signer.getAddress());

            const tx = await contract.buyToken(tokenId, {
                nonce: nonce,
                value: price,
            });

            const receipt = await tx.wait();

            if (receipt.status === 0) {    
                throw new Error("Transaction failed");
            }
            
            console.log('[log] (Grid.js:buyNFT) nft bought successfully');
        }

        catch(error) {
            alert('An error during the transaction execution occurred. Please, try again later!');
            console.log('[error] (Grid.js:buyNFT) ' + error);
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
                                <p>{ethers.formatEther(nft.listing?.price)} ETH</p>
                                <button className="buy-button" onClick={() => buyNFT(nft.tokenId)}>
                                    Buy
                                </button>
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
