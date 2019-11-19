module.exports = {
  'env': {
    'greasemonkey': true,
    'es6': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'indent': 'off',
    'linebreak-style': 'off',
    'max-len': 'off',
    'no-tabs': 'off',
    'require-jsdoc': 'off'
  },
};
