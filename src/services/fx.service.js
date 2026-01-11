const axios = require("axios");

/**
 * User-facing FX rate (CAD → USD)
 */
async function getCadToUsdRate() {
  if (!process.env.COINBASE_API_URL) {
    throw new Error("COINBASE_API_URL is not set");
  }

  const response = await axios.get(process.env.COINBASE_API_URL, {
    params: { currency: "CAD" },
  });

  const rate = response.data?.data?.rates?.USD;

  if (!rate) {
    throw new Error("Failed to fetch CAD → USD rate");
  }

  return Number(rate);
}

module.exports = {
  getCadToUsdRate,
};
