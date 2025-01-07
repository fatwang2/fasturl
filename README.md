# FastURL

A Chrome extension for quickly fetching and converting web content to Markdown format.

[中文文档](README_zh.md)

## Features

- Quick content extraction with keyboard shortcut (⌥F on macOS, Alt+F on Windows/Linux)
- Automatic conversion to Markdown format
- Smart content cleaning (removes ads, navigation, etc.)
- Clipboard integration
- Support for various HTML elements (headings, lists, links, etc.)

## Installation

### Chrome Web Store
Search `FastURL` ，or click [link](https://chromewebstore.google.com/detail/fasturl/gkciolabmnjpnngdgoeljpdpaddbjbhj) to install

## Usage

1. Copy a URL to your clipboard
2. Press ⌥F (macOS) or Alt+F (Windows/Linux) to fetch and convert the content
3. The converted Markdown content will be automatically copied to your clipboard

## Permissions

The extension requires the following permissions:
- `clipboardRead`: To read URLs from clipboard
- `clipboardWrite`: To write converted content to clipboard
- `activeTab`: To access the current tab
- `notifications`: To show status notifications
- `scripting`: To execute content scripts
- `commands`: To support keyboard shortcuts

## Development

The extension is built with:
- Manifest V3
- ES6+ JavaScript
- Chrome Extensions API

## Error Handling

The extension handles various error cases:
- Invalid URLs
- Network errors
- Permission issues
- Content parsing failures

## License

MIT License 