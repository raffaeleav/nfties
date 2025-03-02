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
