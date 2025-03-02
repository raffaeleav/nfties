const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('CryptomonModule', (m) => {
  const cryptomon = m.contract('Cryptomon', ['0x5FbDB2315678afecb367f032d93F642f64180aa3']);

  return { cryptomon };
});