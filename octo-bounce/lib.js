
window.lib = {
  log: (...args) => console.log("[Octo-Bounce]", ...args),

  getAsset: (id) => {
    if (!window.ASSET_MAP) return undefined;
    return window.ASSET_MAP[id];
  },

  showGameParameters: (_uiConfig) => {},

  getAnimationPlayer: (_assetId) => null,
  preloadAnimation: async (_assetId) => {},
};
