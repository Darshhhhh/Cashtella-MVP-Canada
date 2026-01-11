const TRANSFER_STATES = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CONVERTING: "CONVERTING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

const ALLOWED_TRANSITIONS = {
  [TRANSFER_STATES.PENDING]: [
    TRANSFER_STATES.AUTHORIZED,
    TRANSFER_STATES.FAILED,
  ],
  [TRANSFER_STATES.AUTHORIZED]: [
    TRANSFER_STATES.CONVERTING,
    TRANSFER_STATES.FAILED,
  ],
  [TRANSFER_STATES.CONVERTING]: [
    TRANSFER_STATES.COMPLETED,
    TRANSFER_STATES.FAILED,
  ],
  [TRANSFER_STATES.COMPLETED]: [],
  [TRANSFER_STATES.FAILED]: [],
};

/**
 * Ensures a transfer can move from currentState → nextState.
 * Throws if invalid.
 */
function assertValidTransition(currentState, nextState) {
  const allowed = ALLOWED_TRANSITIONS[currentState];

  if (!allowed) {
    throw new Error(`Unknown transfer state: ${currentState}`);
  }

  if (!allowed.includes(nextState)) {
    throw new Error(
      `Invalid transfer state transition: ${currentState} → ${nextState}`
    );
  }
}

function isTerminalState(state) {
  return (
    state === TRANSFER_STATES.COMPLETED || state === TRANSFER_STATES.FAILED
  );
}

module.exports = {
  TRANSFER_STATES,
  assertValidTransition,
  isTerminalState,
};
