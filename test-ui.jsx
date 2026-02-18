// test-ui.jsx
// 简单的 UI 测试脚本，用于验证窗口显示是否正常

/**
 * 测试 dialog 窗口
 */
function testDialogWindow() {
    var win = new Window('dialog', 'UI 测试 - Dialog 模式');
    win.orientation = 'column';
    win.alignChildren = ['fill', 'top'];
    win.spacing = 10;
    win.margins = 16;

    // 添加标题
    var title = win.add('statictext', undefined, 'Dialog 窗口测试');
    title.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 14);

    // 添加说明文本
    var info = win.add('statictext', undefined, '如果你能看到这个窗口，说明 dialog 模式工作正常！', {multiline: true});
    info.preferredSize.width = 300;

    // 添加按钮
    var btnGroup = win.add('group');
    btnGroup.orientation = 'row';
    btnGroup.alignChildren = ['center', 'center'];

    var okBtn = btnGroup.add('button', undefined, '确定');
    okBtn.onClick = function() {
        alert('Dialog 窗口测试成功！');
        win.close();
    };

    var cancelBtn = btnGroup.add('button', undefined, '取消');
    cancelBtn.onClick = function() {
        win.close();
    };

    // 显示窗口
    win.center();
    win.show();
}

/**
 * 测试 palette 窗口（对比）
 */
function testPaletteWindow() {
    var win = new Window('palette', 'UI 测试 - Palette 模式');
    win.orientation = 'column';
    win.alignChildren = ['fill', 'top'];
    win.spacing = 10;
    win.margins = 16;

    // 添加标题
    var title = win.add('statictext', undefined, 'Palette 窗口测试');
    title.graphics.font = ScriptUI.newFont('dialog', 'BOLD', 14);

    // 添加说明文本
    var info = win.add('statictext', undefined, 'Palette 窗口在"运行脚本文件"模式下可能不显示', {multiline: true});
    info.preferredSize.width = 300;

    // 添加按钮
    var closeBtn = win.add('button', undefined, '关闭');
    closeBtn.onClick = function() {
        win.close();
    };

    // 显示窗口
    win.center();
    win.show();
}

// 主测试函数
function runTest() {
    try {
        $.writeln('=== UI 窗口类型测试 ===');
        $.writeln('AE 版本: ' + app.version);
        $.writeln('');

        // 询问用户要测试哪种窗口类型
        var choice = confirm(
            'UI 窗口类型测试\n\n' +
            '点击"是"测试 Dialog 窗口（推荐用于脚本文件）\n' +
            '点击"否"测试 Palette 窗口（用于面板）\n\n' +
            'Dialog 窗口应该在"运行脚本文件"模式下正常显示'
        );

        if (choice) {
            $.writeln('测试 Dialog 窗口...');
            testDialogWindow();
            $.writeln('Dialog 窗口测试完成');
        } else {
            $.writeln('测试 Palette 窗口...');
            testPaletteWindow();
            $.writeln('Palette 窗口测试完成');
        }

    } catch (e) {
        var errorMsg = '测试失败：\n' + e.toString();
        if (e.line) {
            errorMsg += '\n行号: ' + e.line;
        }
        alert(errorMsg);
        $.writeln('错误: ' + errorMsg);
    }
}

// 运行测试
runTest();
