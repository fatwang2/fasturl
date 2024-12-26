// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_INPUT') {
    try {
      // 获取当前焦点元素
      const activeElement = document.activeElement;
      
      // 检查元素是否可编辑
      if (activeElement && (
        activeElement.isContentEditable || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'INPUT'
      )) {
        // 更新元素内容
        if (activeElement.isContentEditable) {
          activeElement.innerHTML = message.content;
        } else {
          activeElement.value = message.content;
        }
        
        // 触发 input 事件以通知其他监听器
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        
        sendResponse({ success: true });
      } else {
        sendResponse({ 
          success: false, 
          error: '没有找到可编辑的输入框' 
        });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  // 必须返回 true 以支持异步响应
  return true;
});

console.log('Content script loaded'); 