const crypto = require('crypto');

// base64: base64 payload
// path: API path (e.g. /pg/v1/pay)
// saltKey: merchant salt key
// saltIndex: merchant salt index
function generateSignature(base64, path, saltKey, saltIndex) {
  const toSign = base64 + path + saltKey;
  const sha256 = crypto.createHash('sha256').update(toSign).digest('hex');
  return sha256 + '###' + saltIndex;
}

module.exports = { generateSignature }; 