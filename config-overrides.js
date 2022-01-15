// const {
//   override,
//   fixBabelImports
// } = require('customize-cra')

// module.exports = override(
//   fixBabelImports('import', {
//     libraryName: 'antd',
//     libraryDirectory: 'es',
//     style: true,
//   }),
// )
module.exports = function override(config, env) {
  console.log('--- override', config.module.rules, env)
  return config
}