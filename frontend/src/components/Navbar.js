import React, { useState, useEffect, useReducer } from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink } from 'react-router-dom';

import '../css/components/Navbar.css';
import moderatorArtifact from '../abis/Moderator.json';
import cryptomonArtifact from '../abis/Cryptomon.json'
import { setIsConnected, setWalletAddress, setIsModerator, setModeratorAddress, setIsLoading } from '../redux/actions/walletActions.js';

export const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isConnected, walletAddress, isModerator, moderatorAddress } = useSelector(state => state.wallet);

    const [ searchText, setSearchText ] = useState("");
    const [ , forceUpdate ] = useReducer(x => x + 1, 0);
    
    useEffect(() => { 
        const fetchModeratorAddress = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const moderatorContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
                const moderatorContractABI = moderatorArtifact.abi

                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const contract = new ethers.Contract(
                        moderatorContractAddress,
                        moderatorContractABI,
                        provider
                    );
                    
                    const moderator = await contract.owner();
                    dispatch(setModeratorAddress(moderator));

                    console.log('[log] (Navbar.js:fetchModeratorAddress) moderator address: ' + moderatorAddress);
                } 
                
                catch (error) {
                    console.log('[error] (Navbar.js:fetchModeratorAddress) ' + error);
                }
            }
        }

        fetchModeratorAddress();
    }, [ dispatch, moderatorAddress ]);

    useEffect(() => {
        const fetchCookiesAddress = () => {
            const savedAddress = Cookies.get('walletAddress');

            if (savedAddress) {
                dispatch(setWalletAddress(savedAddress));
                dispatch(setIsConnected(true));

                if (savedAddress.toLowerCase() === moderatorAddress.toLowerCase()) {
                    dispatch(setIsModerator(true));
                } 
            }

            console.log('[log] (Navbar.js:fetchCookiesAddress) address: ' + savedAddress);
        }

        fetchCookiesAddress();
    }, [ dispatch, moderatorAddress ]);

    const connectWallet = async () => {
        if (typeof window.ethereum == 'undefined') {
            console.log('[error] metamask extension is missing');

            alert('You need to install Metamask to connect your account!');
            window.open('https://metamask.io/download/', '_blank');
        } 
        
        else {
            try {
                if (!isConnected) {
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    const account = accounts[0];

                    const nonceResponse = await fetch('https://localhost:434/get-nonce');
                    const { nonce } = await nonceResponse.json();
 
                    const signature = await window.ethereum.request({
                        method: 'personal_sign', 
                        params: [ nonce, account ], 
                    });

                    const successResponse = await fetch('https://localhost:434/verify-nonce', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ account, signature, nonce }),
                    });

                    const { success, token } = await successResponse.json();

                    if (success) {
                        dispatch(setIsConnected(true));
                        dispatch(setWalletAddress(account));

                        if (account.toLowerCase() === moderatorAddress.toLowerCase()) {
                            dispatch(setIsModerator(true));
                            forceUpdate();
                        }
                        
                        else {
                            dispatch(setIsModerator(false));
                        }

                        // jwt is essential to the website so is exempt from cookie consent
                        Cookies.set('jwt', token);
                        Cookies.set('walletAddress', account, { expires: 1});

                        if (Cookies.get('cookiesConsent') === 'accepted') {
                            const preferences = [];
                            Cookies.set('preferences', preferences);
                        }

                        console.log('[log] (Navbar.js:connectWallet) address: ' + account);
                    }

                    else {
                        alert('Invalid request, please try again later.');
                    }
                } 
                
                else {
                    dispatch(setIsConnected(false));
                    dispatch(setWalletAddress(''));
                    dispatch(setIsModerator(false));

                    Cookies.set('walletAddress', '');

                    navigate('/');
                }
            } 
            
            catch(error) {
                console.log('[error] (Navbar.js:connectWallet) ' + error);
            }
        }
    };

    const fetchIpfsMetadata = async (cid) => {
        if (!cid) {
            console.log("[error] (Navbar.js:fetchIpfsMetadata) cid is required");

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
            console.log("[error] (Navbar.js:fetchIpfsMetadata) " + error);
            
            return null;
        }
    };

    const searchNFT = async () => {
        if (searchText === null || searchText === '') {
            alert("Please fill in the search input field!");
            console.log('[log] (Navbar.js:searchNFT) empty input field');

            return ;
        }

        dispatch(setIsLoading(true));

        console.log('[log] (Navbar.js:searchNFT) searchText: ' + searchText);

        const nfts = [];

        const cryptomonContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
        const cryptomonContractABI = cryptomonArtifact.abi

        try {
            const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

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
                    console.log('[log] (Navbar.js:searchNFT) token #' + i + ' is not listed'); 
                }
            }

            if (tokenIds.length > 0) {
                for (let i = 0; i < mintedTokens; i++) {
                    if (listings[i].isForSale) {
                        const metadataURI = await contract.tokenURI(tokenIds[i]);

                        const metadataJSON = await fetchIpfsMetadata(metadataURI);
                    
                        if (!metadataJSON) {
                            console.log('[log] (Navbar.js:searchNFT) no metadata found for token ' + (i + 1));
                        }

                        if (metadataJSON.name.toString().toLowerCase().includes(searchText.toString().toLowerCase())) {
                            nfts.push({ tokenId: tokenIds[i], metadata: metadataJSON , listing: listings[i]});
                        }
                    }

                    else {
                        continue ;
                    }
                }
                
                dispatch(setIsLoading(false));
                navigate('/search', { state: { nfts } });
            }

            else {
                dispatch(setIsLoading(false));
                navigate('/search', { state: { nfts } });
            }
        } 
        
        catch (error) {
            dispatch(setIsLoading(false));
            
            alert('An error during the transaction execution occurred. Please try again in a while!');
            console.log('[error] (Navbar.js:searchNFT) ' + error);
        }
    };

    const handleNavClick = (e, route) => {
        if (!isConnected) {
            e.preventDefault();  

            switch (route) {
                case 'sell': 
                    alert('Selling NFTs requires to connect your wallet first!');
                    break;
                case 'view': 
                    alert('Viewing your NFTs requires to connect your wallet first!');
                    break;
                default: 
                    alert('Please connect your wallet first!'); 
                    break;
            }
        }
    };

    return (
        <nav>
            <Link to="/" className="title">
                <img src="/logo.png" className="logo" alt="logo"></img>
            </Link>
            <div className="search-bar">
                <input 
                    type="text" 
                    placeholder="..." 
                    className="search-input"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="search-button" onClick={searchNFT}>
                    🔍
                </button>
            </div>
            <ul>
                <li>
                    <NavLink 
                        to="/buy"
                    >
                        Buy
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to={isConnected ? "/sell" : "#"}
                        onClick={(e) => handleNavClick(e, "sell")}
                    >
                        Sell
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to={isConnected ? "/view" : "#"}
                        onClick={(e) => handleNavClick(e, "view")}
                    >
                        View
                    </NavLink>
                </li>
                {isModerator && (
                    <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                )}
                <li>
                    <button className="auth-button" onClick={connectWallet}>
                        {isConnected ? `Disconnect (${walletAddress.slice(0, 6)}...)` : "Connect"}
                    </button>
                </li>
            </ul>
        </nav> 
    );
}