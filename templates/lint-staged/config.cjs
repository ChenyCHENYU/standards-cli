/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-01-11 22:50:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-01-11 22:50:45
 * @FilePath: \frontend-standards\templates\lint-staged\config.cjs
 * @Description:
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
module.exports = {
  "*.{js,jsx,ts,tsx,vue}": ["eslint --fix"],
  "*.{js,jsx,ts,tsx,vue,css,scss,less,md,json,yml,yaml}": ["prettier --write"],
};
