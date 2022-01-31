module.exports = {
    'root': true,
    'env': {
        'greasemonkey': true,
        'es6': true,
        'jquery': true,
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
        'object-curly-spacing': 'always',
        'require-jsdoc': 'off',
    },
};
