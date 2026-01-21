/**
 * Generates a cryptographically secure unique identifier
 * Replaces Math.random() which is predictable and can cause collisions
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * Generates a short, readable invite code (6 characters, uppercase)
 * Not cryptographically secure, but suitable for invite codes
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);

  for (let i = 0; i < 6; i++) {
    const value = array[i];
    if (value !== undefined) {
      code += chars[value % chars.length];
    }
  }

  return code;
};
