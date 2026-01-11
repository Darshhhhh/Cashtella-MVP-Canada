/**
 * Bridge adapter
 * CAD → USDT (internal only)
 */
async function convertCadToStablecoin({ transferId, amountCad }) {
  // Simulated Bridge conversion
  const simulatedRate = 0.74; // CAD → USDT approx

  const usdtAmount = Number((amountCad * simulatedRate).toFixed(6));

  return {
    bridgeTransferId: `bridge_${transferId}`,
    asset: "USDT",
    usdtAmount,
  };
}

module.exports = {
  convertCadToStablecoin,
};
