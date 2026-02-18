// ElasticCurveView.jsx
// View 层：创建 UI 面板并处理用户交互

/**
 * Rive 弹性曲线 View
 * @constructor
 * @param {ElasticCurveViewModel} viewModel - ViewModel 实例
 */
function ElasticCurveView(viewModel) {
    var _viewModel = viewModel;
    var _window = null;
    var _controls = {};
    
    /**
     * 构建 UI
     * @returns {Window}
     */
    this.build = function() {
        // 创建对话框窗口（使用 dialog 而非 palette 以支持"运行脚本文件"方式）
        _window = new Window('dialog', 'Rive Elastic Curve', undefined, {
            resizeable: false
        });
        
        _window.orientation = 'column';
        _window.alignChildren = ['fill', 'top'];
        _window.spacing = 10;
        _window.margins = 16;
        
        // 标题
        var titleGroup = _window.add('group');
        titleGroup.orientation = 'row';
        titleGroup.alignChildren = ['left', 'center'];
        var titleText = titleGroup.add('statictext', undefined, 'Rive 弹性曲线');
        titleText.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 14);
        
        // 分隔线
        _window.add('panel', undefined, '', {borderStyle: 'black'});
        
        // 参数输入区域
        var paramsGroup = _window.add('group');
        paramsGroup.orientation = 'column';
        paramsGroup.alignChildren = ['fill', 'top'];
        paramsGroup.spacing = 8;
        
        // 振幅输入
        var amplitudeGroup = paramsGroup.add('group');
        amplitudeGroup.orientation = 'row';
        amplitudeGroup.alignChildren = ['left', 'center'];
        amplitudeGroup.add('statictext', undefined, '振幅 (Amplitude):');
        _controls.amplitudeInput = amplitudeGroup.add('edittext', undefined, '1.0');
        _controls.amplitudeInput.characters = 8;
        _controls.amplitudeInput.helpTip = '范围: 0.1 - 10.0';
        
        // 周期输入
        var periodGroup = paramsGroup.add('group');
        periodGroup.orientation = 'row';
        periodGroup.alignChildren = ['left', 'center'];
        periodGroup.add('statictext', undefined, '周期 (Period):    ');
        _controls.periodInput = periodGroup.add('edittext', undefined, '0.5');
        _controls.periodInput.characters = 8;
        _controls.periodInput.helpTip = '范围: 0.1 - 5.0';
        
        // 缓动类型下拉菜单
        var easingGroup = paramsGroup.add('group');
        easingGroup.orientation = 'row';
        easingGroup.alignChildren = ['left', 'center'];
        easingGroup.add('statictext', undefined, '缓动类型:         ');
        _controls.easingDropdown = easingGroup.add('dropdownlist', undefined, [
            'Ease Out',
            'Ease In',
            'Ease In-Out'
        ]);
        _controls.easingDropdown.selection = 0; // 默认 Ease Out
        _controls.easingDropdown.preferredSize.width = 120;
        
        // 分隔线
        _window.add('panel', undefined, '', {borderStyle: 'black'});
        
        // 按钮区域
        var buttonGroup = _window.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignChildren = ['center', 'center'];
        buttonGroup.spacing = 10;
        
        _controls.applyButton = buttonGroup.add('button', undefined, '应用到选中关键帧');
        _controls.applyButton.preferredSize.width = 150;
        
        _controls.resetButton = buttonGroup.add('button', undefined, '重置');
        _controls.resetButton.preferredSize.width = 80;
        
        // 状态文本
        _controls.statusText = _window.add('statictext', undefined, '就绪', {
            multiline: true
        });
        _controls.statusText.preferredSize.height = 40;
        _controls.statusText.graphics.foregroundColor = _window.graphics.newPen(
            _window.graphics.PenType.SOLID_COLOR,
            [0.5, 0.5, 0.5],
            1
        );
        
        // 绑定事件
        this._bindEvents();
        
        return _window;
    };
    
    /**
     * 绑定事件处理器
     * @private
     */
    this._bindEvents = function() {
        var self = this;
        
        // 振幅输入变化
        _controls.amplitudeInput.onChange = function() {
            var result = _viewModel.updateAmplitude(this.text);
            if (!result.success) {
                self.showError(result.error);
                this.text = _viewModel.getCurrentParams().amplitude.toString();
            }
        };
        
        // 周期输入变化
        _controls.periodInput.onChange = function() {
            var result = _viewModel.updatePeriod(this.text);
            if (!result.success) {
                self.showError(result.error);
                this.text = _viewModel.getCurrentParams().period.toString();
            }
        };
        
        // 缓动类型变化
        _controls.easingDropdown.onChange = function() {
            var easingTypes = ['easeOut', 'easeIn', 'easeInOut'];
            var type = easingTypes[this.selection.index];
            _viewModel.updateEasingType(type);
        };
        
        // 应用按钮
        _controls.applyButton.onClick = function() {
            self.showStatus('正在应用...', 'info');
            
            var result = _viewModel.applyToSelectedProperties();
            
            if (result.success) {
                self.showStatus(result.message, 'success');
            } else {
                self.showError(result.message);
            }
        };
        
        // 重置按钮
        _controls.resetButton.onClick = function() {
            _viewModel.reset();
            self.updateFromModel(_viewModel.getCurrentParams());
            self.showStatus('已重置为默认值', 'info');
        };
    };
    
    /**
     * 显示状态信息
     * @param {string} message
     * @param {string} type - 'info' | 'success' | 'error'
     */
    this.showStatus = function(message, type) {
        _controls.statusText.text = message;
        
        var color;
        switch (type) {
            case 'success':
                color = [0, 0.6, 0]; // 绿色
                break;
            case 'error':
                color = [0.8, 0, 0]; // 红色
                break;
            default:
                color = [0.5, 0.5, 0.5]; // 灰色
        }
        
        _controls.statusText.graphics.foregroundColor = _window.graphics.newPen(
            _window.graphics.PenType.SOLID_COLOR,
            color,
            1
        );
    };
    
    /**
     * 显示错误信息
     * @param {string} message
     */
    this.showError = function(message) {
        this.showStatus(message, 'error');
        alert(message);
    };
    
    /**
     * 从 Model 更新 UI
     * @param {Object} params
     */
    this.updateFromModel = function(params) {
        _controls.amplitudeInput.text = params.amplitude.toString();
        _controls.periodInput.text = params.period.toString();
        
        var easingIndex = {
            'easeOut': 0,
            'easeIn': 1,
            'easeInOut': 2
        }[params.easingType] || 0;
        
        _controls.easingDropdown.selection = easingIndex;
    };
    
    /**
     * 显示窗口
     */
    this.show = function() {
        if (_window) {
            _window.center();
            // 对于 dialog 类型窗口，使用 show() 会阻塞执行直到窗口关闭
            // 这是正确的行为，适合"运行脚本文件"方式
            _window.show();
        }
    };
    
    /**
     * 关闭窗口
     */
    this.close = function() {
        if (_window) {
            _window.close();
        }
    };
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElasticCurveView;
}
