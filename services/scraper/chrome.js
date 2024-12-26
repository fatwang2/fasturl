import { ScraperInterface, ScraperError, ERROR_TYPES } from './interface.js';

/**
 * 需要移除的元素选择器
 * 用于清理页面中的非内容元素
 */
const ELEMENTS_TO_REMOVE = [
  // 基础清理
  'script', 'style', 'iframe', 'nav', 'header', 'footer',
  'noscript', '[role="banner"]', '[role="navigation"]',
  
  // UI元素
  'button', '.dialog', '.popup', '.modal',
  '[role="dialog"]', '[role="button"]',
  
  // 交互元素
  '[onclick]',
  'a[href^="javascript:"]',
  '.share-buttons', '.social-buttons',
  
  // 会话相关
  '[role="alert"]',
  '.flash-notice',
  '.session-authentication-page',
  '.js-notification-shelf',
  '.js-skip-to-content',
  '.auth-form',
  '.session-authentication',
  
  // 添加更多会话和认证相关选择器
  '[data-testid*="session"]',
  '[data-testid*="auth"]',
  '[class*="session"]',
  '[class*="auth"]',
  '[id*="session"]',
  '[id*="auth"]',
  '.notification',
  '.alert',
  '[role="status"]',
  
  // 添加更多选择器
  '.session-status',
  '.session-message',
  '.auth-status',
  '.auth-message',
  '[data-refresh-url]',  // 刷新相关的元素
  '[data-reload-url]'    // 重载相关的元素
];

class ChromeScraper extends ScraperInterface {
  async scrape(url) {
    try {
      // ==================== URL 处理和请求部分 ====================
      console.log('Original URL:', url);
      const validUrl = this.validateUrl(url);
      console.log('Validated URL:', validUrl);

      // 使用fetch API获取内容
      console.log('Fetching URL...');
      const response = await fetch(validUrl, {
        method: 'GET',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'User-Agent': navigator.userAgent,
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }
      });
      
      // ==================== 响应处理部分 ====================
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new ScraperError(
            '访问被拒绝，该网站可能不允许直接访问',
            ERROR_TYPES.PERMISSION_ERROR
          );
        }
        throw new ScraperError(
          `获取内容失败: ${response.status} ${response.statusText}`,
          ERROR_TYPES.NETWORK_ERROR
        );
      }

      const html = await response.text();
      console.log('Response content length:', html.length);

      // ==================== 内容解析部分 ====================
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Starting content parsing in tab:', tab.id);

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (html, elementsToRemove) => {
          try {
            console.log('Parsing HTML in content script...');
            const doc = new DOMParser().parseFromString(html, 'text/html');
            console.log('Created DOM document');

            /**
             * HTML转Markdown的核心函数
             * 递归处理DOM元素，生成Markdown格式的文本
             */
            function htmlToMarkdown(element) {
              let md = '';
              
              switch (element.tagName?.toLowerCase()) {
                // 标题处理
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                  const level = element.tagName[1];
                  md += '#'.repeat(level) + ' ' + element.textContent.trim() + '\n';
                  break;
                
                // 段落处理
                case 'p':
                  md += element.textContent.trim() + '\n';
                  break;
                
                // 列表处理
                case 'ul':
                  md += '\n';
                  element.querySelectorAll('li').forEach(li => {
                    md += '* ' + li.textContent.trim() + '\n';
                  });
                  md += '\n';
                  break;
                
                case 'ol':
                  element.querySelectorAll('li').forEach((li, index) => {
                    md += `${index + 1}. ${li.textContent.trim()}\n`;
                  });
                  break;
                
                // 链接处理
                case 'a':
                  if (element.href) {
                    md += `[${element.textContent.trim()}](${element.href})`;
                  } else {
                    md += element.textContent.trim();
                  }
                  break;
                
                // 文本样式
                case 'strong':
                case 'b':
                  md += `**${element.textContent.trim()}**`;
                  break;
                
                case 'em':
                case 'i':
                  md += `*${element.textContent.trim()}*`;
                  break;
                
                // 代码处理
                case 'code':
                  md += '`' + element.textContent.trim() + '`';
                  break;
                
                case 'pre':
                  md += '```\n' + element.textContent.trim() + '\n```\n';
                  break;
                
                // 引用处理
                case 'blockquote':
                  md += '> ' + element.textContent.trim().replace(/\n/g, '\n> ') + '\n';
                  break;
                
                // 分隔线
                case 'hr':
                  md += '---\n';
                  break;
                
                case 'br':
                  md += '\n';
                  break;
                
                // 默认处理
                default:
                  if (element.childNodes && element.childNodes.length > 0) {
                    for (const child of element.childNodes) {
                      if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.textContent.trim();
                        if (text) md += text + ' ';
                      } else if (child.nodeType === Node.ELEMENT_NODE) {
                        md += htmlToMarkdown(child);
                      }
                    }
                  } else {
                    const text = element.textContent.trim();
                    if (text) md += text + ' ';
                  }
              }
              
              return md;
            }

            /**
             * Markdown文本清理函数
             * 处理格式化和移除不需要的内容
             */
            function cleanMarkdown(markdown) {
              return markdown
                // 先清理特殊文本
                .replace(/\*\*[^*]+\*\*Public/g, '')
                .replace(/\*[^*]+subscription status[^*]*\*/g, '')
                .replace(/\[.*?\]\(javascript:.*?\)/g, '')
                .replace(/×|✕|✖/g, '')
                .replace(/\s*[,，]\s*/g, '，')
                .replace(/([，。！？；：])\1+/g, '$1')
                // 清理连续的空白字符（包括空格、制表符等）
                .replace(/[ \t]+/g, ' ')
                // 清理连续的换行（保留段落格式）
                .replace(/\n\s*\n\s*\n+/g, '\n\n')
                .trim();
            }

            /**
             * 内容提取的主函数
             * 处理DOM清理和Markdown转换
             */
            function extractContent(doc) {
              const clone = doc.cloneNode(true);
              
              // 移除不需要的元素
              elementsToRemove.forEach(selector => {
                clone.querySelectorAll(selector).forEach(el => el.remove());
              });

              // 获取并清理标题
              const title = doc.title?.trim()
                .replace(/\s+/g, ' ')
                .replace(/\*\*[^*]+\*\*Public/, '')
                .replace(/\*[^*]+subscription status[^*]*\*/, '')
                .trim();

              // 转换内容
              const markdown = htmlToMarkdown(clone.body);
              
              // 使用 JSON.stringify 和 parse 来确保换行符被正确处理
              const cleanedMarkdown = cleanMarkdown(markdown)

              // 组合标题和内容，确保正确的换行
              const contentWithTitle = title ? 
                `# ${title}\n\n${cleanedMarkdown}` : 
                cleanedMarkdown;

              return {
                title: title,
                content: contentWithTitle
              };
            }

            // 执行内容提取
            const article = extractContent(doc);
            console.log('Parsing result:', {
              title: article.title,
              length: article.content.length
            });
            
            return {
              success: true,
              content: article.content,
              title: article.title
            };
          } catch (error) {
            console.error('Parsing error:', error);
            return {
              success: false,
              content: html,
              error: error.message
            };
          }
        },
        args: [html, ELEMENTS_TO_REMOVE]
      });

      // ==================== 结果处理部分 ====================
      console.log('Parse result:', result);

      if (result?.success) {
        console.log('Successfully parsed article:', {
          title: result.title,
          contentLength: result.content.length
        });
        return result.content;
      } else {
        console.log('Falling back to original HTML');
        return html;
      }
    } catch (error) {
      console.error('Scraping error:', error);
      
      if (error instanceof ScraperError) {
        throw error;
      }
      
      // 处理其他类型的错误
      if (error.name === 'TypeError') {
        throw new ScraperError(
          '网络请求失败，该网站可能不允许跨域访问',
          ERROR_TYPES.NETWORK_ERROR
        );
      }

      throw new ScraperError(
        '获取内容失败，请稍后重试',
        ERROR_TYPES.SCRAPE_ERROR
      );
    }
  }
}

export default ChromeScraper; 