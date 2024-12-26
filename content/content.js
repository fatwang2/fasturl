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
      console.log('Found input elements:', {
        count: inputs.length,
        types: Array.from(inputs).map(input => ({
          tag: input.tagName,
          type: input.type,
          editable: input.isContentEditable
        }))
      });

      // 优先选择真实的输入框
      const lastFocusedInput = Array.from(inputs).find(input => {
        // 优先选择 INPUT 或 TEXTAREA
        if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
          const rect = input.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }
        // 其次选择可编辑的 DIV
        return input.isContentEditable && input.offsetParent !== null;
      });

      if (lastFocusedInput) {
        console.log('Found target input:', {
          tag: lastFocusedInput.tagName,
          type: lastFocusedInput.type,
          isContentEditable: lastFocusedInput.isContentEditable,
          value: lastFocusedInput.value || lastFocusedInput.textContent
        });

        // 聚焦到输入框
        lastFocusedInput.focus();
        
        // 根据元素类型选择不同的粘贴方式
        if (lastFocusedInput.isContentEditable) {
          // 对于可编辑 DIV
          lastFocusedInput.textContent = message.content;
        } else {
          // 对于 INPUT 和 TEXTAREA
          lastFocusedInput.value = message.content;
        }
        
        // 触发 input 事件
        lastFocusedInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Content updated successfully');
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