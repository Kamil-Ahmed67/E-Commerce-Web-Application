import crypto from 'crypto';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function getSecret() {
  const secret = process.env.RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error('RESET_TOKEN_SECRET is not configured');
  }
  return secret;
}

function sign(email, expiresAt) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(`${email.toLowerCase()}:${expiresAt}`)
    .digest('hex');
}

// Stateless password-reset token: no DB storage needed. The token embeds an
// expiry and an HMAC signature binding it to the target email, so it can be
// verified later using only the secret — but it can never be reused for a
// different email, and it self-expires after TOKEN_TTL_MS.
export function generateResetToken(email) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = sign(email, expiresAt);
  return Buffer.from(`${expiresAt}.${signature}`).toString('base64url');
}

export function verifyResetToken(token, email) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [expiresAtRaw, signature] = decoded.split('.');
    const expiresAt = Number(expiresAtRaw);

    if (!expiresAt || !signature || Date.now() > expiresAt) {
      return false;
    }

    const expectedSignature = sign(email, expiresAt);
    const provided = Buffer.from(signature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');

    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}
