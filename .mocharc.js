module.exports = {
  "spec": "./src/test/**/*.test.ts",
  "require": [
    "ts-node/register",
    'source-map-support/register',
    "mocha-clean"
  ],
  "bail": true,
  "exit": true,
  "colors": true,
  "recursive": true,
  "full-trace": false,
  "timeout": false,
}