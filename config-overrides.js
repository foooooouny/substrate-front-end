const path = require("path");
const {
  removeModuleScopePlugin,
  override,
  addWebpackAlias
} = require("customize-cra");

module.exports = override(
  removeModuleScopePlugin(),
  addWebpackAlias({
    ["@"]: path.resolve(__dirname, "src"),
    ["@public"]: path.resolve(__dirname, "public"),
    ["@sub-lib"]: path.resolve(__dirname, "src/substrate-lib")
  })
);
