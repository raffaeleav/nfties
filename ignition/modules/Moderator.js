const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('ModeratorModule', (m) => {
  const moderator = m.contract('Moderator', ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']);

  return { moderator };
});