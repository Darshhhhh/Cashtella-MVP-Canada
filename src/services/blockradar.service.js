const axios = require("axios");

const BLOCKRADAR_BASE_URL = "https://api.blockradar.co/v1";
const BLOCKRADAR_API_KEY = process.env.BLOCKRADAR_API_KEY;

async function getTreasuryWallet() {
  const address = process.env.TREASURY_WALLET_ADDRESS;
  console.log("Using BlockRadar API key:", BLOCKRADAR_API_KEY);
  const response = await axios.get(
    `${BLOCKRADAR_BASE_URL}/wallets/${address}`,
    {
      headers: {
        "x-api-key": BLOCKRADAR_API_KEY,
        Accept: "application/json",
      },
    }
  );

  return response.data;
}

module.exports = {
  getTreasuryWallet,
};
