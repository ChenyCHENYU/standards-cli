# standards-cli

一键初始化前端项目提交规范链路（cz-git + commitlint + husky + lint-staged）

## 功能特性

- 🚀 一键初始化提交规范链路
- 📦 自动安装所需依赖
- 🔧 智能检测包管理器（pnpm/bun/yarn/npm）
- 🤖 智能检测 eslint/prettier，自动选择合适的 lint-staged 配置
- 📝 生成标准配置文件（引用模板，不复制）
- 🎯 支持 Vue3/ESM 项目
- ⚙️ husky hooks 自动配置

## 使用方式

### 方式一：npx（推荐）- 无需全局安装

```bash
npx standards-cli init
```

`npx` 会从 npm registry 临时下载包并运行，适合临时使用或测试。

### 方式二：作为项目依赖安装 - 推荐用于团队项目

```bash
# bun
bun add standards-cli

# npm
npm install standards-cli

# pnpm
pnpm add standards-cli

# yarn
yarn add standards-cli
```

安装后，通过 npm scripts 或 pnpm exec 运行：

```bash
# 使用 npm scripts
npm run standards init

# 或使用 pnpm exec
pnpm exec standards init
# 或使用 yarn
yarn standards init
# 或使用 bunx
bunx standards init
```

**优点：**

- 所有团队成员自动获得相同版本
- 无需全局安装
- 版本锁定在 package.json 中

### 方式三：全局安装 - 可在任何目录运行

```bash
npm install -g standards-cli
# 或
pnpm add -g standards-cli
# 或
yarn global add standards-cli
# 或
bun add -g standards-cli
```

全局安装后，可以在任何目录直接运行 `standards init`，适合频繁使用。

## 命令参数

```bash
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
```

## 生成的文件

运行 `standards init` 后，会在项目根目录生成以下文件：

```
├── commitlint.config.cjs    # commitlint 配置（引用模板）
├── cz.config.cjs            # cz-git 配置（引用模板）
├── .lintstagedrc.cjs        # lint-staged 配置（根据检测自动选择）
└── .husky/
    ├── pre-commit           # pre-commit hook
    └── commit-msg           # commit-msg hook
```

### package.json 变更

```json
{
  "scripts": {
    "prepare": "husky",
    "cz": "cz",
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-git"
    }
  },
  "pnpm": {
    "overrides": {
      "string-width": "^7.0.0"
    }
  }
}
```

## 安装的依赖

- `husky` - Git hooks 管理
- `lint-staged` - 暂存区文件检查
- `@commitlint/cli` - 提交信息检查
- `@commitlint/config-conventional` - 提交信息规范
- `cz-git` - 交互式提交工具
- `commitizen` - 提交工具框架

## 使用方式

初始化完成后，可以使用以下两种方式提交：

### 方式一：符合规范格式的直接提交（推荐）

```bash
git commit -m "feat(login): 完成登录相关功能"
git commit -m "fix(user): 修复用户信息更新bug"
```

**格式要求：** `type(scope): subject`

- `type`: 提交类型（feat/fix/docs 等）
- `scope`: 模块名称（必填，如 login、user、api 等）
- `subject`: 简短描述

✅ **只要符合格式，就能正常提交**  
❌ **不符合格式会被 commit-msg hook 拦截**

### 方式二：交互式提交

```bash
pnpm commit
# 或
pnpm cz
```

使用交互式界面选择提交类型、填写描述等，自动生成符合规范的提交信息。

## 团队成员使用流程

团队成员克隆项目后，只需执行：

```bash
# 1. 安装依赖（会自动执行 prepare 脚本，初始化 Git hooks）
pnpm install

# 2. 之后正常提交即可（符合规范就能提交，不符合会被拦截）
git commit -m "feat(login): 完成登录相关功能"
```

**说明：**

- `pnpm install` 会自动触发 `prepare` 脚本
- `prepare` 脚本执行 `husky`，自动配置 Git hooks
- 配置完成后，每次 commit 都会自动检查提交信息格式
- **无需额外操作**，开箱即用

## lint-staged 智能配置

CLI 会自动检测项目是否已安装 `eslint` 和 `prettier`，并生成对应的 lint-staged 配置：

**场景一：项目没有安装 eslint/prettier**

- lint-staged 配置为**简单模式**（仅 echo，不运行 eslint/prettier）
- 目的：只规范提交信息，避免 lint-staged 报错

**场景二：项目已安装 eslint/prettier**

- lint-staged 配置为**完整模式**（包含 `eslint --fix` 和 `prettier --write`）
- 目的：完整的代码检查和格式化

**如需切换模式：**

- 安装 eslint/prettier 后重新运行 `standards init`
- 或手动修改 `.lintstagedrc.cjs` 配置

## 提交类型

支持以下提交类型：

| 类型     | 说明                       |
| -------- | -------------------------- |
| feat     | 新功能                     |
| fix      | 修复 bug                   |
| docs     | 文档更新                   |
| style    | 代码格式调整（不影响功能） |
| refactor | 重构                       |
| perf     | 性能优化                   |
| test     | 测试相关                   |
| build    | 构建系统或外部依赖变动     |
| ci       | CI 配置变动                |
| chore    | 其他杂项                   |
| revert   | 回滚提交                   |

## 提交信息格式

提交信息必须符合以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `type`: 必选，提交类型（见上表）
- `scope`: 必选，影响范围（对应代码模块，如 `auth`, `user`）
- `subject`: 必选，简短描述（最多 72 字符）
- `body`: 可选，详细描述
- `footer`: 可选，关联 issue 等

**示例：**

```bash
# ✅ 正确格式（能提交）
git commit -m "feat(login): 完成登录相关功能"
git commit -m "fix(api): 修复接口超时问题"
git commit -m "docs(readme): 更新文档"

# ❌ 错误格式（会被拦截）
git commit -m "add login"           # 缺少 type 和 scope
git commit -m "feat: add login"     # 缺少 scope
git commit -m "update"              # 格式不符合
```

## 注意事项

1. **团队成员使用**：只需 `pnpm install`，会自动初始化 Git hooks
2. **提交方式**：`git commit -m "feat(scope): message"` 只要符合格式就能提交
3. **eslint/prettier 依赖**：本 CLI 不安装 eslint 和 prettier，请根据项目需要自行安装
4. **lint-staged 配置**：CLI 会自动检测并生成合适的配置
5. **Node 版本**：需要 Node.js >= 18

## 开发

```bash
# 本地测试
node src/index.js init

# 或使用 npm link
npm link
standards init
```

## 发布

```bash
npm publish
```

## License

MIT
