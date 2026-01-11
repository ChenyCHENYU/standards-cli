#!/usr/bin/env node

import { init } from "./commands/init.js";

const args = process.argv.slice(2);
const command = args[0];

const helpText = `
standards-cli - 一键初始化前端项目提交规范链路

用法:
  standards init [选项]

选项:
  --pm <pnpm|bun|yarn|npm>  指定包管理器，跳过选择
  --yes                      默认 yes，跳过安装确认
  --no-install               只生成文件，不安装依赖

示例:
  standards init
  standards init --pm pnpm
  standards init --yes
  standards init --no-install
`;

async function main() {
  if (
    !command ||
    command === "-h" ||
    command === "--help" ||
    command === "help"
  ) {
    console.log(helpText);
    process.exit(0);
  }

  if (command === "init") {
    await init(args.slice(1));
  } else {
    console.error(`未知命令: ${command}`);
    console.log(helpText);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("错误:", error.message);
  process.exit(1);
});
