#!/bin/sh
###
 # @Author: ChenYu ycyplus@gmail.com
 # @Date: 2026-01-11 22:50:56
 # @LastEditors: ChenYu ycyplus@gmail.com
 # @LastEditTime: 2026-01-11 22:50:58
 # @FilePath: \frontend-standards\templates\husky\commit-msg.sh
 # @Description: 
 # Copyright (c) 2026 by CHENY, All Rights Reserved 😎. 
### 
. "$(dirname "$0")/_/husky.sh"
npx --no-install commitlint --edit "$1"
