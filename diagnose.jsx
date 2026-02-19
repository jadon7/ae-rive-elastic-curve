// AE 脚本诊断工具
// 用于检测脚本执行环境和错误

(function() {
    try {
        // 1. 检测 AE 版本
        alert("AE 版本: " + app.version + "\n" +
              "构建号: " + app.buildNumber + "\n" +
              "语言: " + app.isoLanguage);
        
        // 2. 检测脚本执行权限
        var prefs = app.preferences;
        var allowScripts = prefs.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
        alert("脚本权限设置: " + allowScripts + "\n" +
              "(0=禁止, 1=允许访问网络, 2=允许访问文件)");
        
        // 3. 测试基本 UI 创建
        alert("开始测试 UI 创建...");
        
        var win = new Window('dialog', '测试窗口');
        win.add('statictext', undefined, '如果你看到这个窗口，说明 UI 可以正常创建！');
        var btnOK = win.add('button', undefined, 'OK');
        btnOK.onClick = function() { win.close(); };
        
        alert("UI 创建成功，即将显示窗口...");
        win.show();
        
        alert("测试完成！");
        
    } catch(e) {
        alert("错误发生:\n" +
              "消息: " + e.message + "\n" +
              "行号: " + e.line + "\n" +
              "详情: " + e.toString());
    }
})();
