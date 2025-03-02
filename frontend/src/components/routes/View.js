import React, { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { ViewGrid } from '../ViewGrid';
import '../../css/components/routes/Results.css';
import cryptomonArtifact from '../../abis/Cryptomon.json'
import { setIsLoading } from '../../redux/actions/walletActions.js';
import { setIsConnected, setWalletAddress, setIsModerator } from '../../redux/actions/walletActions.js';

export const View = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { walletAddress } = useSelector(state => state.wallet);
    
    const [ nfts, setNfts ] = useState([]);

    const fetchIpfsMetadata = async (cid) => {
        if (!cid) {
            console.log("[error] (View.js:fetchIpfsMetadata) cid is required");

            return null;
        }

        try {
            const response = await fetch(`https://localhost:433/fetch-metadata?cid=${cid}`, {
                method: 'GET'
            });
    
            if (!response.ok) {
                throw new Error(`Failed to retrieve metadata: ${response.statusText}`);
            }
    
            const metadataJSON = await response.json();
            return metadataJSON;
        } 

        catch (error) {
            console.log("[error] (View.js:fetchIpfsMetadata) " + error);
            
            return null;
        }
    };

    const getViewRouteNFTs = useCallback(async () => {
        dispatch(setIsLoading(true));

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
        
                console.log('[log] (View.js:getViewRouteNFTs) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
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
        
            console.log('[log] (View.js:getViewRouteNFTs) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
            navigate('/');
        
            return ;
        }

        const nfts = [];

        const cryptomonContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        const cryptomonContractABI = cryptomonArtifact.abi

        try {
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

            const contract = new ethers.Contract(
                cryptomonContractAddress,
                cryptomonContractABI,
                provider
            );

            const mintedTokens = await contract.totalSupply();
            const tokenIds = [];
            const listings = {};

            for (let i = 0; i < mintedTokens; i++) {
                try {
                    const [ id, seller, price, isForSale ] = await contract.getToken(i + 1);

                    tokenIds[i] = id;
                    listings[i] = { seller, price, isForSale };
                }

                catch (error) {
                    console.log('[log] (View.js:getViewRouteNFTs) token #' + i + ' is not listed'); 
                }
            }

            if (tokenIds.length > 0) {
                for (let i = 0; i < mintedTokens; i++) {
                    if (listings[i].seller.toLowerCase() === walletAddress.toLowerCase()) {
                        const metadataURI = await contract.tokenURI(tokenIds[i]);

                        const metadataJSON = await fetchIpfsMetadata(metadataURI);
                    
                        if (!metadataJSON) {
                            console.log('[log] (View.js:getViewRouteNFTs) no metadata found for token ' + (i + 1));
                        }
                        
                        nfts.push({ tokenId: tokenIds[i], metadata: metadataJSON , listing: listings[i]});
                    }
                }
            }

            else {
                console.log('[log] (View.js:getViewRouteNFTs) no nft found, showing 0 search results'); 
            }

            dispatch(setIsLoading(false));

            return nfts;
        } 
        
        catch (error) {
            dispatch(setIsLoading(false));
            
            alert('An error during the transaction execution occurred. Please try again in a while!');
            console.log('[error] (View.js:getViewRouteNFTs) ' + error);

            return null;
        }
    }, [ dispatch, walletAddress, navigate ]);

    useEffect(() => {
        const fetchNFTs = async () => {
            const fetchedNFTs = await getViewRouteNFTs();
            setNfts(fetchedNFTs);
        };
        
        fetchNFTs();
    }, [ getViewRouteNFTs ]);
    
    if (nfts.length !== 0) {
            return (
                <div>
                    <div className="search-results">
                        <h2>View<span className="subtitle"> your NFTs</span></h2>
                    </div>
                    <ViewGrid nfts={nfts} />
                </div>
            )
        }
    
    else {
        return <ViewGrid nfts={nfts} />
    }
}