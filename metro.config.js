const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// lucide-react-native's "react-native" field resolves to ESM which Metro
// can't handle. Override to use the CJS build instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'lucide-react-native') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/lucide-react-native/dist/cjs/lucide-react-native.js'
      ),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
