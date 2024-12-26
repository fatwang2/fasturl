# FastURL

一个用于快速获取网页内容并转换为 Markdown 格式的 Chrome 扩展。

[English](README.md)

## 功能特点

- 快捷键快速提取内容（macOS 使用 ⌥F，Windows/Linux 使用 Alt+F）
- 自动转换为 Markdown 格式
- 智能清理内容（移除广告、导航栏等）
- 剪贴板集成
- 支持多种 HTML 元素（标题、列表、链接等）

## 安装方法

### Chrome 网上应用店（即将上线）
扩展程序目前正在 Chrome 网上应用店审核中。审核通过后，您就可以直接从商店安装。

### 手动安装（商店审核前）
1. 从 [GitHub Releases](https://github.com/fatwang2/fasturl/releases) 下载最新的 ZIP 文件
2. 解压下载的文件
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 在右上角启用"开发者模式"
5. 点击"加载已解压的扩展程序"，选择解压后的文件夹
6. 扩展图标应该会出现在 Chrome 工具栏中

注意：使用开发者模式时，Chrome 会在启动时显示警告消息。这是正常的，您可以安全地忽略它。一旦扩展在 Chrome 网上应用店上架，这个警告就会消失。

## 使用方法

1. 将目标网页的 URL 复制到剪贴板
2. 按下快捷键（macOS 使用 ⌥F，Windows/Linux 使用 Alt+F）获取并转换内容
3. 转换后的 Markdown 内容会自动复制到剪贴板

## 权限说明

扩展需要以下权限：
- `clipboardRead`：读取剪贴板中的 URL
- `clipboardWrite`：将转换后的内容写入剪贴板
- `activeTab`：访问当前标签页
- `notifications`：显示状态通知
- `scripting`：执行内容脚本
- `commands`：支持键盘快捷键

## 开发技术

扩展使用以下技术构建：
- Manifest V3
- ES6+ JavaScript
- Chrome Extensions API

## 错误处理

扩展处理以下错误情况：
- 无效的 URL
- 网络错误
- 权限问题
- 内容解析失败

## 许可证

MIT 许可证 