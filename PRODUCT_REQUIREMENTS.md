# AnimationCurves - After Effects 跨平台动画曲线插件
## 产品需求文档 (PRD)

**版本：** 1.0  
**创建日期：** 2026-02-20  
**项目类型：** Adobe After Effects 脚本插件  
**开发语言：** ExtendScript (JavaScript 1.5)  
**交付形式：** 单文件 .jsx 脚本

---

## 1. 产品概述

### 1.1 产品定位

创建一个 After Effects 脚本插件，让用户能够将来自不同平台（Rive、Android、iOS）的动画曲线应用到 AE 关键帧上，实现跨平台动画效果的精确还原。

### 1.2 目标用户

- 动效设计师（需要在 AE 中还原移动端动画效果）
- UI/UX 设计师（需要制作高保真动效原型）
- 前端开发者（需要预览移动端动画效果）
- 动画师（需要使用特定的缓动曲线）

### 1.3 核心价值

- **跨平台一致性：** 在 AE 中精确还原 Rive、Android、iOS 的动画曲线
- **参数可调：** 支持实时调整曲线参数，快速迭代
- **易用性：** 单文件安装，图形化界面，无需编写代码
- **完整性：** 覆盖三大平台的所有主流动画曲线（26 条）

---

## 2. 功能需求

### 2.1 支持的动画曲线

#### 2.1.1 Rive 平台（1 条曲线）

| 曲线名称 | 参数 | 说明 |
|---------|------|------|
| Elastic | Amplitude (振幅)<br>Period (周期)<br>Easing Type (缓动类型) | 弹性动画效果，模拟弹簧振荡<br>Easing Type: Ease In / Ease Out / Ease In-Out |

**数学实现：**
```
基于正弦波衰减的弹性函数
使用 Math.sin, Math.cos, Math.asin, Math.pow
```

#### 2.1.2 Android 平台（11 条曲线）

| 曲线名称 | 参数 | 说明 |
|---------|------|------|
| Linear | 无 | 线性插值，匀速运动 |
| Accelerate | Factor (加速因子, 0.1-3.0) | 加速曲线，开始慢后来快 |
| Decelerate | Factor (减速因子, 0.1-3.0) | 减速曲线，开始快后来慢 |
| AccelerateDecelerate | 无 | 先加速后减速 |
| Anticipate | Tension (张力, 0.0-5.0) | 预期动画，先后退再前进 |
| Overshoot | Tension (张力, 0.0-5.0) | 超冲动画，超过目标后回弹 |
| AnticipateOvershoot | Tension (张力, 0.0-5.0) | 结合 Anticipate 和 Overshoot |
| Bounce | 无 | 弹跳效果，模拟球落地 |
| FastOutSlowIn | 无 | Material Design 标准曲线 |
| FastOutLinearIn | 无 | Material Design 曲线 |
| LinearOutSlowIn | 无 | Material Design 曲线 |

**数学实现：**
- Accelerate/Decelerate: 幂函数
- Anticipate/Overshoot: 三次多项式
- Bounce: 分段函数
- Material Design 曲线: 三次贝塞尔曲线

#### 2.1.3 iOS 平台（14 条曲线）

| 曲线名称 | 参数 | 说明 |
|---------|------|------|
| Linear | 无 | 线性插值 |
| EaseIn | 无 | UIView.animate 标准缓入 |
| EaseOut | 无 | UIView.animate 标准缓出 |
| EaseInOut | 无 | UIView.animate 标准缓入缓出 |
| Spring Default | Damping (阻尼, 0.1-1.0)<br>Velocity (初速度, 0.0-3.0)<br>Duration (持续时间, 0.1-2.0) | 默认弹簧效果 |
| Spring Gentle | 同上 | 柔和弹簧效果（阻尼 0.9） |
| Spring Bouncy | 同上 | 弹跳弹簧效果（阻尼 0.5） |
| Spring Custom | 同上 | 自定义弹簧参数 |
| CA Default | 无 | CAMediaTiming 默认曲线 |
| CA EaseIn | 无 | CAMediaTiming 缓入 |
| CA EaseOut | 无 | CAMediaTiming 缓出 |
| CA EaseInEaseOut | 无 | CAMediaTiming 缓入缓出 |
| CA Linear | 无 | CAMediaTiming 线性 |

**数学实现：**
- Ease 系列: 二次/三次多项式
- Spring 系列: 阻尼振荡微分方程
- CA 系列: 三次贝塞尔曲线

### 2.2 用户界面

#### 2.2.1 窗口设计

**窗口类型：** Palette（浮动面板）
- 非模态窗口，不阻塞 AE 操作
- 可以在应用曲线时保持打开状态
- 支持关闭按钮

**窗口尺寸：**
- 宽度：320px
- 高度：480px（标签页区域）+ 150px（预览区域）+ 30px（按钮）= 660px

**窗口标题：** "Animation Curves v2.0"

#### 2.2.2 布局结构

```
┌─────────────────────────────────────┐
│  Animation Curves v2.0         [×]  │
├─────────────────────────────────────┤
│  ┌───┬─────────┬─────┐              │
│  │Rive│Android│ iOS │              │  ← 标签页
│  └───┴─────────┴─────┘              │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  曲线选择下拉菜单            │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │  Parameters         │   │   │  ← 参数面板
│  │  │  ┌───────────────┐  │   │   │
│  │  │  │ 参数 1        │  │   │   │
│  │  │  │ 参数 2        │  │   │   │
│  │  │  │ 参数 3        │  │   │   │
│  │  │  └───────────────┘  │   │   │
│  │  └─────────────────────┘   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Curve Preview              │   │  ← 预览区域
│  │  (文本信息显示)              │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Apply to Selected Keyframes │   │  ← 应用按钮
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 2.2.3 交互设计

**标签页切换：**
- 点击标签页切换平台（Rive / Android / iOS）
- 切换时保留当前平台的参数设置
- 预览区域更新显示当前平台和曲线信息

**曲线选择：**
- 下拉菜单显示当前平台的所有曲线
- 选择曲线后，参数面板动态显示对应参数
- 无参数的曲线隐藏参数面板

**参数调整：**
- 每个参数包含：标签 + 滑块 + 数值输入框
- 滑块拖动时，数值输入框实时更新
- 数值输入框修改时，滑块位置同步更新
- 参数变化时，预览区域更新（显示参数值）

**应用曲线：**
- 用户在 AE 时间线中选中属性的关键帧
- 点击 "Apply to Selected Keyframes" 按钮
- 插件生成 AE 表达式并应用到选中的属性
- 显示成功提示："Applied curve to X properties"

### 2.3 核心功能

#### 2.3.1 曲线数学实现

**要求：**
- 每条曲线必须有独立的数学函数实现
- 输入：归一化时间 t (0.0 - 1.0)
- 输出：归一化值 (0.0 - 1.0)
- 精确还原各平台的官方实现

**示例（Rive Elastic）：**
```javascript
function RiveElasticCurve(amplitude, period, easingType) {
    this.getValue = function(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        
        var p = period;
        var a = Math.max(amplitude, 1.0);  // 确保 >= 1.0
        var s = p / (2 * Math.PI) * Math.asin(1 / a);
        
        if (easingType === 'easeOut') {
            return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
        } else if (easingType === 'easeIn') {
            return -(a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));
        } else { // easeInOut
            t *= 2;
            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));
            }
            return a * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
        }
    };
}
```

#### 2.3.2 AE 表达式生成

**要求：**
- 根据选中的曲线和参数，生成完整的 AE 表达式代码
- 表达式必须符合 AE 语法规范
- 支持任意属性类型（位置、缩放、旋转、不透明度等）
- 自动处理关键帧时间和值

**表达式结构：**
```javascript
// 平台 - 曲线类型
// 参数: param1=value1, param2=value2

var t = (time - inPoint) / (outPoint - inPoint);
if (t <= 0) t = 0;
if (t >= 1) t = 1;

var val;

// 曲线数学实现
// ...

var startVal = valueAtTime(inPoint);
var endVal = valueAtTime(outPoint);
linear(val, 0, 1, startVal, endVal);
```

**关键点：**
- 使用 `valueAtTime()` 而不是 `value.at()`（AE 不支持）
- 使用 `linear()` 函数映射曲线值到实际关键帧值
- 添加注释说明曲线类型和参数

#### 2.3.3 关键帧应用

**流程：**
1. 检查用户是否选中了合成
2. 遍历选中的图层
3. 递归查找选中的属性（支持嵌套属性组）
4. 过滤出可以设置表达式且有关键帧的属性
5. 为每个属性启用表达式并设置生成的代码
6. 显示成功提示

**错误处理：**
- 未选中合成 → 提示 "Please select a composition"
- 未选中属性 → 提示 "Please select properties with keyframes"
- 表达式错误 → 显示具体错误信息

---

## 3. 技术规范

### 3.1 开发环境

**语言：** ExtendScript (JavaScript 1.5)
- 不支持 ES6+ 语法（箭头函数、let/const、模板字符串等）
- 必须使用 `var` 声明变量
- 必须使用 `function` 关键字定义函数

**UI 框架：** ScriptUI
- Adobe 专有的 UI 框架
- 不是标准 DOM，API 不同
- 布局需要显式刷新

**运行环境：** Adobe After Effects
- 支持 AE CC 2015 及以上版本
- 通过 File > Scripts > Run Script File 运行

### 3.2 代码架构

**文件结构：** 单文件实现（.jsx）

**模块划分：**
```javascript
(function() {
    'use strict';
    
    // PART 1: 曲线数学实现 (Curve Mathematics)
    // - 26 个曲线构造函数
    // - 每个函数包含 getValue(t) 方法
    
    // PART 2: 曲线工厂 (Curve Factory)
    // - createCurve(platform, type, params) 方法
    // - 根据平台和类型创建对应的曲线实例
    
    // PART 3: 表达式生成器 (Expression Generator)
    // - generate(platform, type, params) 方法
    // - generateRive(type, params)
    // - generateAndroid(type, params)
    // - generateIOS(type, params)
    // - generateBezier(x1, y1, x2, y2) 辅助方法
    
    // PART 4: 数据模型 (Model)
    // - 存储当前选择的平台、曲线类型、参数
    // - setPlatform(platform)
    // - setCurveType(type)
    // - setParam(name, value)
    // - getParams()
    
    // PART 5: 视图模型 (ViewModel)
    // - 连接 Model 和 UI
    // - 调用 CurveFactory 和 ExpressionGenerator
    // - generateExpression() 方法
    
    // PART 6: UI 组件 (UI Components)
    // - createUI(viewModel) 创建主窗口
    // - setupRiveTab(tab, viewModel)
    // - setupAndroidTab(tab, viewModel)
    // - setupIOSTab(tab, viewModel)
    // - applyToKeyframes(viewModel) 应用到关键帧
    
    // 主入口
    var model = new Model();
    var viewModel = new ViewModel(model);
    var ui = createUI(viewModel);
    ui.show();
})();
```

### 3.3 ScriptUI 布局刷新

**问题：** 设置 `element.visible` 后，UI 不会自动刷新

**解决方案：**
```javascript
// 方法 1: 刷新元素布局
element.layout.layout(true);

// 方法 2: 调整元素大小
element.layout.resize();

// 方法 3: 刷新父容器
element.parent.layout.layout(true);

// 方法 4: 刷新整个窗口
window.layout.layout(true);

// 推荐：多层级刷新
paramPanel.layout.layout(true);
paramPanel.layout.resize();
tab.layout.layout(true);
tab.layout.resize();
```

**最佳实践：**
- 在设置 `visible` 后立即调用刷新方法
- 使用多层级刷新确保 UI 正确更新
- 在 `onChange` 事件中刷新布局

### 3.4 AE 表达式语法

**正确的方法：**
```javascript
valueAtTime(time)           // 获取指定时间的值
linear(t, tMin, tMax, v1, v2)  // 线性映射
ease(t, tMin, tMax, v1, v2)    // 缓动映射
```

**错误的方法：**
```javascript
value.at(time)              // ❌ 不存在此方法
value[time]                 // ❌ 不支持此语法
```

**变量声明：**
```javascript
var t = 0.5;                // ✅ 正确
let t = 0.5;                // ❌ 不支持 ES6
const t = 0.5;              // ❌ 不支持 ES6
```

---

## 4. 用户体验

### 4.1 性能要求

- 窗口打开时间 < 1 秒
- 参数调整响应时间 < 100ms
- 应用曲线到 100 个关键帧 < 2 秒

### 4.2 易用性

- 无需安装，直接运行 .jsx 文件
- 界面清晰，操作直观
- 参数有合理的默认值
- 错误提示清晰易懂

### 4.3 兼容性

- 支持 AE CC 2015 及以上版本
- 支持 macOS 和 Windows
- 支持所有属性类型（1D, 2D, 3D, Color）

---

## 5. 测试要求

### 5.1 功能测试

**测试用例 1: Rive Elastic 曲线**
1. 创建合成，添加形状图层
2. 为 Position 属性添加两个关键帧
3. 运行插件，选择 Rive > Elastic
4. 调整参数：Amplitude=1.5, Period=0.3, Easing=Ease Out
5. 选中关键帧，点击 Apply
6. 验证：表达式正确应用，动画显示弹性效果

**测试用例 2: Android 参数切换**
1. 打开插件，切换到 Android 标签页
2. 选择 Accelerate 曲线
3. 验证：显示 Factor 参数
4. 选择 Anticipate 曲线
5. 验证：Factor 参数隐藏，Tension 参数显示
6. 选择 Bounce 曲线
7. 验证：所有参数隐藏

**测试用例 3: iOS Spring 曲线**
1. 打开插件，切换到 iOS 标签页
2. 选择 Spring Default 曲线
3. 验证：显示 Damping/Velocity/Duration 参数
4. 调整参数并应用到关键帧
5. 验证：动画显示弹簧效果

### 5.2 边界测试

- 参数极值测试（最小值、最大值）
- 无关键帧时应用曲线
- 未选中属性时应用曲线
- 选中多个属性同时应用
- 选中不同类型的属性（Position, Scale, Rotation, Opacity）

### 5.3 兼容性测试

- AE CC 2015, 2017, 2019, 2020, 2021, 2022, 2023, 2024
- macOS 10.14+
- Windows 10+

---

## 6. 交付标准

### 6.1 代码质量

- ✅ 单文件实现，无外部依赖
- ✅ 代码结构清晰，模块划分合理
- ✅ 每个函数有注释说明
- ✅ 变量命名规范，易于理解
- ✅ 符合 ExtendScript 语法规范

### 6.2 功能完整性

- ✅ 支持 26 条曲线，数学实现正确
- ✅ 所有曲线都能正常应用到关键帧
- ✅ 参数调整流畅，UI 响应及时
- ✅ 错误处理完善，提示清晰

### 6.3 文档

- ✅ 用户使用文档（USER_GUIDE.md）
- ✅ 实战案例文档（EXAMPLES.md）
- ✅ 代码注释完整
- ✅ README.md 说明安装和使用方法

---

## 7. 参考资料

### 7.1 曲线参考

**Rive Elastic：**
- 官方文档：https://rive.app/community/doc/elastic-interpolator/docvT3FMxJSP
- 数学原理：基于正弦波衰减的弹性函数

**Android Interpolators：**
- 官方文档：https://developer.android.com/reference/android/view/animation/Interpolator
- 源码参考：Android SDK 中的 Interpolator 实现

**iOS UIView.animate：**
- 官方文档：https://developer.apple.com/documentation/uikit/uiview/1622515-animate
- Spring 动画：https://developer.apple.com/documentation/uikit/uiview/1622594-animate

### 7.2 技术文档

**ExtendScript：**
- Adobe ExtendScript Toolkit 文档
- JavaScript 1.5 语法参考

**ScriptUI：**
- Adobe ScriptUI 开发指南
- ScriptUI 布局和事件处理

**AE 表达式：**
- After Effects 表达式语言参考
- 表达式示例和最佳实践

---

## 8. 项目信息

**项目名称：** AnimationCurves  
**版本：** v2.0.0  
**开发周期：** 预计 2-3 天（对熟悉 ExtendScript 的开发者）  
**交付形式：** 单个 .jsx 文件  
**文件大小：** 预计 40-50KB  
**代码行数：** 预计 1000-1200 行  

**Git 仓库：** https://github.com/jadon7/ae-rive-elastic-curve.git  
**项目路径：** `/Users/liuhuihuan/Documents/RiveElasticCurve/`  

---

## 9. 成功标准

### 9.1 必须满足

- ✅ 所有 26 条曲线都能正常工作
- ✅ UI 参数切换流畅，无卡顿
- ✅ 应用到关键帧后，AE 不报错
- ✅ 动画效果符合各平台的官方实现

### 9.2 期望达到

- ✅ 代码结构清晰，易于维护
- ✅ 用户体验流畅，操作直观
- ✅ 文档完整，易于理解
- ✅ 兼容主流 AE 版本

### 9.3 加分项

- ✅ 支持曲线预览（图形化显示）
- ✅ 支持自定义曲线
- ✅ 支持曲线预设保存/加载
- ✅ 支持批量应用到多个图层

---

**文档版本：** 1.0  
**创建日期：** 2026-02-20  
**最后更新：** 2026-02-20  
**负责人：** Jadon (刘慧欢)
