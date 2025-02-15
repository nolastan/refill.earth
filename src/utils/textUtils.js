/**
 * Processes text content to remove URLs while also returning them separately
 * @param {string} text - The input text that may contain URLs or HTML links
 * @returns {Object} - Object containing cleaned text and extracted URLs
 */
export const processUrls = (text) => {
    // Handle both HTML links and plain text URLs
    const htmlLinkRegex = /<a\b[^>]*href="([^"]*)"[^>]*>.*?<\/a>/g;
    const plainUrlRegex = /(https?:\/\/[^\s]+)/g;
    
    let cleanedText = text;
    let urls = [];
  
    // First try to extract URLs from HTML links
    let htmlMatch;
    const htmlMatches = [...text.matchAll(htmlLinkRegex)];
    if (htmlMatches.length > 0) {
      // Extract URLs from href attributes
      urls = htmlMatches.map(match => match[1]);
      // Remove entire HTML link tags
      cleanedText = text.replace(htmlLinkRegex, '');
    } else {
      // If no HTML links, look for plain URLs
      const plainMatches = [...text.matchAll(plainUrlRegex)];
      if (plainMatches.length > 0) {
        urls = plainMatches.map(match => match[0]);
        cleanedText = text.replace(plainUrlRegex, '');
      }
    }
  
    // Return first URL and cleaned text (maintaining backward compatibility)
    return {
      url: urls[0] || '',
      cleanedText: cleanedText.trim()
    };
  };
