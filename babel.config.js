module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Halimbawa kung kailangan mo ng Reanimated plugin:
      "react-native-reanimated/plugin",
    ],
  };
};
