const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe('Cryptomon Contract', function () {
    async function deployTokenFixture() {
        const [ moderator, user, user2 ] = await ethers.getSigners();
    
        const hardhatModerator = await ethers.deployContract("Moderator", [
            moderator.address,
        ]);
        await hardhatModerator.waitForDeployment();
    
        const hardhatCryptomon = await ethers.deployContract("Cryptomon", [
            hardhatModerator.target,
        ]);
        await hardhatCryptomon.waitForDeployment();

        return { hardhatModerator, hardhatCryptomon, moderator, user, user2 };
    }

    async function mintTokenFixture() {
        const { moderator, hardhatCryptomon } = await loadFixture(deployTokenFixture);

        const metadataURI = 'ipfs://0x0E7071C59DF3B9454D1D18A15270AA36D54F89606A576DC621757AFD44AD1D2E';
        const price = 1;
            
        const tx = await hardhatCryptomon.connect(moderator).mintToken(moderator.address, metadataURI, price);
        await tx.wait();
    }

    describe("Deployment", function () {
        it('Should set the moderator address correctly', async function () {
            const { hardhatModerator, hardhatCryptomon } = await loadFixture(deployTokenFixture);
    
            expect(await hardhatCryptomon.getModerator()).to.equal(await hardhatModerator.owner());
        });
    });

    describe('Mint Token', () => {
        it('Should mint a token successfully', async function () {
            const { hardhatCryptomon, moderator } = await loadFixture(deployTokenFixture);

            const metadataURI = 'ipfs://0x0E7071C59DF3B9454D1D18A15270AA36D54F89606A576DC621757AFD44AD1D2E';
            const price = 1;
            
            const tx = await hardhatCryptomon.connect(moderator).mintToken(moderator.address, metadataURI, price);
            await tx.wait();

            expect(await hardhatCryptomon.totalSupply()).to.equal(1);
        });

        it('Should not allow a non-moderator to mint a token', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);

            const metadataURI = 'ipfs://0x0E7071C59DF3B9454D1D18A15270AA36D54F89606A576DC621757AFD44AD1D2E';
            const price = 1;
            
            await expect(
                hardhatCryptomon.connect(user).mintToken(user.address, metadataURI, price)
            ).to.be.revertedWith('only moderator can call this function');
        });
    });

    describe('Buy Token', () => {
        it('Should not allow a user to buy a token with an invalid tokenId (tokenId > issued tokens)', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).buyToken(2)
            ).to.be.revertedWith('wrong token id');
        });

        it('Should not allow a user to buy a token with an invalid tokenId (tokenId = 0)', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).getToken(0)
            ).to.be.revertedWith('wrong token id');
        });

        it('Should not allow a user to buy a token with an invalid tokenId (tokenId = MaxUint256)', async function () {
            const MAX_UINT256 = ethers.MaxUint256;

            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).getToken(MAX_UINT256)
            ).to.be.revertedWith('wrong token id');
        });

        it('Should not allow a user to buy a not-listed token', async function () {
            const { hardhatCryptomon, user, user2 } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);

            const transferAmount = `0x${ethers.parseEther('10').toString(16)}`;
            await ethers.provider.send('hardhat_setBalance', [
                user.address,
                transferAmount, 
            ]);

            await ethers.provider.send('hardhat_setBalance', [
                user2.address,
                transferAmount, 
            ]);

            await hardhatCryptomon.connect(user).buyToken(1, {
                value: 10000000,
                gasLimit: 300000, 
            });
        
            await expect(
                hardhatCryptomon.connect(user2).buyToken(1, {
                    value: 10000000,
                    gasLimit: 300000, 
                })
            ).to.be.revertedWith('token is not for sale');
        });

        it('Should not allow the moderator to buy a token', async function () {
            const { hardhatCryptomon, moderator } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(moderator).buyToken(1)
            ).to.be.revertedWith('moderator can\'t buy nfts');
        });

        it('Should not allow a user to buy a token without adequate funds', async function () {
            const { hardhatCryptomon, moderator, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).buyToken(1)
            ).to.be.revertedWith('insufficient amount of ETH');
        });

        it('Should not allow a user to buy a token he listed', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);

            const transferAmount = `0x${ethers.parseEther('10').toString(16)}`;
            await ethers.provider.send('hardhat_setBalance', [
                user.address,
                transferAmount, 
            ]);

            await hardhatCryptomon.connect(user).buyToken(1, {
                value: 10000000,
                gasLimit: 300000, 
            });

            await hardhatCryptomon.connect(user).setTokenPrice(1, 10000000, {
                gasLimit: 300000,
            });
        
            await expect(
                hardhatCryptomon.connect(user).buyToken(1, {
                    value: 10000000,
                    gasLimit: 300000, 
                })
            ).to.be.revertedWith('cannot buy your own token');
        });
    });

    describe('Get Token', () => {
        it('Should fetch token info successfully', async function () {
            const { hardhatCryptomon, moderator } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            const [ tokenId, seller, price, isForSale ] = await hardhatCryptomon.connect(moderator).getToken(1);

            expect(tokenId).to.equal(1);
            expect(seller).to.equal(moderator.address);
            expect(price).to.equal(1);
            expect(isForSale).to.equal(true);
        });

        it('Should not fetch token info successfully (tokenId > issued tokens)', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).getToken(2)
            ).to.be.revertedWith('wrong token id');
        });

        it('Should not fetch token info successfully (tokenId = 0)', async function () {
            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).getToken(0)
            ).to.be.revertedWith('wrong token id');
        });

        it('Should not fetch token info successfully (tokenId = MaxUint256)', async function () {
            const MAX_UINT256 = ethers.MaxUint256;

            const { hardhatCryptomon, user } = await loadFixture(deployTokenFixture);
            await loadFixture(mintTokenFixture);
            
            await expect(
                hardhatCryptomon.connect(user).getToken(MAX_UINT256)
            ).to.be.revertedWith('wrong token id');
        });
    });
});
