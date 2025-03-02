#!/bin/bash

npx hardhat compile

# since frontend can't fetch abis outside of his scope, this script copies the jsons there
frontend_artifacts=$(realpath "../frontend/src")
frontend_artifacts=${frontend_artifacts}/abis

if [ ! -d "${frontend_artifacts}" ]; then
    mkdir -p "${frontend_artifacts}"
    echo "[log] '${frontend_artifacts}' created"
else
    echo "[log] '${frontend_artifacts}' already exists"
fi

cp "../artifacts/contracts/Moderator.sol/Moderator.json" ${frontend_artifacts}/Moderator.json
cp "../artifacts/contracts/Cryptomon.sol/Cryptomon.json" ${frontend_artifacts}/Cryptomon.