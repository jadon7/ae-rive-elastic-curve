// ElasticCurveViewModel.jsx
// ViewModel 层：连接 Model 和 View，处理业务逻辑

/**
 * Rive 弹性曲线 ViewModel
 * @constructor
 * @param {ElasticCurveModel} model - 数据模型
 * @param {ExpressionGenerator} generator - 表达式生成器
 */
function ElasticCurveViewModel(model, generator) {
    var _model = model;
    var _generator = generator;
    var _view = null;
    
    /**
     * 绑定 View
     * @param {Object} view
     */
    this.bindView = function(view) {
        _view = view;
    };
    
    /**
     * 更新振幅
     * @param {string} value
     * @returns {Object} {success: boolean, error: string}
     */
    this.updateAmplitude = function(value) {
        if (_model.setAmplitude(value)) {
            return { success: true };
        } else {
            var ranges = _model.getRanges();
            return { 
                success: false, 
                error: '振幅必须在 ' + ranges.amplitude.min + ' 到 ' + ranges.amplitude.max + ' 之间'
            };
        }
    };
    
    /**
     * 更新周期
     * @param {string} value
     * @returns {Object} {success: boolean, error: string}
     */
    this.updatePeriod = function(value) {
        if (_model.setPeriod(value)) {
            return { success: true };
        } else {
            var ranges = _model.getRanges();
            return { 
                success: false, 
                error: '周期必须在 ' + ranges.period.min + ' 到 ' + ranges.period.max + ' 之间'
            };
        }
    };
    
    /**
     * 更新缓动类型
     * @param {string} type
     * @returns {Object} {success: boolean, error: string}
     */
    this.updateEasingType = function(type) {
        if (_model.setEasingType(type)) {
            return { success: true };
        } else {
            return { 
                success: false, 
                error: '无效的缓动类型'
            };
        }
    };
    
    /**
     * 获取当前参数
     * @returns {Object}
     */
    this.getCurrentParams = function() {
        return _model.getAll();
    };
    
    /**
     * 生成表达式
     * @returns {string}
     */
    this.generateExpression = function() {
        var params = _model.getAll();
        return _generator.generate(
            params.amplitude,
            params.period,
            params.easingType
        );
    };
    
    /**
     * 应用到选中的属性
     * @returns {Object} {success: boolean, message: string, count: number}
     */
    this.applyToSelectedProperties = function() {
        try {
            // 验证参数
            var validation = _model.validate();
            if (!validation.valid) {
                return {
                    success: false,
                    message: '参数验证失败：\n' + validation.errors.join('\n'),
                    count: 0
                };
            }
            
            // 获取当前 AE 项目
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                return {
                    success: false,
                    message: '请先打开一个合成',
                    count: 0
                };
            }
            
            // 获取选中的属性
            var selectedProperties = comp.selectedProperties;
            if (selectedProperties.length === 0) {
                return {
                    success: false,
                    message: '请先选中至少一个属性（如位置、缩放、旋转等）',
                    count: 0
                };
            }
            
            // 生成表达式
            var expression = this.generateExpression();
            
            // 应用到每个选中的属性
            var appliedCount = 0;
            var errors = [];
            
            app.beginUndoGroup('应用 Rive 弹性曲线');
            
            for (var i = 0; i < selectedProperties.length; i++) {
                var prop = selectedProperties[i];
                
                // 检查属性是否可以添加表达式
                if (prop.canSetExpression) {
                    try {
                        // 检查是否有关键帧
                        if (prop.numKeys < 2) {
                            errors.push(prop.name + ': 需要至少 2 个关键帧');
                            continue;
                        }
                        
                        // 启用表达式
                        prop.expressionEnabled = true;
                        
                        // 设置表达式
                        prop.expression = expression;
                        
                        appliedCount++;
                    } catch (e) {
                        errors.push(prop.name + ': ' + e.toString());
                    }
                } else {
                    errors.push(prop.name + ': 不支持表达式');
                }
            }
            
            app.endUndoGroup();
            
            // 返回结果
            if (appliedCount > 0) {
                var message = '成功应用到 ' + appliedCount + ' 个属性';
                if (errors.length > 0) {
                    message += '\n\n部分失败：\n' + errors.join('\n');
                }
                return {
                    success: true,
                    message: message,
                    count: appliedCount
                };
            } else {
                return {
                    success: false,
                    message: '应用失败：\n' + errors.join('\n'),
                    count: 0
                };
            }
            
        } catch (e) {
            return {
                success: false,
                message: '发生错误：' + e.toString(),
                count: 0
            };
        }
    };
    
    /**
     * 重置参数
     */
    this.reset = function() {
        _model.reset();
        if (_view && _view.updateFromModel) {
            _view.updateFromModel(_model.getAll());
        }
    };
    
    /**
     * 获取参数范围
     * @returns {Object}
     */
    this.getRanges = function() {
        return _model.getRanges();
    };
    
    /**
     * 预览表达式（简化版）
     * @returns {string}
     */
    this.previewExpression = function() {
        var params = _model.getAll();
        return _generator.generateSimplified(
            params.amplitude,
            params.period,
            params.easingType
        );
    };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElasticCurveViewModel;
}
