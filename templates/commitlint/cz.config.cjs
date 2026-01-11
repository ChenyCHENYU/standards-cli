module.exports = {
  types: [
    { value: "feat", name: "feat:     新功能 (feature)" },
    { value: "fix", name: "fix:      修复 bug (fix)" },
    { value: "docs", name: "docs:     文档更新 (documentation)" },
    { value: "style", name: "style:    代码格式调整（不影响功能）(style)" },
    { value: "refactor", name: "refactor: 重构 (refactor)" },
    { value: "perf", name: "perf:     性能优化 (performance)" },
    { value: "test", name: "test:     测试相关 (test)" },
    { value: "build", name: "build:    构建系统或外部依赖变动 (build)" },
    { value: "ci", name: "ci:       CI 配置变动 (ci)" },
    { value: "chore", name: "chore:    其他杂项 (chore)" },
    { value: "revert", name: "revert:   回滚提交 (revert)" },
  ],

  // 交互提示信息
  messages: {
    type: "选择你要提交的类型:",
    scope: "填写 scope (对应代码模块):",
    customScope: "请输入自定义 scope:",
    subject: "填写简短描述 (必填):",
    confirmCommit: "确认提交?",
  },

  // 是否允许自定义 scope
  allowCustomScopes: true,

  // 是否允许空 scope（false 表示必须填写）
  allowEmptyScopes: false,

  // scope 是否从枚举列表选择（false 表示手动输入）
  scopeEnum: false,

  // 是否允许自定义 type
  allowCustomTypes: false,

  // 是否允许空 subject
  allowEmptySubject: false,

  // subject 最大长度
  subjectMaxLength: 72,

  // 是否允许 breaking 变更
  allowBreakingChanges: ["feat", "fix"],
};
