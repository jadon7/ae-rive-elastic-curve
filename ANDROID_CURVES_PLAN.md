# Android + iOS 曲线接入计划

## 目标
将 Android 和 iOS 系统的各种缓动曲线集成到插件中，提供跨平台的动画曲线选择。

## 曲线清单

### Rive (1 种)
- Elastic

### Android (11 种)
**基础曲线：**
- Linear, Accelerate, Decelerate, AccelerateDecelerate

**物理曲线：**
- Anticipate, Overshoot, AnticipateOvershoot, Bounce

**Material Design：**
- FastOutSlowIn, FastOutLinearIn, LinearOutSlowIn

### iOS (14 种)
**UIView.animate 标准：**
- Linear, EaseIn, EaseOut, EaseInOut

**UIView.animate Spring：**
- Spring Default, Spring Gentle, Spring Bouncy, Spring Custom

**CAMediaTimingFunction：**
- Default, EaseIn, EaseOut, EaseInEaseOut, Linear

**总计：26 种曲线**

## 实施计划

### 阶段 1：架构重构（1-2 天）

**目标：** 将现有单一曲线扩展为支持三平台多曲线的架构

**任务：**
1. 重构为三标签页 UI 架构
   - Rive 标签
   - Android 标签
   - iOS 标签
   
2. 创建曲线工厂模式
   ```javascript
   function CurveFactory() {
       this.createCurve = function(platform, type, params) {
           switch(platform) {
               case 'rive':
                   return new RiveElasticCurve(params);
               case 'android':
                   return createAndroidCurve(type, params);
               case 'ios':
                   return createIOSCurve(type, params);
           }
       };
   }
   ```

3. 更新 UI 架构
   - 标签页切换逻辑
   - 每个标签页独立的曲线下拉菜单
   - 动态参数面板（根据选中曲线显示/隐藏参数）
   - 统一的曲线预览区域

**输出：**
- 三标签页 UI 框架
- 向后兼容现有的 Elastic 曲线

---

### 阶段 2：曲线数学实现（3-4 天）

**目标：** 实现 Android 和 iOS 各种曲线的数学公式

**任务：**

**Day 1-2: Android 曲线**
1. 研究 Android 源码，提取插值器公式
   - 参考：`android.view.animation` 包
   - 文档：https://developer.android.com/reference/android/view/animation/Interpolator

2. 实现基础曲线（优先级高）
   ```javascript
   function AndroidAccelerateInterpolator(factor) {
       this.getValue = function(t) {
           return factor === 1.0 ? t * t : Math.pow(t, 2 * factor);
       };
   }
   ```

3. 实现物理曲线（优先级中）
   - Bounce: 多次弹跳衰减算法
   - Anticipate/Overshoot: 张力参数

4. 实现 Material Design 曲线（优先级高）
   - 三次贝塞尔曲线，需要实现贝塞尔求解器

**Day 3: iOS 标准曲线**
1. UIView.animate 标准曲线
   - Linear: `t`
   - EaseIn: `t^2`
   - EaseOut: `1 - (1-t)^2`
   - EaseInOut: 分段函数

2. CAMediaTimingFunction
   - 基于贝塞尔控制点实现
   - 复用 Material Design 的贝塞尔求解器

**Day 4: iOS Spring 动画**
1. 实现阻尼谐振子方程
   ```javascript
   function IOSSpringCurve(damping, velocity, duration) {
       this.getValue = function(t) {
           var zeta = damping;
           var omega = 2 * Math.PI / duration;
           var omegaD = omega * Math.sqrt(1 - zeta * zeta);
           
           return 1 - Math.exp(-zeta * omega * t) * 
                  (Math.cos(omegaD * t) + 
                   (zeta * omega / omegaD) * Math.sin(omegaD * t));
       };
   }
   ```

2. 实现三个预设（Default, Gentle, Bouncy）

**输出：**
- 每种曲线的独立实现
- 单元测试（验证关键点的值）

---

### 阶段 3：UI 集成（2 天）

**目标：** 实现三标签页 UI 和动态参数面板

**任务：**
1. 实现标签页切换
   ```javascript
   // 标签页结构
   [Rive] [Android] [iOS]
   
   // 每个标签页包含：
   - 曲线下拉菜单（该平台的所有曲线）
   - 动态参数面板
   - 共享的曲线预览区域
   ```

2. Rive 标签页
   - 曲线：Elastic
   - 参数：amplitude, period, easingType

3. Android 标签页
   - 曲线：11 种（见曲线清单）
   - 参数：根据曲线类型动态显示

4. iOS 标签页
   - 曲线：14 种（见曲线清单）
   - 参数：Spring Custom 需要 3 个参数，其他无参数或预设

5. 实现动态参数面板
   - 参数控件池（预创建所有参数类型）
   - 根据选中曲线显示/隐藏对应参数
   - 参数验证和范围限制

6. 更新曲线预览
   - 支持所有 26 种曲线的绘制
   - 标签页切换时更新预览
   - 参数改变时实时更新

**输出：**
- 完整的三标签页 UI
- 所有曲线的实时预览

---

### 阶段 4：表达式生成器更新（1 天）

**目标：** 为每种曲线生成正确的 AE 表达式

**任务：**
1. 更新 `ExpressionGenerator`
   - 为每种曲线类型生成对应的表达式代码
   - 确保表达式在 AE 中可执行

2. 优化表达式性能
   - 避免重复计算
   - 使用 AE 内置函数（如 ease()）作为基础

3. 添加表达式注释
   - 说明曲线类型和参数
   - 便于用户理解和修改

**输出：**
- 每种曲线的表达式模板
- 表达式测试用例

---

### 阶段 5：测试与优化（1-2 天）

**目标：** 确保所有曲线在 AE 中正确工作

**任务：**
1. 创建测试合成
   - 为每种曲线创建测试动画
   - 对比 Android 原生效果（如果可能）

2. 性能测试
   - 测试复杂表达式对 AE 性能的影响
   - 优化计算密集型曲线

3. 边界情况测试
   - 极端参数值
   - 多关键帧场景
   - 不同属性类型（位置、缩放、旋转等）

4. 用户体验优化
   - 添加曲线预设（常用参数组合）
   - 添加曲线对比功能（同时显示多条曲线）

**输出：**
- 测试报告
- 性能优化建议
- Bug 修复

---

### 阶段 6：文档与发布（1 天）

**目标：** 完善文档，准备发布

**任务：**
1. 更新 README.md
   - 添加所有曲线的说明和示例
   - 添加参数说明和推荐值

2. 创建使用教程
   - 每种曲线的适用场景
   - 参数调整技巧
   - 与 Android 开发的对应关系

3. 创建 CHANGELOG.md
   - 详细记录版本变更

4. 准备发布
   - 版本号：v2.0.0（重大更新）
   - 打包发布文件
   - 准备演示视频

**输出：**
- 完整文档
- 发布包
- 演示材料

---

## 技术难点与解决方案

### 难点 1：贝塞尔曲线求解
**问题：** Material Design 曲线基于三次贝塞尔，需要从 t 反推曲线值

**解决方案：**
- 使用二分查找或牛顿迭代法求解
- 参考 CSS cubic-bezier 的实现
- 可能需要预计算查找表以提高性能

### 难点 2：表达式代码大小
**问题：** 复杂曲线的表达式可能很长，影响 AE 性能

**解决方案：**
- 简化数学公式
- 使用 AE 内置函数
- 考虑将复杂计算拆分到多个属性

### 难点 3：曲线参数映射
**问题：** Android 参数与 AE 表达式的映射关系

**解决方案：**
- 创建参数转换层
- 提供参数预设
- 添加参数说明和范围限制

---

## 资源需求

### 开发资源
- 开发时间：约 8-12 天
- 测试时间：约 2-3 天

### 参考资料
1. **Android 官方文档**
   - https://developer.android.com/reference/android/view/animation/Interpolator
   
2. **Android 源码**
   - https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/android/view/animation/

3. **Material Design 动画指南**
   - https://m3.material.io/styles/motion/easing-and-duration/tokens-specs

4. **iOS 官方文档**
   - UIView.animate: https://developer.apple.com/documentation/uikit/uiview/1622515-animate
   - CAMediaTimingFunction: https://developer.apple.com/documentation/quartzcore/camediatimingfunction

5. **iOS 动画指南**
   - https://developer.apple.com/design/human-interface-guidelines/motion

6. **通用资源**
   - CSS Easing Functions: https://easings.net/
   - Cubic Bezier: https://cubic-bezier.com/

### 工具
- AE 脚本调试工具
- 曲线可视化工具（用于对比）
- Android 模拟器（用于参考）

---

## 风险评估

### 高风险
- ❌ 无

### 中风险
- ⚠️ 贝塞尔求解器性能问题
  - 缓解：使用查找表或简化算法
  
- ⚠️ 表达式在旧版 AE 中的兼容性
  - 缓解：测试多个 AE 版本，提供降级方案

### 低风险
- ℹ️ UI 复杂度增加导致的可用性问题
  - 缓解：提供预设和简化模式

---

## 成功标准

1. ✅ 实现 26 种曲线（Rive 1 + Android 11 + iOS 14）
2. ✅ 三标签页 UI，切换流畅
3. ✅ 所有曲线都有实时预览
4. ✅ 表达式在 AE 中正确执行
5. ✅ 性能无明显下降（相比 v1.1.0）
6. ✅ 完整的文档和示例
7. ✅ 向后兼容现有的 Elastic 曲线

---

## 后续扩展

### 可选功能（v2.1+）
1. 自定义贝塞尔曲线编辑器
2. 曲线预设库（保存/加载用户自定义参数）
3. 曲线对比模式（同时显示多条曲线）
4. 导入 CSS easing functions
5. 曲线动画预览（不需要应用到属性）
6. 跨平台曲线转换（例如：Android → iOS 等效曲线）

---

## 时间线（预估）

```
Week 1:
├─ Day 1-2: 阶段 1 - 架构重构（三标签页）
├─ Day 3-4: 阶段 2 - Android 曲线实现
└─ Day 5: 阶段 2 - iOS 标准曲线实现

Week 2:
├─ Day 6: 阶段 2 - iOS Spring 动画实现
├─ Day 7-8: 阶段 3 - UI 集成
├─ Day 9: 阶段 4 - 表达式生成器
└─ Day 10-11: 阶段 5 - 测试与优化

Week 3:
├─ Day 12-13: 阶段 5 - 继续测试优化
└─ Day 14: 阶段 6 - 文档与发布
```

**总计：约 3 周（14-16 个工作日）**

---

## 下一步行动

等待你的确认后，我将：
1. 开始阶段 1 的架构重构
2. 创建开发分支 `feature/android-curves`
3. 建立测试环境
4. 开始实施计划

**需要你确认的问题：**
1. 是否同意三标签页方案（Rive + Android + iOS）？
2. iOS 曲线清单是否完整？需要增减吗？
3. 优先级：是否需要调整某些曲线的优先级？
4. 时间线：3 周的时间是否合适？
5. 是否需要我先做一个 POC（概念验证）来验证技术可行性？

**特别说明：**
- iOS Spring 动画的数学实现较复杂，可能需要额外调试时间
- 贝塞尔求解器是共享的，Material Design 和 CAMediaTimingFunction 都会用到
- 三标签页会增加 UI 复杂度，但分类更清晰
