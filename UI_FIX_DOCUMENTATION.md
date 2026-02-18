# UI 显示问题修复文档

## 问题描述

### 症状
- 在 After Effects 2025 中通过"文件 > 脚本 > 运行脚本文件"运行 `RiveElasticCurve-standalone.jsx` 后，UI 窗口不显示
- 脚本执行没有报错，但用户看不到任何界面

### 根本原因
脚本使用了 `palette` 类型的窗口，而这种窗口类型在"运行脚本文件"模式下不会正常显示。

## 窗口类型对比

### Palette 窗口
- **用途**: 可停靠的面板，设计用于持久化显示
- **特点**:
  - 可以停靠到 AE 界面的任意位置
  - 适合作为工具面板长期使用
  - 在"运行脚本文件"模式下可能不显示
- **适用场景**: 安装到 ScriptUI Panels 文件夹的脚本

### Dialog 窗口
- **用途**: 模态对话框，用于一次性交互
- **特点**:
  - 阻塞式显示，用户必须关闭窗口才能继续
  - 始终显示在最前面
  - 在"运行脚本文件"模式下正常工作
- **适用场景**: 通过"运行脚本文件"执行的脚本

## 修复方案

### 修改内容

#### 1. 窗口类型更改
**文件**: `RiveElasticCurve-standalone.jsx` (第 588 行)

**修改前**:
```javascript
_window = new Window('palette', 'Rive Elastic Curve', undefined, {
    resizeable: false
});
```

**修改后**:
```javascript
_window = new Window('dialog', 'Rive Elastic Curve', undefined, {
    resizeable: false
});
```

#### 2. 同步更新模块化版本
**文件**: `view/ElasticCurveView.jsx` (第 20 行)

应用了相同的修改，确保两个版本保持一致。

### 技术说明

1. **窗口显示机制**:
   - `dialog` 窗口使用 `show()` 方法会阻塞脚本执行，直到窗口关闭
   - 这是期望的行为，因为用户需要与 UI 交互来设置参数

2. **兼容性**:
   - 修改后的代码在 After Effects 2023+ 版本中都能正常工作
   - 不影响现有功能，只是改变了窗口的显示方式

3. **用户体验**:
   - 窗口会居中显示在屏幕上
   - 用户可以正常使用所有功能
   - 关闭窗口后脚本执行结束

## 测试验证

### 测试脚本
提供了 `test-ui.jsx` 用于验证窗口显示：

```bash
# 在 After Effects 中运行测试脚本
文件 > 脚本 > 运行脚本文件 > 选择 test-ui.jsx
```

测试脚本会：
1. 询问测试 Dialog 还是 Palette 窗口
2. 显示相应类型的测试窗口
3. 验证窗口是否正常显示

### 手动测试步骤

1. **启动 After Effects 2025**

2. **运行主脚本**:
   - 文件 > 脚本 > 运行脚本文件
   - 选择 `RiveElasticCurve-standalone.jsx`

3. **验证 UI 显示**:
   - ✅ 窗口应该立即显示在屏幕中央
   - ✅ 标题显示为 "Rive Elastic Curve"
   - ✅ 所有控件（输入框、下拉菜单、按钮）都可见
   - ✅ 状态文本显示"就绪"

4. **测试功能**:
   - 创建一个合成
   - 添加一个图层
   - 为图层的位置属性添加至少 2 个关键帧
   - 选中位置属性
   - 在插件 UI 中点击"应用到选中关键帧"
   - ✅ 应该看到成功消息
   - ✅ 表达式应该被应用到属性上

5. **测试参数调整**:
   - 修改振幅值（如 2.0）
   - 修改周期值（如 1.0）
   - 更改缓动类型
   - ✅ 所有控件应该响应正常
   - ✅ 无效输入应该显示错误提示

## 使用说明

### 推荐使用方式

**方式 1: 运行脚本文件（推荐）**
```
文件 > 脚本 > 运行脚本文件 > 选择 RiveElasticCurve-standalone.jsx
```
- ✅ 使用 dialog 窗口，显示正常
- ✅ 无需安装，直接运行
- ✅ 适合临时使用

**方式 2: 安装为 ScriptUI Panel（可选）**
```
1. 将脚本复制到：
   Windows: C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\Scripts\ScriptUI Panels\
   macOS: /Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/

2. 重启 After Effects

3. 窗口 > RiveElasticCurve-standalone.jsx
```
- 如果需要作为面板使用，可以考虑创建一个 palette 版本
- 当前版本使用 dialog，不适合作为持久面板

## 技术细节

### 窗口生命周期

```javascript
// 创建窗口
var win = new Window('dialog', 'Title');

// 构建 UI
win.add('statictext', undefined, 'Hello');

// 显示窗口（阻塞式）
win.center();
win.show();  // 脚本在此处暂停，直到窗口关闭
```

### 事件处理
- 所有按钮点击事件正常工作
- 输入框的 `onChange` 事件正常触发
- 下拉菜单的 `onChange` 事件正常触发

### 错误处理
- 参数验证在输入时进行
- 无效输入会显示错误提示并恢复到之前的值
- 应用失败会显示详细的错误信息

## 已知限制

1. **窗口类型**:
   - 使用 dialog 窗口意味着不能停靠到 AE 界面
   - 如果需要可停靠面板，需要创建单独的 palette 版本

2. **多实例**:
   - 同时只能运行一个脚本实例
   - 再次运行会创建新窗口

3. **持久化**:
   - 窗口关闭后脚本执行结束
   - 参数不会保存，下次运行会恢复默认值

## 未来改进建议

1. **双版本支持**:
   - 保留 dialog 版本用于"运行脚本文件"
   - 创建 palette 版本用于安装为面板
   - 自动检测运行环境并选择合适的窗口类型

2. **参数持久化**:
   - 使用 `app.settings` 保存用户的参数设置
   - 下次运行时恢复上次的参数

3. **快捷键支持**:
   - 添加键盘快捷键（如 Enter 应用，Esc 关闭）
   - 提升用户体验

## 版本历史

### v1.0.4 (2026-02-19)
- 🐛 修复: 将窗口类型从 `palette` 改为 `dialog`
- ✨ 改进: 添加详细的注释说明窗口类型选择
- 📝 文档: 创建 UI 修复文档
- 🧪 测试: 添加 UI 测试脚本

### v1.0.3
- 单文件版本，解决 $.evalFile() 兼容性问题

### v1.0.2
- 修复 IIFE 作用域导致的构造函数访问问题

### v1.0.1
- 添加调试日志和错误处理

### v1.0.0
- 初始版本

## 参考资料

- [Adobe ExtendScript Toolkit 文档](https://extendscript.docsforadobe.dev/)
- [ScriptUI Window Types](https://extendscript.docsforadobe.dev/user-interface-tools/window-class.html)
- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)

## 支持

如有问题或建议，请提交 Issue 或 Pull Request。
