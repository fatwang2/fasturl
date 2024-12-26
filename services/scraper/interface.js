// 定义爬虫错误类型
class ScraperError extends Error {
  constructor(message, type = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ScraperError';
    this.type = type;
  }
}

// 错误类型常量
const ERROR_TYPES = {
  INVALID_URL: 'INVALID_URL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SCRAPE_ERROR: 'SCRAPE_ERROR'
};

// 爬虫接口类
class ScraperInterface {
  /**
   * 验证并规范化URL
   * @param {string} url - 要验证的URL
   * @returns {string} - 规范化后的URL
   * @throws {ScraperError} - 如果URL格式无效
   */
  validateUrl(url) {
    if (!url) {
      throw new ScraperError('URL cannot be empty', ERROR_TYPES.INVALID_URL);
    }

    // 移除首尾空格
    url = url.trim();

    try {
      // 如果没有协议，添加https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // 尝试创建URL对象来验证
      const urlObject = new URL(url);

      // 检查是否有效的主机名
      if (!urlObject.hostname) {
        throw new ScraperError('Invalid domain name', ERROR_TYPES.INVALID_URL);
      }

      // 返回规范化的URL
      return urlObject.href;
    } catch (e) {
      console.error('URL validation error:', e);
      throw new ScraperError('Invalid URL format. Please ensure the URL is correct', ERROR_TYPES.INVALID_URL);
    }
  }

  /**
   * 爬取URL内容
   * @param {string} url - 要爬取的URL
   * @returns {Promise<string>} - 返回爬取的内容
   * @throws {ScraperError} - 如果爬取过程中出现错误
   */
  async scrape(url) {
    throw new Error('Method not implemented');
  }
}

export { ScraperInterface, ScraperError, ERROR_TYPES }; 