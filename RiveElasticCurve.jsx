// RiveElasticCurve.jsx
// 主入口：组装 MVVM 架构并启动插件
// 版本: 1.0.1 - 修复文件加载问题

/**
 * Rive 弹性曲线插件
 * 版本: 1.0.1
 * 作者: Personal
 * 描述: 将 Rive 弹性曲线应用到 After Effects 关键帧
 */

(function() {
    // 获取脚本所在目录
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    
    // 调试信息
    var DEBUG = true;
    
    function log(message) {
        if (DEBUG) {
            $.writeln('[RiveElasticCurve] ' + message);
        }
    }
    
    log('脚本路径: ' + scriptFile.fsName);
    log('脚本目录: ' + scriptFolder.fsName);
    
    /**
     * 加载外部 JSX 文件
     * @param {string} relativePath - 相对路径
     */
    function loadScript(relativePath) {
        var file = new File(scriptFolder.fsName + '/' + relativePath);
        log('尝试加载: ' + file.fsName);
        
        if (file.exists) {
            log('文件存在，开始加载...');
            try {
                $.evalFile(file.fsName);
                log('加载成功: ' + relativePath);
            } catch (e) {
                alert('加载文件时出错: ' + relativePath + '\n错误: ' + e.toString());
                throw e;
            }
        } else {
            var errorMsg = '无法找到文件: ' + file.fsName + '\n\n请确认文件结构：\nRiveElasticCurve/\n├── RiveElasticCurve.jsx\n├── model/\n│   └── ElasticCurveModel.jsx\n├── viewmodel/\n│   ├── ExpressionGenerator.jsx\n│   └── ElasticCurveViewModel.jsx\n└── view/\n    └── ElasticCurveView.jsx';
            alert(errorMsg);
            throw new Error('Missing file: ' + relativePath);
        }
    }
    
    /**
     * 初始化插件
     */
    function init() {
        try {
            log('开始初始化插件...');
            
            // 检查 AE 版本
            log('AE 版本: ' + app.version);
            if (parseFloat(app.version) < 23.0) {
                alert('此插件需要 After Effects 2023 或更高版本\n当前版本: ' + app.version);
                return;
            }
            
            // 加载依赖文件
            log('加载 Model 层...');
            loadScript('model/ElasticCurveModel.jsx');
            
            log('加载 ExpressionGenerator...');
            loadScript('viewmodel/ExpressionGenerator.jsx');
            
            log('加载 ViewModel 层...');
            loadScript('viewmodel/ElasticCurveViewModel.jsx');
            
            log('加载 View 层...');
            loadScript('view/ElasticCurveView.jsx');
            
            log('所有文件加载完成');
            
            // 验证构造函数是否存在
            if (typeof ElasticCurveModel !== 'function') {
                throw new Error('ElasticCurveModel 未定义或不是函数');
            }
            if (typeof ExpressionGenerator !== 'function') {
                throw new Error('ExpressionGenerator 未定义或不是函数');
            }
            if (typeof ElasticCurveViewModel !== 'function') {
                throw new Error('ElasticCurveViewModel 未定义或不是函数');
            }
            if (typeof ElasticCurveView !== 'function') {
                throw new Error('ElasticCurveView 未定义或不是函数');
            }
            
            log('所有构造函数验证通过');
            
            // 创建 MVVM 实例
            log('创建 Model 实例...');
            var model = new ElasticCurveModel();
            
            log('创建 ExpressionGenerator 实例...');
            var generator = new ExpressionGenerator();
            
            log('创建 ViewModel 实例...');
            var viewModel = new ElasticCurveViewModel(model, generator);
            
            log('创建 View 实例...');
            var view = new ElasticCurveView(viewModel);
            
            // 绑定 View 到 ViewModel
            viewModel.bindView(view);
            
            log('构建 UI...');
            // 构建并显示 UI
            view.build();
            view.show();
            
            log('插件初始化成功！');
            
        } catch (e) {
            var errorMsg = '插件初始化失败：\n' + e.toString();
            if (e.line) {
                errorMsg += '\n行号: ' + e.line;
            }
            if (e.fileName) {
                errorMsg += '\n文件: ' + e.fileName;
            }
            alert(errorMsg);
            log('错误详情: ' + errorMsg);
        }
    }
    
    // 启动插件
    init();
    
})();
