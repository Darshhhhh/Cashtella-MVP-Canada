// Interac (Apaylo) adapter for creating transfer requests
async function createInteracRequest({ transferId, amountCad }) {
  // In production this would call Apaylo API
  // For MVP we simulate a request ID
  return {
    interacRequestId: `interac_${transferId}`,
    status: "PENDING",
  };
}

module.exports = {
  createInteracRequest,
};
