module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
    },
    extends: ['plugin:vue/recommended', '@vue/airbnb'],
    parserOptions: {
        ecmaVersion: 8,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
        indent: ['error', 4],
        'vue/html-indent': ['error', 4],
        'brace-style': ['error', 'stroustrup'],
        'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['event'] }],
        'linebreak-style': 'off',
        'no-plusplus': 'off',
        'max-len': ['error', { code: 150 }],
        'no-continue': 'off',
        'radix': "off",
        'no-loop-func': 'off',
    },
};