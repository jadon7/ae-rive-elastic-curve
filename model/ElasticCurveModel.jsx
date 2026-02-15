// ElasticCurveModel.jsx
// Model 层：存储弹性曲线参数

/**
 * Rive 弹性曲线模型
 * @constructor
 */
function ElasticCurveModel() {
    // 私有属性
    var _amplitude = 1.0;
    var _period = 0.5;
    var _easingType = 'easeOut';
    
    // 参数范围
    var AMPLITUDE_MIN = 0.1;
    var AMPLITUDE_MAX = 10.0;
    var PERIOD_MIN = 0.1;
    var PERIOD_MAX = 5.0;
    var EASING_TYPES = ['easeIn', 'easeOut', 'easeInOut'];
    
    /**
     * 获取振幅
     * @returns {number}
     */
    this.getAmplitude = function() {
        return _amplitude;
    };
    
    /**
     * 设置振幅
     * @param {number} value
     * @returns {boolean} 是否设置成功
     */
    this.setAmplitude = function(value) {
        var num = parseFloat(value);
        if (isNaN(num) || num < AMPLITUDE_MIN || num > AMPLITUDE_MAX) {
            return false;
        }
        _amplitude = num;
        return true;
    };
    
    /**
     * 获取周期
     * @returns {number}
     */
    this.getPeriod = function() {
        return _period;
    };
    
    /**
     * 设置周期
     * @param {number} value
     * @returns {boolean} 是否设置成功
     */
    this.setPeriod = function(value) {
        var num = parseFloat(value);
        if (isNaN(num) || num < PERIOD_MIN || num > PERIOD_MAX) {
            return false;
        }
        _period = num;
        return true;
    };
    
    /**
     * 获取缓动类型
     * @returns {string}
     */
    this.getEasingType = function() {
        return _easingType;
    };
    
    /**
     * 设置缓动类型
     * @param {string} type
     * @returns {boolean} 是否设置成功
     */
    this.setEasingType = function(type) {
        if (EASING_TYPES.indexOf(type) === -1) {
            return false;
        }
        _easingType = type;
        return true;
    };
    
    /**
     * 获取所有参数
     * @returns {Object}
     */
    this.getAll = function() {
        return {
            amplitude: _amplitude,
            period: _period,
            easingType: _easingType
        };
    };
    
    /**
     * 重置为默认值
     */
    this.reset = function() {
        _amplitude = 1.0;
        _period = 0.5;
        _easingType = 'easeOut';
    };
    
    /**
     * 验证所有参数
     * @returns {Object} {valid: boolean, errors: Array}
     */
    this.validate = function() {
        var errors = [];
        
        if (_amplitude < AMPLITUDE_MIN || _amplitude > AMPLITUDE_MAX) {
            errors.push('振幅必须在 ' + AMPLITUDE_MIN + ' 到 ' + AMPLITUDE_MAX + ' 之间');
        }
        
        if (_period < PERIOD_MIN || _period > PERIOD_MAX) {
            errors.push('周期必须在 ' + PERIOD_MIN + ' 到 ' + PERIOD_MAX + ' 之间');
        }
        
        if (EASING_TYPES.indexOf(_easingType) === -1) {
            errors.push('无效的缓动类型');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    };
    
    /**
     * 获取参数范围
     * @returns {Object}
     */
    this.getRanges = function() {
        return {
            amplitude: { min: AMPLITUDE_MIN, max: AMPLITUDE_MAX },
            period: { min: PERIOD_MIN, max: PERIOD_MAX },
            easingTypes: EASING_TYPES
        };
    };
}

// 导出（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElasticCurveModel;
}
