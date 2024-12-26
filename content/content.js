// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', {
    type: message.type,
    contentLength: message.content?.length
  });

  if (message.type === 'UPDATE_INPUT') {
    try {
      console.log('Attempting to paste content...');
      
      // 获取所有可能的输入元素
      const inputs = document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]');
      console.log('Found input elements:', inputs.length);

      // 找到最近获得焦点的输入框
      const lastFocusedInput = Array.from(inputs).find(input => {
        const rect = input.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(input).display !== 'none';
      });

      if (lastFocusedInput) {
        console.log('Found target input:', {
          tag: lastFocusedInput.tagName,
          type: lastFocusedInput.type,
          isVisible: lastFocusedInput.offsetParent !== null
        });

        // 聚焦到输入框
        lastFocusedInput.focus();
        
        // 触发粘贴事件
        const clipboardEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: new DataTransfer()
        });
        
        clipboardEvent.clipboardData.setData('text/plain', message.content);
        lastFocusedInput.dispatchEvent(clipboardEvent);
        console.log('Paste event triggered with content');
      } else {
        console.log('No suitable input element found');
      }
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true;
});

console.log('Content script loaded and ready'); 