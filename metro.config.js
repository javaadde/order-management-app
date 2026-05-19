const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { resolve } = require('@expo/metro/metro-resolver');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules/zustand/index.js'),
    };
  }

  return resolve(context, moduleName, platform);
};

module.exports = config;
