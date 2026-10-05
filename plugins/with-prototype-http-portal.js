const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

module.exports = function withPrototypeHttpPortal(config) {
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('Could not configure HTTP access: Android application manifest is missing.');
    }

    // Prototype only: remove this global HTTP allowance when the portal supports HTTPS.
    application.$['android:usesCleartextTraffic'] = 'true';
    return config;
  });

  return withInfoPlist(config, (config) => {
    const transportSecurity = config.modResults.NSAppTransportSecurity;
    config.modResults.NSAppTransportSecurity = {
      ...(typeof transportSecurity === 'object' && transportSecurity !== null
        ? transportSecurity
        : {}),
      NSAllowsArbitraryLoadsInWebContent: true,
    };
    return config;
  });
};
