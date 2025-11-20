module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-linear-gradient|@react-native-community/datetimepicker|react-native-vector-icons)/)',
  ],
};
