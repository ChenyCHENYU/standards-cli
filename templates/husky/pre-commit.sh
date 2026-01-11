#!/bin/sh
###
 # @Author: ChenYu ycyplus@gmail.com
 # @Date: 2026-01-11 22:50:49
 # @LastEditors: ChenYu ycyplus@gmail.com
 # @LastEditTime: 2026-01-11 22:50:52
 # @FilePath: \frontend-standards\templates\husky\pre-commit.sh
 # @Description: 
 # Copyright (c) 2026 by CHENY, All Rights Reserved 😎. 
### 
. "$(dirname "$0")/_/husky.sh"
npx --no-install lint-staged
