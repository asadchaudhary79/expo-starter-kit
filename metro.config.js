const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const backendPattern = /[\\/]backend[\\/].*/;
const existingBlockList = config.resolver.blockList;

if (existingBlockList instanceof RegExp) {
  config.resolver.blockList = new RegExp(`${existingBlockList.source}|${backendPattern.source}`);
} else {
  config.resolver.blockList = [...(existingBlockList ?? []), backendPattern];
}

module.exports = config;
