#!/bin/bash

npx hardhat ignition deploy ../ignition/modules/Moderator.js --network localhost
npx hardhat ignition deploy ../ignition/modules/Cryptomon.js --network localhost