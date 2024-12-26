import ChromeScraper from '/services/scraper/chrome.js';

const scraper = new ChromeScraper();

// 创建并显示通知
function showNotification(message, isError = false) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icon.png',
    title: isError ? 'Error' : 'Success',
    message: message
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
    // 先尝试注入content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content.js']
    });
    
    // 等待一小段时间确保content script加载完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 发送消息
    await chrome.tabs.sendMessage(tabId, message);
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
      
      showNotification('内容已获取并复制到剪贴板');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, true);
    }
  }
}); 