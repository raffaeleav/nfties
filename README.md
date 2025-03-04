<p align="center">
  <img src="https://github.com/user-attachments/assets/c1275780-27a0-4c19-9e65-58f3b9315289" width="512" heigth="120">
</p>


<p align="center">
  An NFT marketplace developed as a project for the Sicurezza dei Dati (Data Security) course, part of the Computer Science Master's Degree program at the University of Salerno
</p>


## Table of Contents
- [Overview](#Overview)
- [Preview](#Preview)
- [Features](#Features)
- [Requirements](#Requirements)
- [Project structure](#Project-structure)
- [How to replicate](#How-to-replicate)
- [Built with](#Built-with)


## Overview 
<p>
Nfties was developed to gain practical experience in building a decentralized application (Dapp), with a strong focus on Ethereum and blockchain security. The platform enables users to explore, buy, and sell a wide range of NFTs. Additionally, the Dapp admin has access to a dedicated dashboard for minting new NFTs.
</p>


## Preview
<p>
  <img src="https://github.com/user-attachments/assets/e67ef81f-f3eb-4759-966b-53253bbc6e73" width="400" heigth="400">
</p>


## Features
1) Mint new NFTs (Admin)
2) Purchase NFTs
3) Sell your NFTs
4) View your NFTs


## Requirements 
- [mkcert](https://github.com/awsaf49/artifact)
- Javascript dependencies are listed in each of the project components

## Project structure
```
nfties/
│── authentication/        # Authentication express endpoint
│   ├── certificates/
│   ├── scripts/			
│   └── src/       	
│
│── contracts/             # Solidity smart contracts
│
│── frontend/              # React frontend
│   ├── certificates/      
│   ├── scripts/			
│   └── src/               
│       ├── abis/          # Smart contract abis
│       ├── components/    # React components
│       ├── css/
│       └── redux/         # Redux actions, reducers and store
│ 
│── ignition/              # Hardhat ignition modules
│   └── modules/     
│
│── ipfs/                  # Ipfs metadata / images storage endpoint
│   ├── certificates/
│   ├── scripts/			
│   └── src/ 
│
│── scripts/               # Compiling / deployment scripts for contracts 
│
│── test/                  # Unit testing with Mocha 
│
│── .gitignore
│── ...         
└── package.json
```          


## How to replicate
It is required to run each of the commands in a different terminal
1) Start the hardhat node
```bash
cd nfties
npm install
npx hardhat node
```
2) Deploy contracts
```bash
cd nfties/scripts
bash deploy.sh
```
3) Start the authentication node
```bash
cd nfties/authentication
npm install
npm start
```
4) Start the ipfs node
```bash
cd nfties/ipfs
npm install
npm start
```
5) Start the frontend
```bash
cd nfties/frontend
npm install
npm start
```


## Built with
- [Hardhat](https://hardhat.org/hardhat-network/docs/overview) - used for compiling, deploying, testing, and debugging smart contracts
- [Solidity](https://soliditylang.org) - used for Ethereum smart contracts
- [Helia](https://helia.io) - used for decentralized storage of NFT images and metadata
- [React](https://it.legacy.reactjs.org) - used for building the frontend 
- [Redux](https://redux.js.org) - used for global state management in the frontend
- [Express](https://expressjs.com) - used for building authentication and ipfs APIs
