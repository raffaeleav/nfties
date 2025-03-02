import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';

import { Grid } from '../Grid';
import '../../css/components/routes/Results.css';
import cryptomonArtifact from '../../abis/Cryptomon.json'
import { setIsLoading } from '../../redux/actions/walletActions.js';

export const Buy = () => {
    const dispatch = useDispatch();
    const { walletAddress } = useSelector(state => state.wallet);
    
    const [ nfts, setNfts ] = useState([]);

    const fetchIpfsMetadata = async (cid) => {
        if (!cid) {
            console.log("[error] (fetchIpfsMetadata) cid is required");

            return null;
        }

        try {
            const response = await fetch(`https://localhost:433/fetch-metadata?cid=${cid}`, {
                method: 'GET', 
            });
    
            if (!response.ok) {
                throw new Error(`Failed to retrieve metadata: ${response.statusText}`);
            }
    
            const metadataJSON = await response.json();
            return metadataJSON;
        } 

        catch (error) {
            console.log("[error] (Buy.js:fetchIpfsMetadata) " + error);
            
            return null;
        }
    };

    const getBuyRouteNFTs = useCallback(async () => {
        dispatch(setIsLoading(true));

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
                    console.log('[log] (Buy.js:getBuyRouteNFTs) token #' + i + ' is not listed'); 
                }
            }

            if (tokenIds.length > 0) {
                for (let i = 0; i < mintedTokens; i++) {
                    if (listings[i].isForSale && listings[i].seller !== walletAddress) {
                        const metadataURI = await contract.tokenURI(tokenIds[i]);

                        const metadataJSON = await fetchIpfsMetadata(metadataURI);
                    
                        if (!metadataJSON) {
                            console.log('[log] (Buy.js:getBuyRouteNFTs) no metadata found for token ' + (i + 1));
                        }

                        nfts.push({ tokenId: tokenIds[i], metadata: metadataJSON , listing: listings[i]});
                    }
                }

                console.log('[log] (Buy.js:getBuyRouteNFTs) showing ' + nfts.length + ' search results'); 
            }

            else {
                console.log('[log] (Buy.js:getBuyRouteNFTs) no nft found, showing 0 search results'); 
            }

            dispatch(setIsLoading(false));

            return nfts;
        } 
        
        catch (error) {
            dispatch(setIsLoading(false));
            
            alert('An error during the transaction execution occurred. Please try again in a while!');
            console.log('[error] (Buy.js:getBuyRouteNFTs) error during transaction: ' + error);

            return null;
        }
    }, [ dispatch, walletAddress ]);

    useEffect(() => {
        const fetchNFTs = async () => {
            const fetchedNFTs = await getBuyRouteNFTs();
            setNfts(fetchedNFTs);
        };
        
        fetchNFTs();
    }, [ getBuyRouteNFTs ]);
    
    if (nfts.length !== 0) {
            return (
                <div>
                    <div className="search-results">
                        <h2><span className="subtitle">Discover and </span>buy<span className="subtitle"> NFTs</span></h2>
                    </div>
                    <Grid nfts={nfts} />
                </div>
            )
        }
    
    else {
        return <Grid nfts={nfts} />
    }
}