const nodeCrypto = require('crypto');

const CryptoDigestAlgorithm = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
};

const CryptoEncoding = {
  HEX: 'hex',
  BASE64: 'base64',
};

function hashName(algorithm) {
  return String(algorithm).toLowerCase().replace('-', '');
}

module.exports = {
  CryptoDigestAlgorithm,
  CryptoEncoding,
  getRandomValues: jest.fn(array => {
    nodeCrypto.randomFillSync(array);
    return array;
  }),
  digestStringAsync: jest.fn((algorithm, value, options) => {
    const encoding = options?.encoding ?? CryptoEncoding.HEX;
    return Promise.resolve(nodeCrypto.createHash(hashName(algorithm)).update(value).digest(encoding));
  }),
};
