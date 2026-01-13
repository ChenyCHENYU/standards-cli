
module.exports = {
  "*.{js,jsx,ts,tsx,vue}": ['echo "Checking JS/Vue files..."'],
  "*.{js,jsx,ts,tsx,vue,css,scss,less,md,json,yml,yaml}": [
    'echo "Formatting files..."',
  ],
};
