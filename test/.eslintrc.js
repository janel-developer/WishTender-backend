module.exports = {
  env: {
    mocha: true,
  },
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: 'should|expect' }],
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],
  },
};
