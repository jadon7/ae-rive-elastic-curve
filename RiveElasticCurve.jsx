// RiveElasticCurve.jsx
// 主入口：组装 MVVM 架构并启动插件

/**
 * Rive 弹性曲线插件
 * 版本: 1.0.0
 * 作者: Personal
 * 描述: 将 Rive 弹性曲线应用到 After Effects 关键帧
 */

(function() {
    // 获取脚本所在目录
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    
    /**
     * 加载外部 JSX 文件
     * @param {string} relativePath - 相对路径
     */
    function loadScript(relativePath) {
        var file = new File(scriptFolder.fsName + '/' + relativePath);
        if (file.exists) {
            $.evalFile(file.fsName);
        } else {
            alert('无法找到文件: ' + file.fsName);
            throw new Error('Missing file: ' + relativePath);
        }
    }
    
    /**
     * 初始化插件
     */
    function init() {
        try {
            // 检查 AE 版本
            if (parseFloat(app.version) < 23.0) {
                alert('此插件需要 After Effects 2023 或更高版本');
                return;
            }
            
            // 加载依赖文件
            loadScript('model/ElasticCurveModel.jsx');
            loadScript('viewmodel/ExpressionGenerator.jsx');
            loadScript('viewmodel/ElasticCurveViewModel.jsx');
            loadScript('view/ElasticCurveView.jsx');
            
            // 创建 MVVM 实例
            var model = new ElasticCurveModel();
            var generator = new ExpressionGenerator();
            var viewModel = new ElasticCurveViewModel(model, generator);
            var view = new ElasticCurveView(viewModel);
            
            // 绑定 View 到 ViewModel
            viewModel.bindView(view);
            
            // 构建并显示 UI
            view.build();
            view.show();
            
        } catch (e) {
            alert('插件初始化失败：\n' + e.toString() + '\n\n' + e.line);
        }
    }
    
    // 启动插件
    init();
    
})();
