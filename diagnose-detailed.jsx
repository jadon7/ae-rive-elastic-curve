// RiveElasticCurve 详细诊断脚本
// 逐步测试每个组件

(function() {
    var logMessages = [];
    
    function log(msg) {
        logMessages.push(msg);
    }
    
    function showLog() {
        alert(logMessages.join('\n'));
    }
    
    try {
        log("=== 开始诊断 ===");
        log("AE 版本: " + app.version);
        
        // 测试 1: 基本 Window 创建
        log("\n[测试 1] 创建基本窗口...");
        var testWin = new Window('dialog', '测试');
        if (testWin) {
            log("✓ Window 对象创建成功");
            testWin.close();
        } else {
            log("✗ Window 对象创建失败");
            showLog();
            return;
        }
        
        // 测试 2: 添加控件
        log("\n[测试 2] 添加 UI 控件...");
        var testWin2 = new Window('dialog', '测试控件');
        testWin2.add('statictext', undefined, '测试文本');
        testWin2.add('button', undefined, 'OK');
        log("✓ UI 控件添加成功");
        testWin2.close();
        
        // 测试 3: 检查项目状态
        log("\n[测试 3] 检查项目状态...");
        if (!app.project) {
            log("✗ 没有打开的项目");
        } else {
            log("✓ 项目已打开");
            log("  合成数量: " + app.project.numItems);
        }
        
        // 测试 4: 检查选中的属性
        log("\n[测试 4] 检查选中的属性...");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            log("✗ 没有激活的合成");
        } else {
            log("✓ 合成已激活: " + comp.name);
            var selectedProps = comp.selectedProperties;
            log("  选中属性数量: " + selectedProps.length);
        }
        
        // 测试 5: 尝试显示实际窗口
        log("\n[测试 5] 显示测试窗口...");
        var finalWin = new Window('dialog', 'RiveElasticCurve 诊断');
        finalWin.orientation = 'column';
        finalWin.alignChildren = ['fill', 'top'];
        
        var logGroup = finalWin.add('group');
        logGroup.orientation = 'column';
        logGroup.alignChildren = ['left', 'top'];
        
        for (var i = 0; i < logMessages.length; i++) {
            logGroup.add('statictext', undefined, logMessages[i]);
        }
        
        var btnGroup = finalWin.add('group');
        btnGroup.alignment = 'center';
        var btnOK = btnGroup.add('button', undefined, 'OK');
        btnOK.onClick = function() { finalWin.close(); };
        
        log("✓ 窗口构建完成，准备显示...");
        
        // 显示窗口
        var result = finalWin.show();
        log("窗口显示结果: " + result);
        
    } catch(e) {
        log("\n=== 错误发生 ===");
        log("错误消息: " + e.message);
        log("错误行号: " + e.line);
        log("错误详情: " + e.toString());
        showLog();
    }
})();
