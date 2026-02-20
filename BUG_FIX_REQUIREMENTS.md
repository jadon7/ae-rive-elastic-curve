# AnimationCurves Plugin 修复需求文档

## 项目概述

**项目名称：** AnimationCurves - After Effects 跨平台动画曲线插件  
**项目路径：** `/Users/liuhuihuan/Documents/RiveElasticCurve/`  
**主文件：** `AnimationCurves-standalone.jsx` (1169 行，单文件完整插件)  
**Git 仓库：** https://github.com/jadon7/ae-rive-elastic-curve.git  
**当前版本：** v2.0.0 Standalone  

### 功能目标

创建一个 After Effects 脚本插件，支持 26 条跨平台动画曲线：
- **Rive 平台：** 1 条曲线（Elastic）
- **Android 平台：** 11 条曲线（Linear, Accelerate, Decelerate, AccelerateDecelerate, Anticipate, Overshoot, AnticipateOvershoot, Bounce, FastOutSlowIn, FastOutLinearIn, LinearOutSlowIn）
- **iOS 平台：** 14 条曲线（Linear, EaseIn, EaseOut, EaseInOut, Spring Default/Gentle/Bouncy/Custom, CA Default/EaseIn/EaseOut/EaseInOut/Linear）

### UI 设计

- **窗口类型：** Palette（非阻塞，可与 AE 同时操作）
- **布局：** 三标签页（Rive / Android / iOS）
- **参数面板：** 每种曲线显示对应的可调参数
- **预览区域：** 文本信息显示（原计划图形预览，但 ExtendScript 限制）
- **应用按钮：** Apply to Selected Keyframes

---

## 当前存在的三个严重问题

### 问题 1: Rive Elastic 曲线报错

**症状：**
用户在 After Effects 中选择 Rive Elastic 曲线，调整参数后点击 "Apply to Selected Keyframes"，AE 报错：

```
After Effects 警告：表达式被禁用
合成"合成1"中图层1（"形状图层1"）的属性"位置"中，第1行出现错误。
Error：表达式中使用了未定义值（可能是超出范围的数组下标？）
linear(time, inPoint, outPoint, value.at(inPoint), value.at(outPoint))
```

**问题分析：**
- 错误位置：生成的 AE 表达式中使用了 `value.at(inPoint)` 和 `value.at(outPoint)`
- 根本原因：After Effects 表达式不支持 `.at()` 方法
- 正确语法：应该使用 `valueAtTime(inPoint)` 和 `valueAtTime(outPoint)`

**代码位置：**
- 文件：`AnimationCurves-standalone.jsx`
- 方法：`ExpressionGenerator.prototype.generateRive()` (约 line 407-438)
- 关键行：line 433-436

**重要提示：**
- **不要简化或删除 Elastic 曲线的数学实现**
- 完整的数学公式（amplitude, period, sin, cos, asin, pow 等）必须保留
- 只需要修复表达式语法错误，不要改变算法逻辑

**期望结果：**
- 生成的表达式使用正确的 AE 语法
- Elastic 曲线的完整数学实现被保留
- 用户应用曲线后，AE 不报错，动画正常播放

---

### 问题 2: Android Tab 参数切换不工作

**症状：**
- 用户打开插件，切换到 Android 标签页
- 默认选中 "Accelerate" 曲线，显示 "Factor" 参数 ✓（正确）
- 用户切换到 "Anticipate" 或 "Overshoot" 曲线
- **问题：** "Tension" 参数不显示，只能看到 "Factor" 参数 ✗（错误）
- 用户切换到其他曲线（如 "Bounce"），所有参数都不应该显示，但 "Factor" 依然显示 ✗（错误）

**问题分析：**
- 参数组的 `visible` 属性设置了，但 UI 没有刷新
- `onChange` 事件可能没有正确触发布局更新
- ScriptUI 的布局刷新机制可能需要显式调用

**代码位置：**
- 文件：`AnimationCurves-standalone.jsx`
- 方法：`setupAndroidTab()` (约 line 925-995)
- 关键逻辑：
  - `curveDropdown.onChange` 事件 (约 line 978-982)
  - `factorGroup.visible` 和 `tensionGroup.visible` 的设置
  - 初始化代码 (约 line 984-987)

**参数显示规则：**
| 曲线类型 | Factor 参数 | Tension 参数 |
|---------|------------|-------------|
| Linear | 隐藏 | 隐藏 |
| Accelerate | **显示** | 隐藏 |
| Decelerate | **显示** | 隐藏 |
| AccelerateDecelerate | 隐藏 | 隐藏 |
| Anticipate | 隐藏 | **显示** |
| Overshoot | 隐藏 | **显示** |
| AnticipateOvershoot | 隐藏 | **显示** |
| Bounce | 隐藏 | 隐藏 |
| FastOutSlowIn | 隐藏 | 隐藏 |
| FastOutLinearIn | 隐藏 | 隐藏 |
| LinearOutSlowIn | 隐藏 | 隐藏 |

**期望结果：**
- 用户切换曲线时，参数组立即显示/隐藏
- UI 正确刷新，不需要手动调整窗口大小
- 参数显示符合上表规则

---

### 问题 3: iOS Tab 参数面板不显示

**症状：**
- 用户打开插件，切换到 iOS 标签页
- 默认选中 "Ease In-Out" 曲线，参数面板不显示 ✓（正确，因为不需要参数）
- 用户切换到 "Spring Default" / "Spring Gentle" / "Spring Bouncy" / "Spring Custom" 任一曲线
- **问题：** "Spring Parameters" 面板不显示，看不到 Damping/Velocity/Duration 参数 ✗（错误）

**问题分析：**
- 参数面板 `paramPanel` 的 `visible` 属性设置了，但 UI 没有刷新
- 可能与 Android tab 相同的布局刷新问题
- 初始状态 `paramPanel.visible = false` 可能导致后续显示失败

**代码位置：**
- 文件：`AnimationCurves-standalone.jsx`
- 方法：`setupIOSTab()` (约 line 992-1090)
- 关键逻辑：
  - `paramPanel.visible = false` 初始设置 (约 line 1018)
  - `curveDropdown.onChange` 事件 (约 line 1063-1067)
  - 初始化代码 (约 line 1069-1071)

**参数显示规则：**
| 曲线类型 | Spring Parameters 面板 |
|---------|----------------------|
| Linear | 隐藏 |
| EaseIn | 隐藏 |
| EaseOut | 隐藏 |
| EaseInOut | 隐藏 |
| Spring Default | **显示** |
| Spring Gentle | **显示** |
| Spring Bouncy | **显示** |
| Spring Custom | **显示** |
| CA Default | 隐藏 |
| CA EaseIn | 隐藏 |
| CA EaseOut | 隐藏 |
| CA EaseInOut | 隐藏 |
| CA Linear | 隐藏 |

**期望结果：**
- 用户切换到任何 Spring 曲线时，参数面板立即显示
- 面板内显示三个参数：Damping (0.1-1.0), Velocity (0.0-3.0), Duration (0.1-2.0)
- UI 正确刷新，不需要手动调整窗口大小

---

## 项目结构

```
/Users/liuhuihuan/Documents/RiveElasticCurve/
├── AnimationCurves-standalone.jsx    # 主文件（需要修复）
├── test-all-curves.jsx               # 测试脚本（26条曲线自动化测试）
├── USER_GUIDE.md                     # 用户文档
├── EXAMPLES.md                       # 实战案例
├── RiveElasticCurve-standalone.jsx   # v1.1.0 备份（参考）
└── README.md                         # 项目说明
```

### 代码架构（AnimationCurves-standalone.jsx）

```javascript
// PART 1: 曲线数学实现 (Line 1-380)
function RiveElasticCurve(amplitude, period, easingType) { ... }
function AndroidAccelerateCurve(factor) { ... }
function iOSSpringCurve(damping, velocity, duration) { ... }
// ... 26 条曲线的完整数学实现

// PART 2: 曲线工厂 (Line 381-384)
function CurveFactory() { ... }

// PART 3: 表达式生成器 (Line 385-780)
function ExpressionGenerator() {
    this.generate = function(platform, type, params) { ... }
    this.generateRive = function(type, params) { ... }      // 问题 1 在这里
    this.generateAndroid = function(type, params) { ... }
    this.generateIOS = function(type, params) { ... }
    this.generateBezier = function(x1, y1, x2, y2) { ... }
}

// PART 4: 数据模型 (Line 781-787)
function Model() { ... }

// PART 5: 视图模型 (Line 788-820)
function ViewModel(model) { ... }

// PART 6: UI 组件 (Line 821-1169)
function createUI(viewModel) { ... }
function setupRiveTab(tab, viewModel) { ... }
function setupAndroidTab(tab, viewModel) { ... }    // 问题 2 在这里
function setupIOSTab(tab, viewModel) { ... }        // 问题 3 在这里
function applyToKeyframes(viewModel) { ... }
```

---

## 已尝试的修复方法（均失败）

### 尝试 1: Sub-agent 修复
- 使用 `sessions_spawn` 创建 AI sub-agent
- 结果：声称修复完成，但实际问题依然存在
- 原因：Sub-agent 不适合编码任务

### 尝试 2: 直接修改代码
- 手动修改 `factorGroup.visible = true`
- 结果：无效，UI 依然不刷新
- 原因：ScriptUI 需要显式刷新布局

### 尝试 3: 添加 layout.layout(true)
- 在 `onChange` 事件中添加 `paramPanel.layout.layout(true)`
- 结果：无效，参数组依然不显示
- 原因：可能需要多层级刷新或其他刷新方法

### 尝试 4: 添加 layout.resize()
- 在 `onChange` 事件中添加 `paramPanel.layout.resize()` 和 `tab.layout.resize()`
- 结果：无效，问题依然存在
- 原因：可能刷新时机不对，或者需要其他方法

### 尝试 5: 修复 Rive 表达式语法
- 将 `value.at()` 改为 `valueAtTime()`
- 提取变量 `startVal` 和 `endVal`
- 结果：用户报告问题依然存在
- 原因：可能修改位置不对，或者还有其他语法错误

---

## 测试方法

### 环境要求
- **软件：** Adobe After Effects（任意版本）
- **操作系统：** macOS（项目在 Mac 上开发）
- **文件：** `AnimationCurves-standalone.jsx`

### 测试步骤

#### 测试问题 1（Rive Elastic 曲线）

1. 打开 After Effects，创建新合成
2. 创建一个形状图层或任意图层
3. 选中图层的 Position 属性，添加两个关键帧（0s 和 2s）
4. 运行脚本：File > Scripts > Run Script File > 选择 `AnimationCurves-standalone.jsx`
5. 在插件窗口中，切换到 "Rive" 标签页
6. 调整参数：
   - Amplitude: 1.5
   - Period: 0.3
   - Easing Type: Ease Out
7. 选中 Position 属性的关键帧
8. 点击 "Apply to Selected Keyframes" 按钮
9. **期望结果：** 
   - 不报错
   - Position 属性显示表达式图标
   - 播放动画，看到弹性效果
10. **实际结果（修复前）：**
   - AE 报错："表达式中使用了未定义值"
   - 表达式被禁用

#### 测试问题 2（Android Tab 参数切换）

1. 打开插件窗口
2. 切换到 "Android" 标签页
3. 默认选中 "Accelerate" 曲线
4. **检查点 1：** 应该看到 "Factor" 参数滑块（0.1-3.0）
5. 切换到 "Anticipate" 曲线
6. **检查点 2：** 应该看到 "Tension" 参数滑块（0.0-5.0），"Factor" 参数应该隐藏
7. 切换到 "Overshoot" 曲线
8. **检查点 3：** 应该看到 "Tension" 参数滑块，"Factor" 参数应该隐藏
9. 切换到 "Bounce" 曲线
10. **检查点 4：** 所有参数都应该隐藏
11. **实际结果（修复前）：**
    - 只能看到 "Factor" 参数
    - 切换曲线时，"Tension" 参数不显示
    - 参数组不会动态切换

#### 测试问题 3（iOS Tab 参数面板）

1. 打开插件窗口
2. 切换到 "iOS" 标签页
3. 默认选中 "Ease In-Out" 曲线
4. **检查点 1：** 参数面板应该隐藏（正确）
5. 切换到 "Spring Default" 曲线
6. **检查点 2：** 应该看到 "Spring Parameters" 面板，包含三个参数：
   - Damping: 0.7 (0.1-1.0)
   - Velocity: 0.0 (0.0-3.0)
   - Duration: 0.5 (0.1-2.0)
7. 切换到 "Spring Gentle" 曲线
8. **检查点 3：** 参数面板应该显示（Damping 默认 0.9）
9. 切换到 "Spring Bouncy" 曲线
10. **检查点 4：** 参数面板应该显示（Damping 默认 0.5, Velocity 默认 1.0）
11. 切换回 "Linear" 曲线
12. **检查点 5：** 参数面板应该隐藏
13. **实际结果（修复前）：**
    - 参数面板始终不显示
    - 即使选择 Spring 曲线，也看不到任何参数

---

## 技术约束

### ExtendScript 限制
- **版本：** ExtendScript (JavaScript 1.5 + AE 扩展)
- **不支持：** ES6+ 语法（箭头函数、let/const、模板字符串等）
- **UI 框架：** ScriptUI（Adobe 专有，非标准 DOM）
- **布局刷新：** 需要显式调用 `layout.layout()` 或 `layout.resize()`

### ScriptUI 布局刷新机制
- 设置 `visible` 属性后，UI 不会自动刷新
- 可能需要的刷新方法：
  - `element.layout.layout(true)` - 重新计算布局
  - `element.layout.resize()` - 调整大小
  - `window.layout.layout(true)` - 刷新整个窗口
  - `element.parent.layout.layout(true)` - 刷新父容器
- 刷新时机：在设置 `visible` 之后立即调用

### AE 表达式语法
- **正确：** `valueAtTime(time)`
- **错误：** `value.at(time)` （不存在此方法）
- **正确：** `linear(t, tMin, tMax, value1, value2)`
- **变量声明：** 必须使用 `var` 关键字

---

## 期望的最终结果

### 功能完整性
- ✅ 所有 26 条曲线的数学实现完整且正确
- ✅ Rive Elastic 曲线能正常应用到关键帧，不报错
- ✅ Android tab 参数切换流畅，显示正确
- ✅ iOS tab 参数面板正确显示/隐藏
- ✅ 用户可以调整参数，实时更新曲线效果

### 代码质量
- ✅ 单文件实现，无外部依赖
- ✅ 代码结构清晰，注释完整
- ✅ 符合 ExtendScript 语法规范
- ✅ 通过所有测试用例

### 用户体验
- ✅ 窗口打开流畅，无卡顿
- ✅ 参数切换即时响应
- ✅ 错误提示清晰（如果有）
- ✅ 应用曲线后，动画效果符合预期

---

## 参考资料

### 项目文件
- **主文件：** `/Users/liuhuihuan/Documents/RiveElasticCurve/AnimationCurves-standalone.jsx`
- **测试脚本：** `/Users/liuhuihuan/Documents/RiveElasticCurve/test-all-curves.jsx`
- **用户文档：** `/Users/liuhuihuan/Documents/RiveElasticCurve/USER_GUIDE.md`

### Git 仓库
- **URL：** https://github.com/jadon7/ae-rive-elastic-curve.git
- **分支：** main
- **最新 commit：** 559b2f9 (fix: 修复 AnimationCurves-standalone.jsx 三个严重 bug)

### 技术文档
- **ExtendScript Toolkit：** Adobe 官方文档
- **ScriptUI：** Adobe ScriptUI 开发指南
- **AE 表达式：** After Effects 表达式语言参考

### 曲线参考
- **Rive Elastic：** https://rive.app/community/doc/elastic-interpolator/docvT3FMxJSP
- **Android Interpolators：** https://developer.android.com/reference/android/view/animation/Interpolator
- **iOS UIView.animate：** https://developer.apple.com/documentation/uikit/uiview/1622515-animate

---

## 联系方式

**项目负责人：** Jadon (刘慧欢)  
**Telegram：** @Siaoj7  
**项目路径：** `/Users/liuhuihuan/Documents/RiveElasticCurve/`  
**Mac 设备：** 刘慧欢的Mac mini (可远程访问)

---

## 附录：关键代码片段

### A. Rive Elastic 表达式生成（问题 1 相关）

```javascript
// 当前代码（有问题）- 约 line 407-438
this.generateRive = function(type, params) {
    if (type === 'elastic') {
        var code = '';
        code += 'var amp = ' + params.amplitude + ';\n';
        code += 'var per = ' + params.period + ';\n';
        code += 'var t = (time - inPoint) / (outPoint - inPoint);\n';
        // ... 数学实现 ...
        code += '\nlinear(val, 0, 1, value.at(inPoint), value.at(outPoint));';  // ❌ 错误
        return code;
    }
    return 'linear(time, inPoint, outPoint, value.at(inPoint), value.at(outPoint));';  // ❌ 错误
};
```

**需要修复：**
- 将 `value.at(inPoint)` 改为 `valueAtTime(inPoint)`
- 将 `value.at(outPoint)` 改为 `valueAtTime(outPoint)`
- 确保完整的 Elastic 数学实现被保留

### B. Android Tab 参数切换（问题 2 相关）

```javascript
// 当前代码（有问题）- 约 line 978-995
curveDropdown.onChange = function() {
    var type = curveMap[curveDropdown.selection.index];
    viewModel.setCurveType(type);
    factorGroup.visible = (type === 'accelerate' || type === 'decelerate');
    tensionGroup.visible = (type === 'anticipate' || type === 'overshoot' || type === 'anticipateOvershoot');
    // ❌ 缺少布局刷新
};

// 初始化代码
var initialType = curveMap[curveDropdown.selection.index];
viewModel.setCurveType(initialType);
factorGroup.visible = (initialType === 'accelerate' || initialType === 'decelerate');
tensionGroup.visible = (initialType === 'anticipate' || initialType === 'overshoot' || initialType === 'anticipateOvershoot');
// ❌ 缺少布局刷新
```

**需要修复：**
- 在设置 `visible` 后添加布局刷新代码
- 可能需要刷新 `paramPanel`、`tab` 或 `window`

### C. iOS Tab 参数面板（问题 3 相关）

```javascript
// 当前代码（有问题）- 约 line 1018, 1063-1071
var paramPanel = tab.add('panel', undefined, 'Spring Parameters');
// ...
paramPanel.visible = false;  // 初始隐藏

// onChange 事件
curveDropdown.onChange = function() {
    var type = curveMap[curveDropdown.selection.index];
    viewModel.setCurveType(type);
    paramPanel.visible = (type === 'springCustom');  // ❌ 逻辑错误，应该包含所有 Spring 曲线
    // ❌ 缺少布局刷新
};

// 初始化代码
var initialType = curveMap[curveDropdown.selection.index];
viewModel.setCurveType(initialType);
paramPanel.visible = (initialType === 'springCustom');  // ❌ 逻辑错误
// ❌ 缺少布局刷新
```

**需要修复：**
- 修改 `visible` 逻辑，包含所有 Spring 曲线：
  ```javascript
  paramPanel.visible = (type === 'springDefault' || type === 'springGentle' || 
                        type === 'springBouncy' || type === 'springCustom');
  ```
- 在设置 `visible` 后添加布局刷新代码

---

## 总结

这是一个功能完整但存在三个严重 bug 的 After Effects 插件项目。所有数学实现都已完成，问题集中在：
1. AE 表达式语法错误
2. ScriptUI 布局刷新机制

修复这些问题需要：
- 熟悉 ExtendScript 和 ScriptUI
- 理解 After Effects 表达式语法
- 掌握 ScriptUI 的布局刷新机制

预计修复时间：1-2 小时（对熟悉 ExtendScript 的开发者）

---

**文档版本：** 1.0  
**创建日期：** 2026-02-20  
**最后更新：** 2026-02-20
