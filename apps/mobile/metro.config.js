// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Add support for resolving TypeScript files from workspace packages
config.resolver.sourceExts.push('ts', 'tsx')
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'ts' && ext !== 'tsx')

// Watch workspace packages
const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
config.watchFolders = [workspaceRoot]

// Resolve workspace packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

module.exports = config
