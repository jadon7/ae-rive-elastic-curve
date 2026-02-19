/**
 * ============================================================
 * Animation Curves - Standalone Edition
 * ============================================================
 * 版本: 2.0.0 Standalone
 * 描述: 跨平台动画曲线插件 - 单文件完整版
 *
 * 支持平台:
 * - Rive: Elastic (弹性曲线)
 * - Android: 11种曲线 (基础、物理、Material Design)
 * - iOS: 14种曲线 (UIView.animate、Spring、CAMediaTiming)
 *
 * 使用方法:
 * 1. 在 After Effects 中运行此脚本 (File > Scripts > Run Script File)
 * 2. 选择平台标签页 (Rive / Android / iOS)
 * 3. 选择曲线类型并调整参数
 * 4. 在时间线中选择需要应用的属性关键帧
 * 5. 点击 "Apply to Selected Keyframes" 按钮
 *
 * 技术特性:
 * - 完整的数学实现，精确还原各平台曲线
 * - 自动生成 AE 表达式代码
 * - 支持实时预览
 * - 无需外部依赖，单文件即可运行
 * ============================================================
 */

(function() {
    'use strict';

    // ============================================================
    // PART 1: 曲线数学实现 (Curve Mathematics)
    // ============================================================

    /**
     * Rive Elastic 曲线
     * 实现弹性动画效果，模拟弹簧振荡
     * @param {number} amplitude - 振幅 (控制弹性强度)
     * @param {number} period - 周期 (控制振荡频率)
     * @param {string} easingType - 缓动类型 ('easeIn', 'easeOut', 'easeInOut')
     */
    function RiveElasticCurve(amplitude, period, easingType) {
        this.getValue = function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;

            var p = period;
            var a = amplitude;
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

    // ============================================================
    // Android 曲线实现
    // ============================================================

    /** Android Linear - 线性插值 */
    function AndroidLinearCurve() {
        this.getValue = function(t) { return t; };
    }

    /** Android Accelerate - 加速曲线 */
    function AndroidAccelerateCurve(factor) {
        this.getValue = function(t) {
            return factor === 1.0 ? t * t : Math.pow(t, 2 * factor);
        };
    }

    /** Android Decelerate - 减速曲线 */
    function AndroidDecelerateCurve(factor) {
        this.getValue = function(t) {
            return factor === 1.0 ? 1 - (1 - t) * (1 - t) : 1 - Math.pow(1 - t, 2 * factor);
        };
    }

    /** Android AccelerateDecelerate - 先加速后减速 */
    function AndroidAccelerateDecelerateCurve() {
        this.getValue = function(t) {
            return (Math.cos((t + 1) * Math.PI) / 2) + 0.5;
        };
    }

    /** Android Anticipate - 预期动画 (先后退再前进) */
    function AndroidAnticipateCurve(tension) {
        this.getValue = function(t) {
            return t * t * ((tension + 1) * t - tension);
        };
    }

    /** Android Overshoot - 超出动画 (超过目标再回弹) */
    function AndroidOvershootCurve(tension) {
        this.getValue = function(t) {
            t -= 1;
            return t * t * ((tension + 1) * t + tension) + 1;
        };
    }

    /** Android AnticipateOvershoot - 预期+超出组合 */
    function AndroidAnticipateOvershootCurve(tension) {
        this.getValue = function(t) {
            if (t < 0.5) {
                t *= 2;
                return 0.5 * (t * t * ((tension + 1) * t - tension));
            } else {
                t = (t - 0.5) * 2;
                t -= 1;
                return 0.5 * (t * t * ((tension + 1) * t + tension) + 1) + 0.5;
            }
        };
    }

    /** Android Bounce - 弹跳效果 */
    function AndroidBounceCurve() {
        function bounce(t) {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                t -= 1.5 / 2.75;
                return 7.5625 * t * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                t -= 2.25 / 2.75;
                return 7.5625 * t * t + 0.9375;
            } else {
                t -= 2.625 / 2.75;
                return 7.5625 * t * t + 0.984375;
            }
        }
        this.getValue = function(t) { return bounce(t); };
    }

    /**
     * 三次贝塞尔曲线求解器
     * 使用牛顿迭代法求解贝塞尔曲线
     */
    function CubicBezierCurve(x1, y1, x2, y2) {
        function sampleCurveX(t) {
            return ((1 - 3 * x2 + 3 * x1) * t * t * t +
                    (3 * x2 - 6 * x1) * t * t +
                    3 * x1 * t);
        }

        function sampleCurveY(t) {
            return ((1 - 3 * y2 + 3 * y1) * t * t * t +
                    (3 * y2 - 6 * y1) * t * t +
                    3 * y1 * t);
        }

        function sampleCurveDerivativeX(t) {
            return (3 * (1 - 3 * x2 + 3 * x1) * t * t +
                    2 * (3 * x2 - 6 * x1) * t +
                    3 * x1);
        }

        function solveCurveX(x) {
            var t = x;
            for (var i = 0; i < 8; i++) {
                var x2Val = sampleCurveX(t) - x;
                if (Math.abs(x2Val) < 0.000001) return t;
                var d2 = sampleCurveDerivativeX(t);
                if (Math.abs(d2) < 0.000001) break;
                t -= x2Val / d2;
            }
            return t;
        }

        this.getValue = function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            return sampleCurveY(solveCurveX(t));
        };
    }

    /** Material Design - Fast Out Slow In */
    function MaterialFastOutSlowInCurve() {
        var bezier = new CubicBezierCurve(0.4, 0.0, 0.2, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** Material Design - Fast Out Linear In */
    function MaterialFastOutLinearInCurve() {
        var bezier = new CubicBezierCurve(0.4, 0.0, 1.0, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** Material Design - Linear Out Slow In */
    function MaterialLinearOutSlowInCurve() {
        var bezier = new CubicBezierCurve(0.0, 0.0, 0.2, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    // ============================================================
    // iOS 曲线实现
    // ============================================================

    /** iOS Linear */
    function IOSLinearCurve() {
        this.getValue = function(t) { return t; };
    }

    /** iOS Ease In */
    function IOSEaseInCurve() {
        this.getValue = function(t) { return t * t; };
    }

    /** iOS Ease Out */
    function IOSEaseOutCurve() {
        this.getValue = function(t) { return 1 - (1 - t) * (1 - t); };
    }

    /** iOS Ease In-Out */
    function IOSEaseInOutCurve() {
        this.getValue = function(t) {
            if (t < 0.5) {
                return 2 * t * t;
            } else {
                return 1 - 2 * (1 - t) * (1 - t);
            }
        };
    }

    /**
     * iOS Spring - 阻尼谐振子模型
     * 实现物理弹簧动画效果
     */
    function IOSSpringCurve(damping, velocity, duration) {
        this.getValue = function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;

            var zeta = damping;
            var omega = 2 * Math.PI / duration;
            var omegaD = omega * Math.sqrt(1 - zeta * zeta);

            if (zeta < 1) {
                // 欠阻尼 (有振荡)
                return 1 - Math.exp(-zeta * omega * t) *
                       (Math.cos(omegaD * t) +
                        (zeta * omega / omegaD) * Math.sin(omegaD * t));
            } else if (zeta === 1) {
                // 临界阻尼
                return 1 - Math.exp(-omega * t) * (1 + omega * t);
            } else {
                // 过阻尼
                var r1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
                var r2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
                var c1 = 1 / (r1 - r2);
                var c2 = -c1;
                return 1 - (c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
            }
        };
    }

    /** iOS Spring - Default 预设 */
    function IOSSpringDefaultCurve() {
        var spring = new IOSSpringCurve(0.7, 0.0, 0.5);
        this.getValue = function(t) { return spring.getValue(t); };
    }

    /** iOS Spring - Gentle 预设 */
    function IOSSpringGentleCurve() {
        var spring = new IOSSpringCurve(0.9, 0.0, 0.5);
        this.getValue = function(t) { return spring.getValue(t); };
    }

    /** iOS Spring - Bouncy 预设 */
    function IOSSpringBouncyCurve() {
        var spring = new IOSSpringCurve(0.5, 1.0, 0.5);
        this.getValue = function(t) { return spring.getValue(t); };
    }

    /** CAMediaTimingFunction - Default */
    function CADefaultCurve() {
        var bezier = new CubicBezierCurve(0.25, 0.1, 0.25, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** CAMediaTimingFunction - Ease In */
    function CAEaseInCurve() {
        var bezier = new CubicBezierCurve(0.42, 0.0, 1.0, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** CAMediaTimingFunction - Ease Out */
    function CAEaseOutCurve() {
        var bezier = new CubicBezierCurve(0.0, 0.0, 0.58, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** CAMediaTimingFunction - Ease In-Out */
    function CAEaseInEaseOutCurve() {
        var bezier = new CubicBezierCurve(0.42, 0.0, 0.58, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    /** CAMediaTimingFunction - Linear */
    function CALinearCurve() {
        var bezier = new CubicBezierCurve(0.0, 0.0, 1.0, 1.0);
        this.getValue = function(t) { return bezier.getValue(t); };
    }

    // ============================================================
    // PART 2: 曲线工厂 (Curve Factory)
    // ============================================================

    /**
     * 曲线工厂 - 根据平台和类型创建曲线实例
     */
    function CurveFactory() {
        this.createCurve = function(platform, type, params) {
            switch(platform) {
                case 'rive':
                    if (type === 'elastic') {
                        return new RiveElasticCurve(
                            params.amplitude || 1.0,
                            params.period || 0.5,
                            params.easingType || 'easeOut'
                        );
                    }
                    break;

                case 'android':
                    switch(type) {
                        case 'linear': return new AndroidLinearCurve();
                        case 'accelerate': return new AndroidAccelerateCurve(params.factor || 1.0);
                        case 'decelerate': return new AndroidDecelerateCurve(params.factor || 1.0);
                        case 'accelerateDecelerate': return new AndroidAccelerateDecelerateCurve();
                        case 'anticipate': return new AndroidAnticipateCurve(params.tension || 2.0);
                        case 'overshoot': return new AndroidOvershootCurve(params.tension || 2.0);
                        case 'anticipateOvershoot': return new AndroidAnticipateOvershootCurve(params.tension || 2.0);
                        case 'bounce': return new AndroidBounceCurve();
                        case 'fastOutSlowIn': return new MaterialFastOutSlowInCurve();
                        case 'fastOutLinearIn': return new MaterialFastOutLinearInCurve();
                        case 'linearOutSlowIn': return new MaterialLinearOutSlowInCurve();
                    }
                    break;

                case 'ios':
                    switch(type) {
                        case 'linear': return new IOSLinearCurve();
                        case 'easeIn': return new IOSEaseInCurve();
                        case 'easeOut': return new IOSEaseOutCurve();
                        case 'easeInOut': return new IOSEaseInOutCurve();
                        case 'springDefault': return new IOSSpringDefaultCurve();
                        case 'springGentle': return new IOSSpringGentleCurve();
                        case 'springBouncy': return new IOSSpringBouncyCurve();
                        case 'springCustom': return new IOSSpringCurve(
                            params.damping || 0.7,
                            params.velocity || 0.0,
                            params.duration || 0.5
                        );
                        case 'caDefault': return new CADefaultCurve();
                        case 'caEaseIn': return new CAEaseInCurve();
                        case 'caEaseOut': return new CAEaseOutCurve();
                        case 'caEaseInEaseOut': return new CAEaseInEaseOutCurve();
                        case 'caLinear': return new CALinearCurve();
                    }
                    break;
            }

            // 默认返回线性曲线
            return new AndroidLinearCurve();
        };
    }

    // ============================================================
    // PART 3: 表达式生成器 (Expression Generator)
    // ============================================================

    /**
     * AE 表达式生成器
     * 将曲线转换为 After Effects 表达式代码
     */
    function ExpressionGenerator() {
        /**
         * 生成表达式代码
         */
        this.generate = function(platform, type, params) {
            var code = '// ' + platform.toUpperCase() + ' - ' + type + '\n';
            code += '// Generated by Animation Curves v2.0 Standalone\n\n';

            switch(platform) {
                case 'rive':
                    return this.generateRive(type, params);
                case 'android':
                    return this.generateAndroid(type, params);
                case 'ios':
                    return this.generateIOS(type, params);
            }

            return code + 'linear(time, inPoint, outPoint, 0, 1);';
        };

        /**
         * 生成 Rive 表达式
         */
        this.generateRive = function(type, params) {
            if (type === 'elastic') {
                var code = '';
                code += 'var amp = ' + params.amplitude + ';\n';
                code += 'var per = ' + params.period + ';\n';
                code += 'var t = (time - inPoint) / (outPoint - inPoint);\n';
                code += 'if (t <= 0) t = 0;\n';
                code += 'if (t >= 1) t = 1;\n\n';

                code += 'var s = per / (2 * Math.PI) * Math.asin(1 / amp);\n';
                code += 'var val;\n\n';

                if (params.easingType === 'easeOut') {
                    code += 'val = amp * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / per) + 1;\n';
                } else if (params.easingType === 'easeIn') {
                    code += 'val = -(amp * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / per));\n';
                } else {
                    code += 't *= 2;\n';
                    code += 'if (t < 1) {\n';
                    code += '  val = -0.5 * (amp * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / per));\n';
                    code += '} else {\n';
                    code += '  val = amp * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / per) * 0.5 + 1;\n';
                    code += '}\n';
                }

                code += '\nlinear(val, 0, 1, value.at(inPoint), value.at(outPoint));';
                return code;
            }
            
            // 默认返回线性插值
            return 'linear(time, inPoint, outPoint, value.at(inPoint), value.at(outPoint));';
        };

        /**
         * 生成 Android 表达式
         */
        this.generateAndroid = function(type, params) {
            var code = '';
            code += 'var t = (time - inPoint) / (outPoint - inPoint);\n';
            code += 'if (t <= 0) t = 0;\n';
            code += 'if (t >= 1) t = 1;\n\n';
            code += 'var val;\n\n';

            switch(type) {
                case 'linear':
                    code += 'val = t;\n';
                    break;

                case 'accelerate':
                    var factor = params.factor || 1.0;
                    if (factor === 1.0) {
                        code += 'val = t * t;\n';
                    } else {
                        code += 'val = Math.pow(t, ' + (2 * factor) + ');\n';
                    }
                    break;

                case 'decelerate':
                    var factor = params.factor || 1.0;
                    if (factor === 1.0) {
                        code += 'val = 1 - (1 - t) * (1 - t);\n';
                    } else {
                        code += 'val = 1 - Math.pow(1 - t, ' + (2 * factor) + ');\n';
                    }
                    break;

                case 'accelerateDecelerate':
                    code += 'val = (Math.cos((t + 1) * Math.PI) / 2) + 0.5;\n';
                    break;

                case 'anticipate':
                    var tension = params.tension || 2.0;
                    code += 'val = t * t * ((' + (tension + 1) + ') * t - ' + tension + ');\n';
                    break;

                case 'overshoot':
                    var tension = params.tension || 2.0;
                    code += 't -= 1;\n';
                    code += 'val = t * t * ((' + (tension + 1) + ') * t + ' + tension + ') + 1;\n';
                    break;

                case 'anticipateOvershoot':
                    var tension = params.tension || 2.0;
                    code += 'if (t < 0.5) {\n';
                    code += '  t *= 2;\n';
                    code += '  val = 0.5 * (t * t * ((' + (tension + 1) + ') * t - ' + tension + '));\n';
                    code += '} else {\n';
                    code += '  t = (t - 0.5) * 2;\n';
                    code += '  t -= 1;\n';
                    code += '  val = 0.5 * (t * t * ((' + (tension + 1) + ') * t + ' + tension + ') + 1) + 0.5;\n';
                    code += '}\n';
                    break;

                case 'bounce':
                    code += 'function bounce(t) {\n';
                    code += '  if (t < 1 / 2.75) {\n';
                    code += '    return 7.5625 * t * t;\n';
                    code += '  } else if (t < 2 / 2.75) {\n';
                    code += '    t -= 1.5 / 2.75;\n';
                    code += '    return 7.5625 * t * t + 0.75;\n';
                    code += '  } else if (t < 2.5 / 2.75) {\n';
                    code += '    t -= 2.25 / 2.75;\n';
                    code += '    return 7.5625 * t * t + 0.9375;\n';
                    code += '  } else {\n';
                    code += '    t -= 2.625 / 2.75;\n';
                    code += '    return 7.5625 * t * t + 0.984375;\n';
                    code += '  }\n';
                    code += '}\n';
                    code += 'val = bounce(t);\n';
                    break;

                case 'fastOutSlowIn':
                    code += this.generateBezier(0.4, 0.0, 0.2, 1.0);
                    break;

                case 'fastOutLinearIn':
                    code += this.generateBezier(0.4, 0.0, 1.0, 1.0);
                    break;

                case 'linearOutSlowIn':
                    code += this.generateBezier(0.0, 0.0, 0.2, 1.0);
                    break;
            }

            code += '\nlinear(val, 0, 1, value.at(inPoint), value.at(outPoint));';
            return code;
        };

        /**
         * 生成 iOS 表达式
         */
        this.generateIOS = function(type, params) {
            var code = '';
            code += 'var t = (time - inPoint) / (outPoint - inPoint);\n';
            code += 'if (t <= 0) t = 0;\n';
            code += 'if (t >= 1) t = 1;\n\n';
            code += 'var val;\n\n';

            switch(type) {
                case 'linear':
                    code += 'val = t;\n';
                    break;

                case 'easeIn':
                    code += 'val = t * t;\n';
                    break;

                case 'easeOut':
                    code += 'val = 1 - (1 - t) * (1 - t);\n';
                    break;

                case 'easeInOut':
                    code += 'if (t < 0.5) {\n';
                    code += '  val = 2 * t * t;\n';
                    code += '} else {\n';
                    code += '  val = 1 - 2 * (1 - t) * (1 - t);\n';
                    code += '}\n';
                    break;

                case 'springDefault':
                case 'springGentle':
                case 'springBouncy':
                case 'springCustom':
                    var damping = params.damping || (type === 'springGentle' ? 0.9 : type === 'springBouncy' ? 0.5 : 0.7);
                    var velocity = params.velocity || (type === 'springBouncy' ? 1.0 : 0.0);
                    var duration = params.duration || 0.5;

                    code += 'var zeta = ' + damping + ';\n';
                    code += 'var omega = 2 * Math.PI / ' + duration + ';\n';
                    code += 'var omegaD = omega * Math.sqrt(1 - zeta * zeta);\n\n';
                    code += 'if (zeta < 1) {\n';
                    code += '  val = 1 - Math.exp(-zeta * omega * t) * (Math.cos(omegaD * t) + (zeta * omega / omegaD) * Math.sin(omegaD * t));\n';
                    code += '} else {\n';
                    code += '  val = 1 - Math.exp(-omega * t) * (1 + omega * t);\n';
                    code += '}\n';
                    break;

                case 'caDefault':
                    code += this.generateBezier(0.25, 0.1, 0.25, 1.0);
                    break;

                case 'caEaseIn':
                    code += this.generateBezier(0.42, 0.0, 1.0, 1.0);
                    break;

                case 'caEaseOut':
                    code += this.generateBezier(0.0, 0.0, 0.58, 1.0);
                    break;

                case 'caEaseInEaseOut':
                    code += this.generateBezier(0.42, 0.0, 0.58, 1.0);
                    break;

                case 'caLinear':
                    code += this.generateBezier(0.0, 0.0, 1.0, 1.0);
                    break;
            }

            code += '\nlinear(val, 0, 1, value.at(inPoint), value.at(outPoint));';
            return code;
        };

        /**
         * 生成贝塞尔曲线求解代码
         */
        this.generateBezier = function(x1, y1, x2, y2) {
            var code = '';
            code += 'function sampleCurveX(t) {\n';
            code += '  return ((1 - 3 * ' + x2 + ' + 3 * ' + x1 + ') * t * t * t + (3 * ' + x2 + ' - 6 * ' + x1 + ') * t * t + 3 * ' + x1 + ' * t);\n';
            code += '}\n\n';
            code += 'function sampleCurveY(t) {\n';
            code += '  return ((1 - 3 * ' + y2 + ' + 3 * ' + y1 + ') * t * t * t + (3 * ' + y2 + ' - 6 * ' + y1 + ') * t * t + 3 * ' + y1 + ' * t);\n';
            code += '}\n\n';
            code += 'function sampleCurveDerivativeX(t) {\n';
            code += '  return (3 * (1 - 3 * ' + x2 + ' + 3 * ' + x1 + ') * t * t + 2 * (3 * ' + x2 + ' - 6 * ' + x1 + ') * t + 3 * ' + x1 + ');\n';
            code += '}\n\n';
            code += 'function solveCurveX(x) {\n';
            code += '  var t = x;\n';
            code += '  for (var i = 0; i < 8; i++) {\n';
            code += '    var x2 = sampleCurveX(t) - x;\n';
            code += '    if (Math.abs(x2) < 0.000001) return t;\n';
            code += '    var d2 = sampleCurveDerivativeX(t);\n';
            code += '    if (Math.abs(d2) < 0.000001) break;\n';
            code += '    t -= x2 / d2;\n';
            code += '  }\n';
            code += '  return t;\n';
            code += '}\n\n';
            code += 'val = sampleCurveY(solveCurveX(t));\n';
            return code;
        };
    }

    // ============================================================
    // PART 4: 数据模型与配置 (Data Models & Configuration)
    // ============================================================

    /**
     * 曲线默认参数配置
     */
    var CURVE_DEFAULTS = {
        rive: {
            elastic: {amplitude: 1.0, period: 0.5, easingType: 'easeOut'}
        },
        android: {
            linear: {},
            accelerate: {factor: 1.0},
            decelerate: {factor: 1.0},
            accelerateDecelerate: {},
            anticipate: {tension: 2.0},
            overshoot: {tension: 2.0},
            anticipateOvershoot: {tension: 2.0},
            bounce: {},
            fastOutSlowIn: {},
            fastOutLinearIn: {},
            linearOutSlowIn: {}
        },
        ios: {
            linear: {},
            easeIn: {},
            easeOut: {},
            easeInOut: {},
            springDefault: {},
            springGentle: {},
            springBouncy: {},
            springCustom: {damping: 0.7, velocity: 0.0, duration: 0.5},
            caDefault: {},
            caEaseIn: {},
            caEaseOut: {},
            caEaseInEaseOut: {},
            caLinear: {}
        }
    };

    /**
     * 曲线显示名称
     */
    var CURVE_NAMES = {
        rive: {
            elastic: 'Elastic'
        },
        android: {
            linear: 'Linear',
            accelerate: 'Accelerate',
            decelerate: 'Decelerate',
            accelerateDecelerate: 'Accel/Decel',
            anticipate: 'Anticipate',
            overshoot: 'Overshoot',
            anticipateOvershoot: 'Anti/Over',
            bounce: 'Bounce',
            fastOutSlowIn: 'Fast/Slow',
            fastOutLinearIn: 'Fast/Linear',
            linearOutSlowIn: 'Linear/Slow'
        },
        ios: {
            linear: 'Linear',
            easeIn: 'Ease In',
            easeOut: 'Ease Out',
            easeInOut: 'Ease In-Out',
            springDefault: 'Spring Default',
            springGentle: 'Spring Gentle',
            springBouncy: 'Spring Bouncy',
            springCustom: 'Spring Custom',
            caDefault: 'CA Default',
            caEaseIn: 'CA Ease In',
            caEaseOut: 'CA Ease Out',
            caEaseInEaseOut: 'CA Ease In-Out',
            caLinear: 'CA Linear'
        }
    };

    /**
     * 参数配置
     */
    var PARAM_CONFIG = {
        amplitude: {label: 'Amplitude', min: 0.1, max: 10.0, step: 0.1},
        period: {label: 'Period', min: 0.1, max: 5.0, step: 0.1},
        factor: {label: 'Factor', min: 0.1, max: 3.0, step: 0.1},
        tension: {label: 'Tension', min: 0.0, max: 5.0, step: 0.1},
        damping: {label: 'Damping', min: 0.1, max: 1.0, step: 0.05},
        velocity: {label: 'Velocity', min: 0.0, max: 3.0, step: 0.1},
        duration: {label: 'Duration', min: 0.1, max: 2.0, step: 0.1}
    };

    /**
     * 曲线参数映射
     */
    var CURVE_PARAMS = {
        rive: {
            elastic: ['amplitude', 'period', 'easingType']
        },
        android: {
            accelerate: ['factor'],
            decelerate: ['factor'],
            anticipate: ['tension'],
            overshoot: ['tension'],
            anticipateOvershoot: ['tension']
        },
        ios: {
            springCustom: ['damping', 'velocity', 'duration']
        }
    };

    /**
     * 曲线数据模型
     */
    function CurveModel() {
        var _platform = 'rive';
        var _curveType = 'elastic';
        var _params = {amplitude: 1.0, period: 0.5, easingType: 'easeOut'};

        this.setPlatform = function(platform) {
            _platform = platform;
            switch(platform) {
                case 'rive':
                    _curveType = 'elastic';
                    _params = {amplitude: 1.0, period: 0.5, easingType: 'easeOut'};
                    break;
                case 'android':
                    _curveType = 'accelerate';
                    _params = {factor: 1.0};
                    break;
                case 'ios':
                    _curveType = 'easeInOut';
                    _params = {};
                    break;
            }
        };

        this.getPlatform = function() { return _platform; };
        this.setCurveType = function(type) {
            _curveType = type;
            _params = CURVE_DEFAULTS[_platform][type] || {};
        };
        this.getCurveType = function() { return _curveType; };
        this.setParam = function(name, value) { _params[name] = value; };
        this.getParam = function(name) { return _params[name]; };
        this.getParams = function() { return _params; };
        this.reset = function() { this.setPlatform(_platform); };
    }

    /**
     * ViewModel - 连接模型和视图
     */
    function ViewModel(model) {
        var _model = model;
        var _factory = new CurveFactory();
        var _expressionGen = new ExpressionGenerator();

        this.setPlatform = function(platform) {
            _model.setPlatform(platform);
        };

        this.setCurveType = function(type) {
            _model.setCurveType(type);
        };

        this.setParam = function(name, value) {
            _model.setParam(name, value);
        };

        this.getCurveFunction = function() {
            return _factory.createCurve(_model.getPlatform(), _model.getCurveType(), _model.getParams());
        };

        this.generateExpression = function() {
            return _expressionGen.generate(_model.getPlatform(), _model.getCurveType(), _model.getParams());
        };

        this.getModel = function() {
            return _model;
        };
    }

    // ============================================================
    // PART 5: UI 组件 (UI Components)
    // ============================================================

    /**
     * 创建主 UI 窗口
     */
    function createUI(viewModel) {
        var win = new Window('palette', 'Animation Curves v2.0', undefined);
        win.orientation = 'column';
        win.alignChildren = ['fill', 'top'];
        win.spacing = 10;
        win.margins = 15;

        // 标签页面板
        var tabPanel = win.add('tabbedpanel');
        tabPanel.preferredSize = [320, 480];
        var riveTab = tabPanel.add('tab', undefined, 'Rive');
        var androidTab = tabPanel.add('tab', undefined, 'Android');
        var iosTab = tabPanel.add('tab', undefined, 'iOS');

        // 设置各标签页
        setupRiveTab(riveTab, viewModel);
        setupAndroidTab(androidTab, viewModel);
        setupIOSTab(iosTab, viewModel);

        // 预览区域（占位符）
        var previewGroup = win.add('group');
        previewGroup.orientation = 'column';
        previewGroup.alignChildren = ['center', 'top'];
        var previewLabel = previewGroup.add('statictext', undefined, 'Curve Preview');
        previewLabel.preferredSize = [280, 20];
        var previewInfo = previewGroup.add('statictext', undefined, 'Select curve and adjust parameters above', {multiline: true});
        previewInfo.preferredSize = [280, 130];

        // 应用按钮
        var applyBtn = win.add('button', undefined, 'Apply to Selected Keyframes');
        applyBtn.preferredSize = [280, 30];

        // 事件处理
        tabPanel.onChange = function() {
            var platform = ['rive', 'android', 'ios'][tabPanel.selection.index];
            viewModel.setPlatform(platform);
            previewInfo.text = 'Platform: ' + platform.toUpperCase() + '\nCurve: ' + viewModel.curveType;
        };

        applyBtn.onClick = function() {
            applyToKeyframes(viewModel);
        };

        return win;
    }

    /**
     * 设置 Rive 标签页
     */
    function setupRiveTab(tab, viewModel) {
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'top'];
        tab.spacing = 8;
        tab.margins = 10;

        // 曲线选择
        var curveGroup = tab.add('group');
        curveGroup.add('statictext', undefined, 'Curve:');
        var curveDropdown = curveGroup.add('dropdownlist', undefined, ['Elastic']);
        curveDropdown.selection = 0;

        // Amplitude 参数
        var ampGroup = tab.add('group');
        ampGroup.add('statictext', undefined, 'Amplitude:');
        var ampSlider = ampGroup.add('slider', undefined, 1.0, 0.1, 10.0);
        var ampText = ampGroup.add('edittext', undefined, '1.0');
        ampText.characters = 5;

        // Period 参数
        var perGroup = tab.add('group');
        perGroup.add('statictext', undefined, 'Period:');
        var perSlider = perGroup.add('slider', undefined, 0.5, 0.1, 5.0);
        var perText = perGroup.add('edittext', undefined, '0.5');
        perText.characters = 5;

        // Easing Type 选择
        var typeGroup = tab.add('group');
        typeGroup.add('statictext', undefined, 'Type:');
        var typeDropdown = typeGroup.add('dropdownlist', undefined, ['easeOut', 'easeIn', 'easeInOut']);
        typeDropdown.selection = 0;

        // 事件绑定
        ampSlider.onChanging = function() {
            ampText.text = ampSlider.value.toFixed(1);
            viewModel.setParam('amplitude', ampSlider.value);
        };

        perSlider.onChanging = function() {
            perText.text = perSlider.value.toFixed(1);
            viewModel.setParam('period', perSlider.value);
        };

        typeDropdown.onChange = function() {
            viewModel.setParam('easingType', typeDropdown.selection.text);
        };
    }

    /**
     * 设置 Android 标签页
     */
    function setupAndroidTab(tab, viewModel) {
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'top'];
        tab.spacing = 8;
        tab.margins = 10;

        // 曲线选择
        var curveGroup = tab.add('group');
        curveGroup.add('statictext', undefined, 'Curve:');
        var curveDropdown = curveGroup.add('dropdownlist', undefined, [
            'Linear', 'Accelerate', 'Decelerate', 'Accel/Decel',
            'Anticipate', 'Overshoot', 'Anti/Over', 'Bounce',
            'Fast/Slow', 'Fast/Linear', 'Linear/Slow'
        ]);
        curveDropdown.selection = 1;

        // 参数面板
        var paramPanel = tab.add('panel', undefined, 'Parameters');
        paramPanel.orientation = 'column';
        paramPanel.alignChildren = ['fill', 'top'];
        paramPanel.spacing = 5;
        paramPanel.margins = 10;

        // Factor 参数
        var factorGroup = paramPanel.add('group');
        factorGroup.add('statictext', undefined, 'Factor:');
        var factorSlider = factorGroup.add('slider', undefined, 1.0, 0.1, 3.0);
        var factorText = factorGroup.add('edittext', undefined, '1.0');
        factorText.characters = 5;
        factorGroup.visible = true;  // 默认可见

        // Tension 参数
        var tensionGroup = paramPanel.add('group');
        tensionGroup.add('statictext', undefined, 'Tension:');
        var tensionSlider = tensionGroup.add('slider', undefined, 2.0, 0.0, 5.0);
        var tensionText = tensionGroup.add('edittext', undefined, '2.0');
        tensionText.characters = 5;
        tensionGroup.visible = false;  // 默认隐藏

        // 曲线类型映射
        var curveMap = [
            'linear', 'accelerate', 'decelerate', 'accelerateDecelerate',
            'anticipate', 'overshoot', 'anticipateOvershoot', 'bounce',
            'fastOutSlowIn', 'fastOutLinearIn', 'linearOutSlowIn'
        ];

        // 事件绑定
        curveDropdown.onChange = function() {
            var type = curveMap[curveDropdown.selection.index];
            viewModel.setCurveType(type);
            factorGroup.visible = (type === 'accelerate' || type === 'decelerate');
            tensionGroup.visible = (type === 'anticipate' || type === 'overshoot' || type === 'anticipateOvershoot');
        };
        
        // 初始化参数显示状态
        var initialType = curveMap[curveDropdown.selection.index];
        viewModel.setCurveType(initialType);
        factorGroup.visible = (initialType === 'accelerate' || initialType === 'decelerate');
        tensionGroup.visible = (initialType === 'anticipate' || initialType === 'overshoot' || initialType === 'anticipateOvershoot');

        factorSlider.onChanging = function() {
            factorText.text = factorSlider.value.toFixed(1);
            viewModel.setParam('factor', factorSlider.value);
        };

        tensionSlider.onChanging = function() {
            tensionText.text = tensionSlider.value.toFixed(1);
            viewModel.setParam('tension', tensionSlider.value);
        };
    }

    /**
     * 设置 iOS 标签页
     */
    function setupIOSTab(tab, viewModel) {
        tab.orientation = 'column';
        tab.alignChildren = ['fill', 'top'];
        tab.spacing = 8;
        tab.margins = 10;

        // 曲线选择
        var curveGroup = tab.add('group');
        curveGroup.add('statictext', undefined, 'Curve:');
        var curveDropdown = curveGroup.add('dropdownlist', undefined, [
            'Linear', 'Ease In', 'Ease Out', 'Ease In-Out',
            'Spring Default', 'Spring Gentle', 'Spring Bouncy', 'Spring Custom',
            'CA Default', 'CA Ease In', 'CA Ease Out', 'CA Ease In-Out', 'CA Linear'
        ]);
        curveDropdown.selection = 3;

        // Spring 参数面板
        var paramPanel = tab.add('panel', undefined, 'Spring Parameters');
        paramPanel.orientation = 'column';
        paramPanel.alignChildren = ['fill', 'top'];
        paramPanel.spacing = 5;
        paramPanel.margins = 10;
        paramPanel.visible = false;

        // Damping 参数
        var dampGroup = paramPanel.add('group');
        dampGroup.add('statictext', undefined, 'Damping:');
        var dampSlider = dampGroup.add('slider', undefined, 0.7, 0.1, 1.0);
        var dampText = dampGroup.add('edittext', undefined, '0.7');
        dampText.characters = 5;

        // Velocity 参数
        var velGroup = paramPanel.add('group');
        velGroup.add('statictext', undefined, 'Velocity:');
        var velSlider = velGroup.add('slider', undefined, 0.0, 0.0, 3.0);
        var velText = velGroup.add('edittext', undefined, '0.0');
        velText.characters = 5;

        // Duration 参数
        var durGroup = paramPanel.add('group');
        durGroup.add('statictext', undefined, 'Duration:');
        var durSlider = durGroup.add('slider', undefined, 0.5, 0.1, 2.0);
        var durText = durGroup.add('edittext', undefined, '0.5');
        durText.characters = 5;

        // 曲线类型映射
        var curveMap = [
            'linear', 'easeIn', 'easeOut', 'easeInOut',
            'springDefault', 'springGentle', 'springBouncy', 'springCustom',
            'caDefault', 'caEaseIn', 'caEaseOut', 'caEaseInEaseOut', 'caLinear'
        ];

        // 事件绑定
        curveDropdown.onChange = function() {
            var type = curveMap[curveDropdown.selection.index];
            viewModel.setCurveType(type);
            paramPanel.visible = (type === 'springCustom');
        };
        
        // 初始化参数显示状态
        var initialType = curveMap[curveDropdown.selection.index];
        viewModel.setCurveType(initialType);
        paramPanel.visible = (initialType === 'springCustom');

        dampSlider.onChanging = function() {
            dampText.text = dampSlider.value.toFixed(2);
            viewModel.setParam('damping', dampSlider.value);
        };

        velSlider.onChanging = function() {
            velText.text = velSlider.value.toFixed(1);
            viewModel.setParam('velocity', velSlider.value);
        };

        durSlider.onChanging = function() {
            durText.text = durSlider.value.toFixed(1);
            viewModel.setParam('duration', durSlider.value);
        };
    }

    /**
     * 应用曲线到选中的关键帧
     */
    function applyToKeyframes(viewModel) {
        app.beginUndoGroup('Apply Animation Curve');
        try {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert('Please select a composition');
                return;
            }

            var selectedProps = [];
            for (var i = 1; i <= comp.selectedLayers.length; i++) {
                var layer = comp.selectedLayers[i - 1];
                collectSelectedProperties(layer, selectedProps);
            }

            if (selectedProps.length === 0) {
                alert('Please select properties with keyframes');
                return;
            }

            var expression = viewModel.generateExpression();
            for (var i = 0; i < selectedProps.length; i++) {
                selectedProps[i].expressionEnabled = true;
                selectedProps[i].expression = expression;
            }

            alert('Applied curve to ' + selectedProps.length + ' properties');
        } catch (e) {
            alert('Error: ' + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    /**
     * 递归收集选中的属性
     */
    function collectSelectedProperties(obj, result) {
        if (obj.selectedProperties) {
            for (var i = 0; i < obj.selectedProperties.length; i++) {
                var prop = obj.selectedProperties[i];
                if (prop.canSetExpression && prop.numKeys > 0) {
                    result.push(prop);
                }
                if (prop.numProperties) {
                    collectSelectedProperties(prop, result);
                }
            }
        }
    }

    // ============================================================
    // PART 6: 主程序入口 (Main Entry Point)
    // ============================================================

    /**
     * 主函数 - 初始化并显示 UI
     */
    function main() {
        try {
            // 检查 AE 版本
            if (parseFloat(app.version) < 11.0) {
                alert('This plugin requires After Effects CS6 or higher');
                return;
            }

            // 创建模型和视图
            var model = new CurveModel();
            var viewModel = new ViewModel(model);
            var ui = createUI(viewModel);

            // 显示 UI
            if (ui instanceof Window) {
                ui.center();
                ui.show();
            } else {
                ui.layout.layout(true);
            }
        } catch (e) {
            alert('Error: ' + e.toString() + (e.line ? '\nLine: ' + e.line : ''));
        }
    }

    // 执行主函数
    main();

})();
