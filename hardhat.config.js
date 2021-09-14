require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");

if (process.env.REWILDER_ENV == null) {
  // only update env manually if not already updated (eg by netlify)
  require('dotenv').config({ path: '.env.local' })
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (_args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/artifacts",
  },
  etherscan: process.env.ETHERSCAN_KEY ? {
    apiKey: process.env.ETHERSCAN_KEY
  } : undefined,
  networks: {
    hardhat: {
      chainId: 1337,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/cea7dccbc1994ce1a585d6f06eda519b",
      gasPrice: 10*1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : undefined,
    },
    kovan: {
      url: "https://kovan.infura.io/v3/cea7dccbc1994ce1a585d6f06eda519b",
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : undefined,
    }
  },
};