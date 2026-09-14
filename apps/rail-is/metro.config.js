const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const kernelRoot = path.resolve(projectRoot, "../../packages/kernel");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [...(config.watchFolders ?? []), kernelRoot];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "@yetkin/kernel": kernelRoot,
};

module.exports = config;
