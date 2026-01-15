/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-01-13 23:14:22
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-01-13 23:22:25
 * @FilePath: \standards-cli\templates\commitlint\config.cjs
 * @Description:
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-empty": [2, "never"], // 必须填写 scope
    "subject-empty": [2, "never"],
    "subject-max-length": [2, "always", 72],
    "subject-case": [0], // 允许中文，不限制大小写
  },
  prompt: {
    messages: {
      type: "选择你要提交的类型:",
      scope: "输入 scope (必填，如: login, auth):",
      subject: "输入简短描述:",
      confirmCommit: "确认提交?",
    },
    types: [
      { value: "feat", name: "feat:     新功能" },
      { value: "fix", name: "fix:      修复 bug" },
      { value: "docs", name: "docs:     文档更新" },
      { value: "style", name: "style:    代码格式调整" },
      { value: "refactor", name: "refactor: 重构" },
      { value: "perf", name: "perf:     性能优化" },
      { value: "test", name: "test:     测试相关" },
      { value: "build", name: "build:    构建系统" },
      { value: "ci", name: "ci:       CI 配置" },
      { value: "chore", name: "chore:    其他杂项" },
      { value: "revert", name: "revert:   回滚提交" },
    ],
    useEmoji: false,
    skipQuestions: [
      "body",
      "breaking",
      "breakingBody",
      "footer",
      "footerPrefix",
    ],
    enableMultipleScopes: false,
    scopeEnumSeparator: ",",
  },
};
