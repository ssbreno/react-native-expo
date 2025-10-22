const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// List of all icon fonts that should be excluded (keeping only Ionicons)
const excludedIconFonts = [
  'AntDesign.ttf',
  'Entypo.ttf',
  'EvilIcons.ttf',
  'Feather.ttf',
  'FontAwesome.ttf',
  'FontAwesome5_Brands.ttf',
  'FontAwesome5_Regular.ttf',
  'FontAwesome5_Solid.ttf',
  'FontAwesome6_Brands.ttf',
  'FontAwesome6_Regular.ttf',
  'FontAwesome6_Solid.ttf',
  'Fontisto.ttf',
  'Foundation.ttf',
  'MaterialCommunityIcons.ttf',
  'MaterialIcons.ttf',
  'Octicons.ttf',
  'SimpleLineIcons.ttf',
  'Zocial.ttf',
];

// Custom resolver to exclude unused icon fonts
const defaultResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if this is an icon font we want to exclude
  if (moduleName.includes('react-native-vector-icons/Fonts/')) {
    const fontName = moduleName.split('/').pop().replace('.ttf', '') + '.ttf';

    if (excludedIconFonts.includes(fontName)) {
      // Return a minimal empty module to prevent bundling
      return {
        type: 'empty',
      };
    }
  }

  // For all other cases, use the default resolver
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
