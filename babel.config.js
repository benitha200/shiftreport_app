// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       // 'nativewind/babel',  // Temporarily disable
//       // 'react-native-reanimated/plugin',  // Temporarily disable
//     ],
//   };
// };
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};