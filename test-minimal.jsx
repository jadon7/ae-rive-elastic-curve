// 最简化测试 - 只显示一个窗口
// 如果这个都不显示，说明 AE 脚本执行有问题

alert("脚本开始执行");

try {
    var win = new Window('dialog', 'RiveElasticCurve 测试', undefined, {closeButton: true});
    
    win.add('statictext', undefined, '如果你看到这个窗口，说明基本功能正常！');
    win.add('statictext', undefined, 'AE 版本: ' + app.version);
    
    var btn = win.add('button', undefined, 'OK');
    btn.onClick = function() {
        win.close();
    };
    
    alert("窗口创建完成，准备显示");
    win.show();
    alert("窗口已关闭");
    
} catch(e) {
    alert("错误:\n" + e.toString() + "\n行号: " + e.line);
}
