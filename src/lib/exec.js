import { spawn } from "child_process";

/**
 * 执行命令并打印输出
 * @param {string} command - 命令字符串
 * @param {object} options - 选项
 * @returns {Promise<number>} - 退出码
 */
export function execLive(command, options = {}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");

    const proc = spawn(cmd, args, {
      shell: true,
      stdio: "inherit",
      ...options,
    });

    proc.on("close", (code) => {
      resolve(code);
    });

    proc.on("error", (error) => {
      reject(error);
    });
  });
}
