module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@modules': './src/modules',
            '@shared': './src/shared',
            '@database': './src/database',
            '@theme': './src/theme',
            '@core': './src/core',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
