process.env.VUE_CLI_BABEL_TARGET_NODE = true;
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true;

module.exports = {
  testEnvironment:'jsdom',
  "transform": {
    "^.+\\.vue$": "vue-jest",
    "^.+\\.js$": "babel-jest"
  }
}
