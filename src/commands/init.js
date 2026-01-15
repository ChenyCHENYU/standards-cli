import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  exists,
  readJson,
  writeJson,
  ensureDir,
  writeFileIfMissing,
  writeFile,
  chmodSafe,
} from "../lib/fs.js";
import {
  detectPackageManager,
  getInstallCommand,
  getExecCommand,
  isValidPm,
  SUPPORTED_PMS,
} from "../lib/pm.js";
import { execLive } from "../lib/exec.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({ input, output });

/**
 * 需要安装的依赖列表
 */
const REQUIRED_DEPS = [
  "husky",
  "lint-staged",
  "@commitlint/cli",
  "@commitlint/config-conventional",
  "cz-git",
  "commitizen",
];

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const result = {
    pm: null,
    yes: false,
    noInstall: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--pm" && args[i + 1]) {
      result.pm = args[i + 1];
      i++;
    } else if (arg === "--yes") {
      result.yes = true;
    } else if (arg === "--no-install") {
      result.noInstall = true;
    }
  }

  return result;
}

/**
 * 询问用户是否安装依赖
 */
async function askInstallDeps() {
  const answer = await rl.question("是否安装缺失依赖? (Y/n): ");
  const normalized = answer.trim().toLowerCase();
  return normalized === "" || normalized === "y" || normalized === "yes";
}

/**
 * 询问用户选择包管理器
 */
async function askPackageManager(defaultPm) {
  const options = SUPPORTED_PMS.map((pm, index) => `${index + 1}. ${pm}`).join(
    "  "
  );
  const answer = await rl.question(
    `请选择包管理器 (${options}) [默认: ${defaultPm}]: `
  );
  const normalized = answer.trim().toLowerCase();

  if (normalized === "") {
    return defaultPm;
  }

  // 支持直接输入名称
  if (isValidPm(normalized)) {
    return normalized;
  }

  // 支持输入数字
  const index = parseInt(normalized, 10);
  if (!isNaN(index) && index >= 1 && index <= SUPPORTED_PMS.length) {
    return SUPPORTED_PMS[index - 1];
  }

  return defaultPm;
}

/**
 * 检查项目是否已安装 eslint/prettier
 */
function hasLintTools(pkg) {
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  return !!allDeps.eslint && !!allDeps.prettier;
}

/**
 * 生成配置文件
 */
async function generateConfigFiles(pkg) {
  console.log("\n📝 生成配置文件...");

  // 读取模板文件
  const commitlintConfig = readFileSync(
    join(__dirname, "../../templates/commitlint/config.cjs"),
    "utf-8"
  );
  const lintstagedConfigFull = readFileSync(
    join(__dirname, "../../templates/lint-staged/config.cjs"),
    "utf-8"
  );
  const lintstagedConfigSimple = readFileSync(
    join(__dirname, "../../templates/lint-staged/config-simple.cjs"),
    "utf-8"
  );

  // commitlint.config.cjs
  const commitlintCreated = await writeFileIfMissing(
    "commitlint.config.cjs",
    commitlintConfig
  );
  if (commitlintCreated) {
    console.log("  ✔ commitlint.config.cjs");
  } else {
    console.log("  ⚠ commitlint.config.cjs (已存在，跳过)");
  }

  // .lintstagedrc.cjs - 根据是否有 eslint/prettier 选择模板
  const hasLintToolsInstalled = hasLintTools(pkg);
  const lintstagedContent = hasLintToolsInstalled
    ? lintstagedConfigFull
    : lintstagedConfigSimple;
  const lintstagedrcCreated = await writeFileIfMissing(
    ".lintstagedrc.cjs",
    lintstagedContent
  );
  if (lintstagedrcCreated) {
    console.log("  ✔ .lintstagedrc.cjs");
  } else {
    console.log("  ⚠ .lintstagedrc.cjs (已存在，跳过)");
  }

  // .husky 目录
  await ensureDir(".husky");

  // .husky/pre-commit
  const preCommitContent = `#!/bin/sh
npx --no-install lint-staged
`;
  await writeFile(".husky/pre-commit", preCommitContent);
  await chmodSafe(".husky/pre-commit");
  console.log("  ✔ .husky/pre-commit");

  // .husky/commit-msg
  const commitMsgContent = `#!/bin/sh
npx --no-install commitlint --edit "$1"
`;
  await writeFile(".husky/commit-msg", commitMsgContent);
  await chmodSafe(".husky/commit-msg");
  console.log("  ✔ .husky/commit-msg");
}

/**
 * 修改 package.json
 */
async function updatePackageJson() {
  console.log("\n📦 更新 package.json...");

  const pkg = await readJson("package.json");

  let modified = false;

  // 确保 scripts 存在
  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  // 添加 prepare（如果不存在）
  if (!pkg.scripts.prepare) {
    pkg.scripts.prepare = "husky";
    console.log('  ✔ 添加 scripts.prepare = "husky"');
    modified = true;
  } else if (
    pkg.scripts.prepare === "husky install" ||
    pkg.scripts.prepare === "husky init"
  ) {
    pkg.scripts.prepare = "husky";
    console.log('  ✔ 更新 scripts.prepare = "husky"');
    modified = true;
  } else {
    console.log("  ⚠ scripts.prepare (已存在，跳过)");
  }

  // 添加 cz（如果不存在）
  if (!pkg.scripts.cz) {
    pkg.scripts.cz = "cz";
    console.log('  ✔ 添加 scripts.cz = "cz"');
    modified = true;
  } else {
    console.log("  ⚠ scripts.cz (已存在，跳过)");
  }

  // 添加 commit（如果不存在）
  if (!pkg.scripts.commit) {
    pkg.scripts.commit = "cz";
    console.log('  ✔ 添加 scripts.commit = "cz"');
    modified = true;
  } else {
    console.log("  ⚠ scripts.commit (已存在，跳过)");
  }

  // 确保 config 存在
  if (!pkg.config) {
    pkg.config = {};
  }

  // 添加 commitizen.path（如果不存在）
  if (!pkg.config.commitizen) {
    pkg.config.commitizen = {};
  }
  if (!pkg.config.commitizen.path) {
    pkg.config.commitizen.path = "cz-git";
    console.log('  ✔ 添加 config.commitizen.path = "cz-git"');
    modified = true;
  } else {
    console.log("  ⚠ config.commitizen.path (已存在，跳过)");
  }

  // 智能处理 string-width 版本兼容性
  // string-width v5+ 是 ESM 模块，可能导致某些工具在低版本 Node.js 或 CommonJS 环境下报错
  // 检测 Node.js 版本，< 18 时降级到 v4
  const nodeVersion = process.version.slice(1).split(".").map(Number);
  const needOverride = nodeVersion[0] < 18;

  if (needOverride) {
    if (!pkg.pnpm) {
      pkg.pnpm = {};
    }
    if (!pkg.pnpm.overrides) {
      pkg.pnpm.overrides = {};
    }
    if (!pkg.pnpm.overrides["string-width"]) {
      pkg.pnpm.overrides["string-width"] = "^4.2.3";
      console.log(
        '  ✔ 添加 pnpm.overrides["string-width"] = "^4.2.3" (Node.js < 18 兼容)'
      );
      modified = true;
    }
  } else {
    // Node.js >= 18，不添加 override，让 pnpm 自动处理
    console.log("  ℹ Node.js >= 18，跳过 string-width override");
  }

  if (modified) {
    await writeJson("package.json", pkg);
  }
}

/**
 * 检查缺失的依赖
 */
function checkMissingDeps(pkg) {
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  const missing = REQUIRED_DEPS.filter((dep) => !allDeps[dep]);
  return missing;
}

/**
 * 安装依赖
 */
async function installDependencies(pm, missingDeps) {
  console.log("\n📥 安装依赖...");
  const command = getInstallCommand(pm, missingDeps);
  console.log(`  执行: ${command}`);
  const code = await execLive(command);
  if (code !== 0) {
    throw new Error(`依赖安装失败，退出码: ${code}`);
  }
  console.log("  ✔ 依赖安装成功");
}

/**
 * 执行 husky init
 */
async function runHuskyInstall(pm) {
  console.log("\n🔧 初始化 husky...");
  
  // 设置 Git hooks 路径为 .husky
  const gitConfigCmd = "git config core.hooksPath .husky";
  console.log(`  执行: ${gitConfigCmd}`);
  const gitCode = await execLive(gitConfigCmd);
  if (gitCode !== 0) {
    throw new Error(`设置 Git hooks 路径失败，退出码: ${gitCode}`);
  }
  console.log("  ✔ Git hooks 路径已设置为 .husky");
}

/**
 * 打印成功信息
 */
function printSuccess(pm, hasLintTools) {
  console.log("\n✅ 提交规范链路初始化完成！\n");
  console.log("📝 使用方式:");
  console.log(`  运行 ${pm} commit 进行交互式提交`);
  console.log(`  或运行 ${pm} cz 进行交互式提交\n`);
  console.log("💡 提示:");
  if (hasLintTools) {
    console.log("  - lint-staged 已配置为完整模式（包含 eslint 和 prettier）");
    console.log("  - 如需调整，请修改 .lintstagedrc.cjs 配置\n");
  } else {
    console.log("  - lint-staged 已配置为简单模式（仅规范提交信息）");
    console.log("  - 如需启用 eslint/prettier，请先安装工具后重新运行 init\n");
  }
}

/**
 * 打印安装命令
 */
function printInstallCommand(missingDeps, defaultPm) {
  console.log("\n📋 请手动执行以下命令安装依赖:\n");
  for (const pm of SUPPORTED_PMS) {
    const command = getInstallCommand(pm, missingDeps);
    const marker = pm === defaultPm ? " [推荐]" : "";
    console.log(`  ${command}${marker}`);
  }
  console.log("\n安装后请运行 prepare 脚本来初始化 hooks（npm install 会自动执行）\n");
}

/**
 * 主函数
 */
export async function init(args) {
  try {
    console.log("🚀 standards-cli - 提交规范链路初始化\n");

    // 解析参数
    const options = parseArgs(args);

    // 1. 检查 package.json 是否存在
    if (!(await exists("package.json"))) {
      console.error("❌ 错误: 当前目录未找到 package.json");
      console.log("   请在业务仓库根目录下运行此命令");
      rl.close();
      process.exit(1);
    }
    console.log("✔ 检测到 package.json");

    // 读取 package.json
    const pkg = await readJson("package.json");

    // 2. 生成配置文件
    await generateConfigFiles(pkg);

    // 3. 修改 package.json
    await updatePackageJson();

    // 4. 检查缺失依赖
    const missingDeps = checkMissingDeps(pkg);
    if (missingDeps.length > 0) {
      console.log(`\n📦 缺失依赖: ${missingDeps.join(", ")}`);

      if (options.noInstall) {
        printInstallCommand(missingDeps, "pnpm");
        rl.close();
        return;
      }

      // 询问是否安装
      const shouldInstall = options.yes || (await askInstallDeps());

      if (shouldInstall) {
        // 确定包管理器
        let pm = options.pm || (await detectPackageManager());
        if (options.pm && !isValidPm(options.pm)) {
          console.warn(`⚠ 不支持的包管理器: ${options.pm}，将使用默认值`);
          pm = await detectPackageManager();
        }
        // 只在非 yes 模式下询问包管理器
        if (!options.pm && !options.yes) {
          pm = await askPackageManager(pm);
        }

        // 安装依赖
        await installDependencies(pm, missingDeps);

        // 6. 执行 husky install
        await runHuskyInstall(pm);

        // 7. 打印成功信息
        const hasLintToolsInstalled = hasLintTools(pkg);
        printSuccess(pm, hasLintToolsInstalled);
      } else {
        printInstallCommand(missingDeps, "pnpm");
      }
    } else {
      console.log("\n✔ 所有依赖已安装");

      // 检测包管理器
      const pm = options.pm || (await detectPackageManager());
      if (options.pm && !isValidPm(options.pm)) {
        console.warn(`⚠ 不支持的包管理器: ${options.pm}`);
      }

      // 执行 husky install
      try {
        await runHuskyInstall(pm);
      } catch (error) {
        console.warn(`⚠ husky install 失败: ${error.message}`);
      }

      // 打印成功信息
      const hasLintToolsInstalled = hasLintTools(pkg);
      printSuccess(pm, hasLintToolsInstalled);
    }

    rl.close();
  } catch (error) {
    console.error(`\n❌ 初始化失败: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}
