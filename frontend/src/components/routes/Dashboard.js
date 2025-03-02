import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import '../../css/components/routes/Dashboard.css';
import cryptomonArtifact from '../../abis/Cryptomon.json'
import { setIsConnected, setWalletAddress, setIsModerator } from '../../redux/actions/walletActions.js';

export const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isConnected, walletAddress, isModerator } = useSelector(state => state.wallet);

    const cryptomonContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const cryptomonContractABI = cryptomonArtifact.abi

    const [ nftName, setNftName ] = useState("");
    const [ nftDescription, setNftDescription ] = useState("");
    const [ nftImageURI, setNftImageURI ] = useState("");
    const [ nftPrice, setNftPrice ] = useState(0);
    const [ isMinting, setIsMinting ] = useState(false);

    useEffect(() => {
        if (!isModerator && !isConnected) {
            navigate('/'); 
        }
    }, [ navigate, dispatch, isConnected, isModerator ]);


    const uploadIpfsImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('https://localhost:433/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const imageURI = await response.text();
            setNftImageURI(imageURI);

            console.log('[log] (Dashboard.js:uploadIpfsImage) image: ' + imageURI);
        } 
        
        catch (error) {
            console.log('[error] (Dashboard.js:uploadIpfsImage) ' + error);
        }
    };
    
    const uploadImage = (event) => {
        const file = event.target.files[0];

        if (file) {
            uploadIpfsImage(file);
        }
    };

    const uploadIpfsMetadata = async (nftName, nftDescription, nftImageURI) => {
        if (!nftName || !nftDescription || !nftImageURI) {
            console.error('[error] (uploadIpfsMetadata) missing required nft metadata fields');

            return null;
        }

        const metadata = {
            name: nftName,
            description: nftDescription,
            image: nftImageURI,
        };

        const formData = new FormData();
        const metadataJSON = new Blob([JSON.stringify(metadata)], { type: 'application/json' }); 
        formData.append('metadata', metadataJSON, 'metadata.json');

        try {
            const response = await fetch('https://localhost:433/upload-metadata', {
                method: 'POST',
                body: formData, 
            });
            
            if (!response.ok) {
                throw new Error('Metadata upload failed');
            }

            const metadataURI = await response.text();

            return metadataURI;
        } 
        
        catch (error) {
            console.log("[error] (Dashboard.js:uploadIpfsMetadata) " + error);

            return null;
        }
    };

    /**
     * @dev mints an NFT and assigns it to moderator
     */
    const mintNFT = async () => {
        if ((isNaN(nftPrice) || Number(nftPrice) <= 0)) {
            console.log("[error] (Dashboard.js:mintNTF) price should be > 0");

            return null;
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

                console.log('[log] (Dashboard.js:mintNTF) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
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

            console.log('[log] (Dashboard.js:mintNTF) user ' + walletAddress + ' tried to mintNFT with wrong jwt');
            navigate('/');

            return ;
        }

        const weiNftPrice = ethers.parseUnits(String(nftPrice), "ether");
    
        setIsMinting(true);
    
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const nonce = await provider.getTransactionCount(await signer.getAddress());

            const contract = new ethers.Contract(
                cryptomonContractAddress, 
                cryptomonContractABI, 
                signer
            );
        
            const metadataURI = await uploadIpfsMetadata(nftName, nftDescription, nftImageURI);

            if (!metadataURI) {
                throw new Error('Metadata URI is not available');
            }

            const tx = await contract.mintToken(walletAddress, metadataURI, weiNftPrice, {
                nonce: nonce, 
            });

            const receipt = await tx.wait();

            if (receipt.status === 0) {    
                throw new Error("Transaction failed");
            }
        
            setNftName("");
            setNftDescription("");
            setNftImageURI("");
        } 
        
        catch (error) {
            alert('An error during the transaction execution occurred. Check the console logs.');
            console.log("[error] (Dashboard.js:mintNTF) " + error);
        } 
        
        finally {
            setIsMinting(false);
        }
    };

    return (
        <div>
            <div className="content">
                <h2>
                    <span className="subtitle">welcome, </span>Moderator
                </h2>
            </div>
            <div className="content">
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    mintNFT();
                    }}
                >
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            value={nftName}
                            onChange={(e) => setNftName(e.target.value)}
                            placeholder="..."
                            required
                        />
                    </div>

                    <div>
                        <label>Description</label>
                        <textarea
                            value={nftDescription}
                            onChange={(e) => setNftDescription(e.target.value)}
                            placeholder="..."
                            required
                        />
                    </div>

                    <div>
                        <label>Price (ETH)</label>
                        <input
                            type="text"
                            value={nftPrice}
                            onChange={(e) => setNftPrice(e.target.value.toString())}
                            placeholder="..."
                            required
                        />
                    </div>

                    <div className="image-div">
                        <label htmlFor="image-div-upload">
                            {nftImageURI ? "Image uploaded" : "Upload image"}
                        </label>
                        <input
                            id="image-div-upload"
                            type="file"
                            onChange={uploadImage}
                            accept="image/*"
                            required
                        />
                    </div>

                    <button type="submit" disabled={isMinting}>
                        {isMinting ? "Minting..." : "Mint NFT"}
                    </button>
                </form>
            </div>
        </div>
    );
}