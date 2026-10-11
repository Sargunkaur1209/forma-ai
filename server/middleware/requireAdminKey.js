import crypto from 'node:crypto';

// Protects write routes with a shared admin key, checked via the
// x-admin-key header. Uses a timing-safe comparison so the key can't be
// guessed byte-by-byte from response timing.
function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    console.error('ADMIN_API_KEY is not set; refusing all admin-protected requests.');
    return res.status(500).json({ error: 'Server is not configured for this operation' });
  }

  const provided = req.get('x-admin-key') ?? '';
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);

  const matches =
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf);

  if (!matches) {
    return res.status(401).json({ error: 'Invalid or missing admin key' });
  }

  next();
}

export default requireAdminKey;
