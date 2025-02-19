/**
 * Preset categories of user agents to block
 */
export type BlockerPresetCategory = 'ai-search-bots' | 'ai-crawl-bots' | 'open-data-crawlers';

/**
 * Predefined patterns for each preset category
 */
export const PRESET_PATTERNS: Record<BlockerPresetCategory, string[]> = {
    'ai-search-bots': [
      'Applebot',
      'Applebot-Extended',
      'DuckAssistBot',
      'Google-Extended',
      'GoogleOther',
      'GoogleOther-Image',
      'GoogleOther-Video',
      'OAI-SearchBot',
      'PerplexityBot',
      'PetalBot',
      'YouBot',
      'ChatGPT-User',
      'cohere-ai',
      'PerplexityBot'
    ],
    'ai-crawl-bots': [
      'AI2Bot',
      'Ai2Bot-Dolma',
      'Amazonbot',
      'anthropic-ai',
      'Claude-Web',
      'ClaudeBot',
      'cohere-ai',
      'cohere-training-data-crawler',
      'Crawlspace',
      'Diffbot',
      'FacebookBot',
      'FriendlyCrawler',
      'GPTBot',
      'ICCCrawler',
      'ImagesiftBot',
      'img2dataset',
      'Kangaroo Bot',
      'Meta-ExternalAgent',
      'Meta-ExternalFetcher',
      'omgili',
      'omgilibot',
      'PanguBot',
      'Scrapy',
      'Sidetrade indexer bot',
      'Timpibot',
      'VelenPublicWebCrawler',
      'Webzio-Extended',
      'Bytespider',
      'iaskspider/2.0',
      'ISSCyberRiskCrawler'
    ],
    'open-data-crawlers': [
      'CCBot'
    ],
  };
/**
 * Gets all user agent patterns for the specified preset categories
 * @param categories Array of preset categories to get patterns for
 * @returns Array of user agent patterns
 */
export function getPatternsForPresets(categories: BlockerPresetCategory[]): string[] {
  return categories.flatMap(category => PRESET_PATTERNS[category]);
}
