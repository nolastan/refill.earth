/**
 * Processes text content to remove URLs while also returning them separately
 * @param {string} text - The input text that may contain URLs or HTML links
 * @returns {Object} - Object containing cleaned text and extracted URLs
 */

export const getDayOfWeek = (start) => {
  const date = new Date(start);
  
  // Check if it's an all-day event by seeing if it's at midnight UTC
  const isAllDayEvent = start.includes('T00:00:00.000Z');

  // Only add timezone offset for all-day events
  let adjustedDate;
  if (isAllDayEvent) {
      const offset = date.getTimezoneOffset() * 60000;
      adjustedDate = new Date(date.getTime() + offset);
  } else {
      adjustedDate = date;
  }
  
  const dayOfWeek = adjustedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = adjustedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return { dayOfWeek, fullDate };  
}

export const shortenAddress = (address) => {
  if (!address) return '';
  
  // Look for first number or "San Francisco"
  const numberMatch = address.match(/\d+/);
  const sfMatch = address.toLowerCase().indexOf('san francisco');
  
  // Get the earlier of the two matches
  let endIndex = address.length;
  if (numberMatch) endIndex = Math.min(endIndex, numberMatch.index);
  if (sfMatch !== -1) endIndex = Math.min(endIndex, sfMatch);
  
  // Get everything before the match
  const locationName = address.substring(0, endIndex).trim();
  
  // Remove trailing comma and whitespace
  return locationName.replace(/,\s*$/, '');
}



export const processUrls = (text) => {
    // Handle both HTML links and plain text URLs
    const htmlLinkRegex = /<a\b[^>]*href="([^"]*)"[^>]*>.*?<\/a>/g;
    const plainUrlRegex = /(https?:\/\/[^\s]+)/g;
    
    let cleanedText = text;
    let urls = [];
  
    // First try to extract URLs from HTML links
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
