# 曲线参数映射表

## Rive

### Elastic
- **amplitude** (振幅): 0.1 - 10.0, 默认 1.0
- **period** (周期): 0.1 - 5.0, 默认 0.5
- **easingType** (类型): easeIn | easeOut | easeInOut, 默认 easeOut

---

## Android

### 基础曲线

#### Linear
- 无参数

#### Accelerate
- **factor** (因子): 0.1 - 3.0, 默认 1.0

#### Decelerate
- **factor** (因子): 0.1 - 3.0, 默认 1.0

#### AccelerateDecelerate
- 无参数

### 物理曲线

#### Anticipate
- **tension** (张力): 0.0 - 5.0, 默认 2.0

#### Overshoot
- **tension** (张力): 0.0 - 5.0, 默认 2.0

#### AnticipateOvershoot
- **tension** (张力): 0.0 - 5.0, 默认 2.0

#### Bounce
- 无参数

### Material Design

#### FastOutSlowIn
- 无参数
- 贝塞尔: (0.4, 0.0, 0.2, 1.0)

#### FastOutLinearIn
- 无参数
- 贝塞尔: (0.4, 0.0, 1.0, 1.0)

#### LinearOutSlowIn
- 无参数
- 贝塞尔: (0.0, 0.0, 0.2, 1.0)

---

## iOS

### UIView.animate 标准曲线

#### Linear
- 无参数

#### EaseIn
- 无参数

#### EaseOut
- 无参数

#### EaseInOut
- 无参数

### UIView.animate Spring

#### Spring Default
- 无参数
- 内部使用: damping=0.7, velocity=0.0

#### Spring Gentle
- 无参数
- 内部使用: damping=0.9, velocity=0.0

#### Spring Bouncy
- 无参数
- 内部使用: damping=0.5, velocity=1.0

#### Spring Custom
- **damping** (阻尼): 0.1 - 1.0, 默认 0.7
- **velocity** (初速度): 0.0 - 3.0, 默认 0.0
- **duration** (持续时间): 0.1 - 2.0, 默认 0.5

### CAMediaTimingFunction

#### Default
- 无参数
- 贝塞尔: (0.25, 0.1, 0.25, 1.0)

#### EaseIn
- 无参数
- 贝塞尔: (0.42, 0.0, 1.0, 1.0)

#### EaseOut
- 无参数
- 贝塞尔: (0.0, 0.0, 0.58, 1.0)

#### EaseInEaseOut
- 无参数
- 贝塞尔: (0.42, 0.0, 0.58, 1.0)

#### Linear
- 无参数
- 贝塞尔: (0.0, 0.0, 1.0, 1.0)

---

## 参数类型定义

```javascript
var PARAM_TYPES = {
    amplitude: {
        label: '振幅',
        min: 0.1,
        max: 10.0,
        default: 1.0,
        step: 0.1
    },
    period: {
        label: '周期',
        min: 0.1,
        max: 5.0,
        default: 0.5,
        step: 0.1
    },
    factor: {
        label: '因子',
        min: 0.1,
        max: 3.0,
        default: 1.0,
        step: 0.1
    },
    tension: {
        label: '张力',
        min: 0.0,
        max: 5.0,
        default: 2.0,
        step: 0.1
    },
    damping: {
        label: '阻尼',
        min: 0.1,
        max: 1.0,
        default: 0.7,
        step: 0.05
    },
    velocity: {
        label: '初速度',
        min: 0.0,
        max: 3.0,
        default: 0.0,
        step: 0.1
    },
    duration: {
        label: '持续时间',
        min: 0.1,
        max: 2.0,
        default: 0.5,
        step: 0.1
    }
};
```
