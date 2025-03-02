// Cryptomon.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721URIStorage, ERC721 } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @dev interface that exposes a method to retrieve the moderator's address (this is needed since the moderator
 * contract is deployed before this one)
 */
interface ModeratorInterface {
    function owner() external view returns (address);
}

/**
 * @author raffaeleav
 * 
 * @title a NFT marketplace contract (intended in a first sketch of the project to be a collection, 
 * now it is effectively a marketplace)
*/
contract Cryptomon is ERC721URIStorage, ReentrancyGuard {
    address private immutable moderatorContractAddress;
    uint256 private tokenIds;
    mapping(uint256 => Listing) private listings;

    struct Listing {
        address seller;
        uint256 price;
        bool isForSale;
    }

    /**
     * @dev only the moderator is allowed to mint tokens 
     */
    modifier onlyModerator {
        require(msg.sender == isModerator(), "only moderator can call this function");

        _;
    }

    /**
     * @param _moderatorContractAddress is needed to use the contract functions
     */
    constructor(address _moderatorContractAddress) ERC721("Cryptomon", "CMO") {
        moderatorContractAddress = _moderatorContractAddress;
    }

    function isModerator() public view returns (address) {
        return ModeratorInterface(moderatorContractAddress).owner();
    }

    function totalSupply() public view returns (uint256) {
        return tokenIds;
    }

    function getTokenPrice(uint256 tokenId) public view returns (uint256) {
        require(tokenId <= tokenIds && tokenId > 0, "wrong token id");
        require(listings[tokenId].isForSale, "token is not for sale");

        return listings[tokenId].price;
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public {
        require(tokenId <= tokenIds && tokenId > 0, "wrong token id");
        require(ownerOf(tokenId) == msg.sender, "not the token owner");
        require(price > 0, "price should be > 0");

        listings[tokenId].isForSale = true;
        listings[tokenId].price = price; 
    }

    function isOnSale(uint256 tokenId) public view returns (bool) {
        require(tokenId <= tokenIds && tokenId > 0, "wrong token id");

        return listings[tokenId].isForSale;
    }

    /**
     * @dev since an iteration would be anti-pattern, this method is invoked multiple times from the 
     * frontend to display the tokens
     * 
     * @param _tokenId is the id of the token to retrieve details for
     * 
     * @return tokenId is the id of the retrieved token
     * @return seller is the address of the owner of the token
     * @return price is the price of the token
     * @return _isForSale is indicating whether the token is currently listed for sale
     */
    function getToken(uint256 _tokenId) public view returns (uint256 tokenId, address seller, uint256 price, bool _isForSale) {
        require(_tokenId <= tokenIds && _tokenId > 0, "wrong token id");

        // accessing listings once
        Listing memory listing = listings[_tokenId];
        
        return (_tokenId, listing.seller, listing.price, listing.isForSale);
    }

    /** 
     * @dev safeMint checks if the recipient address is a smart contract and whether if it can handle ERC721    
     * tokens (with an extra cost) and this is not needed since the minting of the token is organized by the 
     * platform (other checks are done on the platform to save on gas)
     * 
     * @param owner is the address of the user that will own the nft that is being minted
     * @param metadataURI is an ipfs uri to access the metadata 
     * @param price is the listing price of the nft
     *  
     * @return _tokenId is the id of the minted token
    */
    function mintToken(address owner, string memory metadataURI, uint256 price) public onlyModerator returns (uint256 _tokenId) {
        tokenIds++;
        uint256 tokenId = tokenIds;

        _mint(owner, tokenId);
        _setTokenURI(tokenId, metadataURI);

        listings[tokenId] = Listing({
            seller: owner,
            price: price,
            isForSale: true
        });

        return tokenId;
    }

    /** 
     * @dev a non reentrant nft buy function
     * 
     * @param tokenId is the id of the token to buy
    */
    function buyToken(uint256 tokenId) public payable nonReentrant {
        require(tokenId <= tokenIds && tokenId > 0, "wrong token id");
        require(listings[tokenId].isForSale, "token is not for sale");
        require(isModerator() != msg.sender, "moderator can't buy nfts");

        Listing memory listing = listings[tokenId];
        address seller = listing.seller;

        require(msg.value >= listing.price, "insufficient amount of ETH");
        require(seller != msg.sender, "cannot buy your own token");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: 0,
            isForSale: false
        });

        payable(seller).transfer(msg.value);
        _transfer(seller, msg.sender, tokenId);
    }
}