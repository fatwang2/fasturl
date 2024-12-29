import ChromeScraper from '/services/scraper/chrome.js';

const scraper = new ChromeScraper();

// 创建并显示通知
function showNotification(message, isError = false) {
  const notificationId = 'fasturl-' + Date.now();
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: '/icons/icon48.png',
    title: isError ? 'Error' : 'FastURL',
    message: message
  }, (id) => {
    console.log('Notification created:', id);
  });
}

// 在当前标签页执行剪贴板读取
async function readClipboard() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{result}] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        document.execCommand('paste');
        const text = textarea.value;
        document.body.removeChild(textarea);
        return text.trim();
      }
    });
    return result;
  } catch (error) {
    console.error('Clipboard read error:', error);
    throw new Error('Failed to read clipboard');
  }
}

// 在当前标签页执行剪贴板写入
async function writeClipboard(text) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [text],
      func: (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    });
  } catch (error) {
    console.error('Clipboard write error:', error);
    throw new Error('Failed to write to clipboard');
  }
}

// 向content script发送消息
async function sendMessageToContentScript(tabId, message) {
  try {
    console.log('Sending message to content script:', {
      tabId,
      messageType: message.type,
      contentLength: message.content?.length
    });
    
    // 直接发送消息
    const response = await chrome.tabs.sendMessage(tabId, message);
    console.log('Message sent, response:', response);
    return response;
  } catch (error) {
    console.error('Failed to send message to content script:', error);
    throw error;
  }
}

// 处理快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  if (command === 'fetch-url') {
    try {
      // 获取当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      // 获取剪贴板内容
      const url = await readClipboard();
      console.log('URL from clipboard:', url);
      
      // 爬取内容
      const content = await scraper.scrape(url);
      console.log('Scraped content length:', content.length);
      
      // 保存到剪贴板
      await writeClipboard(content);
      
      // 通知content script更新当前输入框
      await sendMessageToContentScript(tab.id, {
        type: 'UPDATE_INPUT',
        content: content
      });
      
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('clipboard')) {
        showNotification('Failed to access clipboard', true);
      } else if (error.message.includes('URL')) {
        showNotification('Invalid URL', true);
      } else {
        showNotification('Failed to fetch content', true);
      }
    }
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // 检查快捷键注册状态
    const commands = await chrome.commands.getAll();
    console.log('Registered commands:', commands);
    
    const fetchCommand = commands.find(cmd => cmd.name === 'fetch-url');
    console.log('Fetch command status:', fetchCommand);
    
    showNotification('FastURL installed. Press ⌥F to fetch URL content');
  }
}); 