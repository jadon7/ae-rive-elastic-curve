// test-all-curves.jsx
// 自动测试所有 26 条曲线
// 版本: 1.0.0

/**
 * 曲线测试脚本
 *
 * 功能：
 * - 自动测试所有 26 条曲线
 * - 验证参数范围
 * - 生成测试报告
 *
 * 使用方法：
 * 1. 在 After Effects 中打开此脚本
 * 2. 点击"运行测试"按钮
 * 3. 查看测试报告
 */

(function() {
    // ============================================================
    // 测试配置
    // ============================================================

    var TEST_CONFIG = {
        // 测试点数量
        testPoints: [0, 0.25, 0.5, 0.75, 1],

        // 容差范围
        tolerance: 0.001,

        // 是否创建可视化合成
        createVisualTest: true,

        // 测试合成设置
        compSettings: {
            width: 1920,
            height: 1080,
            duration: 3,
            frameRate: 30
        }
    };

    // ============================================================
    // 曲线定义（从 AnimationCurves-v2.jsx 复制）
    // ============================================================

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
            } else {
                t *= 2;
                if (t < 1) {
                    return -0.5 * (a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p));
                }
                return a * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
            }
        };
    }

    function AndroidLinearCurve() {
        this.getValue = function(t) { return t; };
    }

    function AndroidAccelerateCurve(factor) {
        this.getValue = function(t) {
            return factor === 1.0 ? t * t : Math.pow(t, 2 * factor);
        };
    }

    function AndroidDecelerateCurve(factor) {
        this.getValue = function(t) {
            return factor === 1.0 ? 1 - (1 - t) * (1 - t) : 1 - Math.pow(1 - t, 2 * factor);
        };
    }

    function AndroidAccelerateDecelerateCurve() {
        this.getValue = function(t) {
            return (Math.cos((t + 1) * Math.PI) / 2) + 0.5;
        };
    }

    function AndroidAnticipateCurve(tension) {
        this.getValue = function(t) {
            return t * t * ((tension + 1) * t - tension);
        };
    }

    function AndroidOvershootCurve(tension) {
        this.getValue = function(t) {
            t -= 1;
            return t * t * ((tension + 1) * t + tension) + 1;
        };
    }

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

    function AndroidBounceCurve() {
        this.getValue = function(t) {
            if (t < 0.36363636) {
                return 7.5625 * t * t;
            } else if (t < 0.72727273) {
                t -= 0.54545455;
                return 7.5625 * t * t + 0.75;
            } else if (t < 0.90909091) {
                t -= 0.81818182;
                return 7.5625 * t * t + 0.9375;
            } else {
                t -= 0.95454545;
                return 7.5625 * t * t + 0.984375;
            }
        };
    }

    function CubicBezierCurve(x1, y1, x2, y2) {
        this.getValue = function(t) {
            var cx = 3 * x1;
            var bx = 3 * (x2 - x1) - cx;
            var ax = 1 - cx - bx;
            var cy = 3 * y1;
            var by = 3 * (y2 - y1) - cy;
            var ay = 1 - cy - by;

            function sampleCurveX(t) {
                return ((ax * t + bx) * t + cx) * t;
            }

            function sampleCurveY(t) {
                return ((ay * t + by) * t + cy) * t;
            }

            function solveCurveX(x) {
                var t0, t1, t2, x2, d2, i;
                for (t2 = x, i = 0; i < 8; i++) {
                    x2 = sampleCurveX(t2) - x;
                    if (Math.abs(x2) < 0.000001) return t2;
                    d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                    if (Math.abs(d2) < 0.000001) break;
                    t2 = t2 - x2 / d2;
                }
                t0 = 0; t1 = 1; t2 = x;
                if (t2 < t0) return t0;
                if (t2 > t1) return t1;
                while (t0 < t1) {
                    x2 = sampleCurveX(t2);
                    if (Math.abs(x2 - x) < 0.000001) return t2;
                    if (x > x2) t0 = t2;
                    else t1 = t2;
                    t2 = (t1 - t0) * 0.5 + t0;
                }
                return t2;
            }

            return sampleCurveY(solveCurveX(t));
        };
    }

    function IOSLinearCurve() {
        this.getValue = function(t) { return t; };
    }

    function IOSEaseInCurve() {
        this.getValue = function(t) { return t * t; };
    }

    function IOSEaseOutCurve() {
        this.getValue = function(t) { return 1 - (1 - t) * (1 - t); };
    }

    function IOSEaseInOutCurve() {
        this.getValue = function(t) {
            if (t < 0.5) return 2 * t * t;
            return 1 - Math.pow(-2 * t + 2, 2) / 2;
        };
    }

    function IOSSpringCurve(damping, velocity, duration) {
        this.getValue = function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            var zeta = damping;
            var omega = 2 * Math.PI / duration;
            var omegaD = omega * Math.sqrt(Math.abs(1 - zeta * zeta));
            if (zeta < 1) {
                return 1 - Math.exp(-zeta * omega * t) *
                       (Math.cos(omegaD * t) + (zeta * omega + velocity) / omegaD * Math.sin(omegaD * t));
            } else {
                return 1 - Math.exp(-omega * t) * (1 + omega * t);
            }
        };
    }

    // ============================================================
    // 测试用例定义
    // ============================================================

    var TEST_CASES = [
        // Rive
        { platform: 'Rive', name: 'Elastic (easeOut)', curve: new RiveElasticCurve(1.0, 0.5, 'easeOut'), params: { amplitude: 1.0, period: 0.5 } },
        { platform: 'Rive', name: 'Elastic (easeIn)', curve: new RiveElasticCurve(1.0, 0.5, 'easeIn'), params: { amplitude: 1.0, period: 0.5 } },
        { platform: 'Rive', name: 'Elastic (easeInOut)', curve: new RiveElasticCurve(1.0, 0.5, 'easeInOut'), params: { amplitude: 1.0, period: 0.5 } },

        // Android - 基础
        { platform: 'Android', name: 'Linear', curve: new AndroidLinearCurve(), params: {} },
        { platform: 'Android', name: 'Accelerate', curve: new AndroidAccelerateCurve(1.0), params: { factor: 1.0 } },
        { platform: 'Android', name: 'Decelerate', curve: new AndroidDecelerateCurve(1.0), params: { factor: 1.0 } },
        { platform: 'Android', name: 'AccelerateDecelerate', curve: new AndroidAccelerateDecelerateCurve(), params: {} },

        // Android - 物理
        { platform: 'Android', name: 'Anticipate', curve: new AndroidAnticipateCurve(2.0), params: { tension: 2.0 } },
        { platform: 'Android', name: 'Overshoot', curve: new AndroidOvershootCurve(2.0), params: { tension: 2.0 } },
        { platform: 'Android', name: 'AnticipateOvershoot', curve: new AndroidAnticipateOvershootCurve(2.0), params: { tension: 2.0 } },
        { platform: 'Android', name: 'Bounce', curve: new AndroidBounceCurve(), params: {} },

        // Android - Material Design
        { platform: 'Android', name: 'FastOutSlowIn', curve: new CubicBezierCurve(0.4, 0.0, 0.2, 1.0), params: {} },
        { platform: 'Android', name: 'FastOutLinearIn', curve: new CubicBezierCurve(0.4, 0.0, 1.0, 1.0), params: {} },
        { platform: 'Android', name: 'LinearOutSlowIn', curve: new CubicBezierCurve(0.0, 0.0, 0.2, 1.0), params: {} },

        // iOS - 标准
        { platform: 'iOS', name: 'Linear', curve: new IOSLinearCurve(), params: {} },
        { platform: 'iOS', name: 'EaseIn', curve: new IOSEaseInCurve(), params: {} },
        { platform: 'iOS', name: 'EaseOut', curve: new IOSEaseOutCurve(), params: {} },
        { platform: 'iOS', name: 'EaseInOut', curve: new IOSEaseInOutCurve(), params: {} },

        // iOS - Spring
        { platform: 'iOS', name: 'Spring Default', curve: new IOSSpringCurve(0.7, 0.0, 0.5), params: { damping: 0.7, velocity: 0.0 } },
        { platform: 'iOS', name: 'Spring Gentle', curve: new IOSSpringCurve(0.9, 0.0, 0.5), params: { damping: 0.9, velocity: 0.0 } },
        { platform: 'iOS', name: 'Spring Bouncy', curve: new IOSSpringCurve(0.5, 1.0, 0.5), params: { damping: 0.5, velocity: 1.0 } },

        // iOS - CAMediaTiming
        { platform: 'iOS', name: 'CAMediaTiming Default', curve: new CubicBezierCurve(0.25, 0.1, 0.25, 1.0), params: {} },
        { platform: 'iOS', name: 'CAMediaTiming EaseIn', curve: new CubicBezierCurve(0.42, 0.0, 1.0, 1.0), params: {} },
        { platform: 'iOS', name: 'CAMediaTiming EaseOut', curve: new CubicBezierCurve(0.0, 0.0, 0.58, 1.0), params: {} },
        { platform: 'iOS', name: 'CAMediaTiming EaseInEaseOut', curve: new CubicBezierCurve(0.42, 0.0, 0.58, 1.0), params: {} },
        { platform: 'iOS', name: 'CAMediaTiming Linear', curve: new CubicBezierCurve(0.0, 0.0, 1.0, 1.0), params: {} }
    ];

    // ============================================================
    // 测试函数
    // ============================================================

    function runTests() {
        var results = [];
        var passed = 0;
        var failed = 0;

        for (var i = 0; i < TEST_CASES.length; i++) {
            var testCase = TEST_CASES[i];
            var result = testCurve(testCase);
            results.push(result);
            if (result.passed) passed++;
            else failed++;
        }

        return {
            total: TEST_CASES.length,
            passed: passed,
            failed: failed,
            results: results
        };
    }

    function testCurve(testCase) {
        var errors = [];
        var values = [];

        try {
            // 测试边界值
            var v0 = testCase.curve.getValue(0);
            var v1 = testCase.curve.getValue(1);

            if (Math.abs(v0) > TEST_CONFIG.tolerance) {
                errors.push('起点值错误: ' + v0 + ' (期望 0)');
            }

            if (Math.abs(v1 - 1) > TEST_CONFIG.tolerance) {
                errors.push('终点值错误: ' + v1 + ' (期望 1)');
            }

            // 测试中间点
            for (var i = 0; i < TEST_CONFIG.testPoints.length; i++) {
                var t = TEST_CONFIG.testPoints[i];
                var v = testCase.curve.getValue(t);
                values.push({ t: t, v: v });

                // 检查是否为有效数字
                if (isNaN(v) || !isFinite(v)) {
                    errors.push('t=' + t + ' 时返回无效值: ' + v);
                }
            }

        } catch (e) {
            errors.push('异常: ' + e.toString());
        }

        return {
            platform: testCase.platform,
            name: testCase.name,
            params: testCase.params,
            passed: errors.length === 0,
            errors: errors,
            values: values
        };
    }

    // ============================================================
    // 可视化测试
    // ============================================================

    function createVisualTest() {
        app.beginUndoGroup('创建曲线测试合成');

        try {
            var comp = app.project.items.addComp(
                'Curve Test - All Curves',
                TEST_CONFIG.compSettings.width,
                TEST_CONFIG.compSettings.height,
                1,
                TEST_CONFIG.compSettings.duration,
                TEST_CONFIG.compSettings.frameRate
            );

            var yOffset = 50;
            var xStart = 100;
            var xEnd = TEST_CONFIG.compSettings.width - 100;
            var spacing = 35;

            for (var i = 0; i < TEST_CASES.length; i++) {
                var testCase = TEST_CASES[i];
                var y = yOffset + i * spacing;

                // 创建文本标签
                var textLayer = comp.layers.addText(testCase.platform + ' - ' + testCase.name);
                textLayer.property('ADBE Transform Group').property('ADBE Position').setValue([xStart - 50, y]);

                // 创建形状图层显示曲线
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = 'Curve: ' + testCase.name;

                var group = shapeLayer.property('ADBE Root Vectors Group').addProperty('ADBE Vector Group');
                var path = group.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Group');
                var stroke = group.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Stroke');
                stroke.property('ADBE Vector Stroke Color').setValue([1, 0.5, 0, 1]);
                stroke.property('ADBE Vector Stroke Width').setValue(2);

                // 生成路径点
                var points = [];
                var inTangents = [];
                var outTangents = [];
                var steps = 50;

                for (var j = 0; j <= steps; j++) {
                    var t = j / steps;
                    var x = xStart + (xEnd - xStart) * t;
                    var curveValue = testCase.curve.getValue(t);
                    var yPos = y - curveValue * 20; // 缩放曲线高度
                    points.push([x, yPos]);
                    inTangents.push([0, 0]);
                    outTangents.push([0, 0]);
                }

                var shape = new Shape();
                shape.vertices = points;
                shape.inTangents = inTangents;
                shape.outTangents = outTangents;
                shape.closed = false;

                path.property('ADBE Vector Shape').setValue(shape);
            }

            comp.openInViewer();
            return comp;

        } catch (e) {
            alert('创建可视化测试失败: ' + e.toString());
            return null;
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 报告生成
    // ============================================================

    function generateReport(testResults) {
        var report = [];
        report.push('========================================');
        report.push('曲线测试报告');
        report.push('========================================');
        report.push('');
        report.push('测试时间: ' + new Date().toString());
        report.push('总计: ' + testResults.total + ' 条曲线');
        report.push('通过: ' + testResults.passed + ' 条');
        report.push('失败: ' + testResults.failed + ' 条');
        report.push('');
        report.push('========================================');
        report.push('详细结果');
        report.push('========================================');
        report.push('');

        var platforms = { 'Rive': [], 'Android': [], 'iOS': [] };
        for (var i = 0; i < testResults.results.length; i++) {
            var result = testResults.results[i];
            platforms[result.platform].push(result);
        }

        for (var platform in platforms) {
            report.push('--- ' + platform + ' ---');
            report.push('');

            var results = platforms[platform];
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var status = result.passed ? '[✓]' : '[✗]';
                report.push(status + ' ' + result.name);

                if (Object.keys(result.params).length > 0) {
                    var params = [];
                    for (var key in result.params) {
                        params.push(key + '=' + result.params[key]);
                    }
                    report.push('    参数: ' + params.join(', '));
                }

                if (result.errors.length > 0) {
                    report.push('    错误:');
                    for (var j = 0; j < result.errors.length; j++) {
                        report.push('      - ' + result.errors[j]);
                    }
                }

                if (result.values.length > 0) {
                    var valueStr = [];
                    for (var j = 0; j < result.values.length; j++) {
                        var v = result.values[j];
                        valueStr.push('t=' + v.t.toFixed(2) + ':' + v.v.toFixed(4));
                    }
                    report.push('    值: ' + valueStr.join(', '));
                }

                report.push('');
            }
        }

        return report.join('\n');
    }

    // ============================================================
    // UI
    // ============================================================

    function buildUI() {
        var win = new Window('palette', '曲线测试工具', undefined);
        win.orientation = 'column';
        win.alignChildren = ['fill', 'top'];
        win.spacing = 10;
        win.margins = 16;

        // 标题
        var titleGroup = win.add('group');
        titleGroup.add('statictext', undefined, '自动测试所有 26 条曲线');

        // 选项
        var optionsGroup = win.add('panel', undefined, '测试选项');
        optionsGroup.orientation = 'column';
        optionsGroup.alignChildren = ['left', 'top'];
        optionsGroup.spacing = 5;
        optionsGroup.margins = 10;

        var visualCheckbox = optionsGroup.add('checkbox', undefined, '创建可视化测试合成');
        visualCheckbox.value = TEST_CONFIG.createVisualTest;

        // 按钮
        var buttonGroup = win.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignChildren = ['center', 'center'];

        var runButton = buttonGroup.add('button', undefined, '运行测试');
        var closeButton = buttonGroup.add('button', undefined, '关闭');

        // 事件处理
        runButton.onClick = function() {
            TEST_CONFIG.createVisualTest = visualCheckbox.value;

            var testResults = runTests();
            var report = generateReport(testResults);

            // 显示报告
            var reportWin = new Window('dialog', '测试报告');
            reportWin.orientation = 'column';
            reportWin.alignChildren = ['fill', 'fill'];

            var reportText = reportWin.add('edittext', undefined, report, { multiline: true, scrolling: true });
            reportText.preferredSize = [700, 500];

            var reportButtonGroup = reportWin.add('group');
            var saveButton = reportButtonGroup.add('button', undefined, '保存报告');
            var okButton = reportButtonGroup.add('button', undefined, '确定');

            saveButton.onClick = function() {
                var file = File.saveDialog('保存测试报告', '*.txt');
                if (file) {
                    file.open('w');
                    file.write(report);
                    file.close();
                    alert('报告已保存到: ' + file.fsName);
                }
            };

            okButton.onClick = function() {
                reportWin.close();
            };

            reportWin.show();

            // 创建可视化测试
            if (TEST_CONFIG.createVisualTest) {
                createVisualTest();
            }
        };

        closeButton.onClick = function() {
            win.close();
        };

        win.center();
        win.show();
    }

    // ============================================================
    // 入口
    // ============================================================

    buildUI();

})();
