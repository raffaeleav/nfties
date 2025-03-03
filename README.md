<p align="center">
  <img src="https://github.com/user-attachments/assets/c1275780-27a0-4c19-9e65-58f3b9315289" width="512" heigth="120">
</p>


<p align="center">
  A NFT marketplace developed as a project for the Sicurezza dei Dati (Data Security) course, part of the Computer Science Master's Degree program at the University of Salerno
</p>


## Table of Contents
- [Overview](#Overview)
- [Features](#Features)
- [Results](#Results)
- [Requirements](#Requirements)
- [Project structure](#Project-structure)
- [How to replicate](#How-to-replicate)
- [Built with](#Built-with)


## Overview 
<p>
  Nfties was developed with the goal of gaining practical experience in implementing a Dapp, with a focus on blockchain security.
  The platform allows users to explore a wide range of NFTs and purchase or sell them. The Dapp admin can mint NFTs through a dedicated dashboard. 
</p>


## Preview
<p>
  <img src="" width="400" heigth="400">
</p>


## Features
1) Mint NFTs
2) Buy NFTs
3) Sell NFTs
4) View NFTs


## Requirements 
- [mkcert](https://github.com/awsaf49/artifact)
- Javascript dependencies are listed in each of the project components

## Project structure
```
nfties/
│── authentication/        # Authentication express endpoint
│   ├── certificates/
│	  ├── scripts/			
│   └── src/             	
│
│── contracts/             # Solidity smart contracts
│
│── frontend/              # React frontend
│   ├── certificates/
│	  ├── public/
│  	├── scripts/			
│   └── src/
│
│── ignition/              # Hardhat ignition modules	
│   └── modules/     
│
│── ipfs/                  # Ipfs metadata / images storage endpoint
│   ├── certificates/
│	  ├── scripts/			
│   └── src/
│
│── scripts/               # Compile / deployment scripts for contracts 
│
│── test/                  # Unit testing with Mocha 
│
│── .gitignore
│── README.md               
│── dependencies.json
│── hardhat.config.js              
│── package-lock.json                
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
- [Hardhat](https://hardhat.org/hardhat-network/docs/overview)
- [Solidity](https://soliditylang.org)
- [Helia](https://helia.io)
- [React](https://it.legacy.reactjs.org)
- [Redux](https://redux.js.org)
- [Express](https://expressjs.com)
