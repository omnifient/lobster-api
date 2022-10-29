import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [
        process.env.PRIVATE_KEY || ""
      ],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/917dfa326f1f4b24afb2ec4528129870",
      accounts: [
        process.env.PRIVATE_KEY  || ""
      ],
    },
  }
};

export default config;
