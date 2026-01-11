
import { exists } from "./fs.js";

/**
 * 支持的包管理器列表
 */
export const SUPPORTED_PMS = ["pnpm", "bun", "yarn", "npm"];

/**
 * 检测当前项目使用的包管理器
 * 通过检查 lock 文件判断
 */
export async function detectPackageManager() {
  // 检查 pnpm-lock.yaml
  if (await exists("pnpm-lock.yaml")) {
    return "pnpm";
  }
  // 检查 bun.lockb
  if (await exists("bun.lockb")) {
    return "bun";
  }
  // 检查 yarn.lock
  if (await exists("yarn.lock")) {
    return "yarn";
  }
  // 检查 package-lock.json
  if (await exists("package-lock.json")) {
    return "npm";
  }
  // 默认返回 pnpm
  return "pnpm";
}

/**
 * 获取安装命令
 */
export function getInstallCommand(pm, packages) {
  const deps = packages.join(" ");
  switch (pm) {
    case "pnpm":
      return `pnpm add -D ${deps}`;
    case "bun":
      return `bun add -d ${deps}`;
    case "yarn":
      return `yarn add -D ${deps}`;
    case "npm":
      return `npm i -D ${deps}`;
    default:
      return `pnpm add -D ${deps}`;
  }
}

/**
 * 获取执行命令（用于运行本地安装的包）
 */
export function getExecCommand(pm, command) {
  switch (pm) {
    case "pnpm":
      return `pnpm exec ${command}`;
    case "bun":
      return `bunx ${command}`;
    case "yarn":
      return `yarn ${command}`;
    case "npm":
      return `npx ${command}`;
    default:
      return `npx ${command}`;
  }
}

/**
 * 验证包管理器是否支持
 */
export function isValidPm(pm) {
  return SUPPORTED_PMS.includes(pm);
}
