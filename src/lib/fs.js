import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 检查文件或目录是否存在
 */
export async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取 JSON 文件
 */
export async function readJson(path) {
  const content = await fs.readFile(path, "utf-8");
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 */
export async function writeJson(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * 确保目录存在，不存在则创建
 */
export async function ensureDir(path) {
  if (!(await exists(path))) {
    await fs.mkdir(path, { recursive: true });
  }
}

/**
 * 写入文件（如果不存在）
 * 返回 true 表示写入成功，false 表示已存在跳过
 */
export async function writeFileIfMissing(path, content) {
  if (await exists(path)) {
    return false;
  }
  await fs.writeFile(path, content, "utf-8");
  return true;
}

/**
 * 写入文件（总是写入，覆盖）
 */
export async function writeFile(path, content) {
  await fs.writeFile(path, content, "utf-8");
}

/**
 * 安全设置文件可执行权限（仅在非 Windows 系统）
 */
export async function chmodSafe(path) {
  if (process.platform === "win32") {
    return; // Windows 不需要 chmod
  }
  try {
    await fs.chmod(path, 0o755);
  } catch (error) {
    // 失败不致命，忽略
  }
}
