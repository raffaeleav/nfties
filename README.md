<p align="center">
  <img src="" width="512" heigth="120">
</p>


<p align="center">
  A NFT marketplace developed as a project for the Sicurezza dei Dati (Data Security) course, part of the Computer Science Master's Degree program at the University of Salerno
</p>


## Table of Contents
- [Overview](#Overview)
- [Features](#Features)
- [Results](#Results)
- [Requirements](#Requirements)
- [How to replicate](#How-to-replicate)
- [Built with](#Built-with)


## Overview 
  ...


## Features
1) Mint NFTs
2) Buy NFTs
3) Sell NFTs
4) View NFTs


## Requirements 
- [mkcert](https://github.com/awsaf49/artifact)
- Javascript dependencies are listed in each of the project components


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
- ...
