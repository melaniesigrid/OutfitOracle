let store = new Map();

function ensureValidKey(key) {
  if (typeof key !== 'string' || !/^[\w.-]+$/.test(key)) {
    throw new Error('Invalid key provided to SecureStore. Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".');
  }
}

const SecureStore = {
  getItemAsync: jest.fn(async key => {
    ensureValidKey(key);
    return store.get(key) ?? null;
  }),
  setItemAsync: jest.fn(async (key, value) => {
    ensureValidKey(key);
    store.set(key, value);
  }),
  deleteItemAsync: jest.fn(async key => {
    ensureValidKey(key);
    store.delete(key);
  }),
  _clear: () => { store.clear(); },
};

module.exports = SecureStore;
