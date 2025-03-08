/**
 * Processes text content to remove URLs while also returning them separately
 * @param {string} text - The input text that may contain URLs or HTML links
 * @returns {Object} - Object containing cleaned text and extracted URLs
 */

export const getDateRangeDisplay = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Check if it's an all-day event by seeing if it's at midnight UTC
  const isAllDayEvent = start.includes('T00:00:00.000Z');

  // Only add timezone offset for all-day events
  let adjustedStartDate, adjustedEndDate;
  if (isAllDayEvent) {
    const offset = startDate.getTimezoneOffset() * 60000;
    adjustedStartDate = new Date(startDate.getTime() + offset);
    adjustedEndDate = new Date(endDate.getTime() + offset);
  } else {
    adjustedStartDate = startDate;
    adjustedEndDate = endDate;
  }
  
  // Calculate the difference in days
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffDays = Math.round(Math.abs((adjustedEndDate - adjustedStartDate) / oneDay));
  
  // Format options
  const weekdayFormat = { weekday: 'long' };
  const longMonthDayFormat = { month: 'long', day: 'numeric' };
  const fullDateFormat = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Get full date for both start and end
  const startFullDate = adjustedStartDate.toLocaleDateString('en-US', fullDateFormat);
  const endFullDate = adjustedEndDate.toLocaleDateString('en-US', fullDateFormat);
  
  let displayText;
  
  // For one day event: print day of week (Monday)
  if (diffDays === 0) {
    displayText = adjustedStartDate.toLocaleDateString('en-US', weekdayFormat);
  } 
  // For 2 day event: (Monday & Tuesday)
  else if (diffDays === 1) {
    const startDayOfWeek = adjustedStartDate.toLocaleDateString('en-US', weekdayFormat);
    const endDayOfWeek = adjustedEndDate.toLocaleDateString('en-US', weekdayFormat);
    displayText = `${startDayOfWeek} & ${endDayOfWeek}`;
  } 
  // For 3 day event: (Monday – Wednesday)
  else if (diffDays === 2) {
    const startDayOfWeek = adjustedStartDate.toLocaleDateString('en-US', weekdayFormat);
    const endDayOfWeek = adjustedEndDate.toLocaleDateString('en-US', weekdayFormat);
    displayText = `${startDayOfWeek} to ${endDayOfWeek}`;
  } 
  // For 4+ day event: print month and day (Feb 10 – 20)
  else {
    const startMonthDay = adjustedStartDate.toLocaleDateString('en-US', longMonthDayFormat);
    const endMonthDay = adjustedEndDate.toLocaleDateString('en-US', longMonthDayFormat);
    displayText = `${startMonthDay} to ${endMonthDay}`;
  }
  
  return { 
    dayOfWeek: adjustedStartDate.toLocaleDateString('en-US', weekdayFormat), 
    fullDate: startFullDate,
    endFullDate: endFullDate,
    displayText: displayText
  };
}

export const shortenAddress = (address) => {
  // Handle multi-line addresses by joining with commas
  address = address.replace(/\n/g, ', ');
  
  // Remove ZIP codes (both 5-digit and 5+4 digit formats)
  address = address.replace(/\b\d{5}(-\d{4})?\b/g, '');
  
  // Remove "San Francisco" (case insensitive)
  address = address.replace(/\bSan Francisco\b/gi, '');
  
  // Remove "CA" and "California" (case insensitive)
  address = address.replace(/\b(CA|California)\b/gi, '');
  
  // Remove "USA" and "United States" (with or without comma)
  address = address.replace(/,?\s*(USA|United States)\b/gi, '');
  
  // Clean up excess commas and spaces
  address = address.replace(/,\s*,/g, ',');     // Double commas
  address = address.replace(/\s+/g, ' ');       // Multiple spaces
  address = address.replace(/,\s*$/g, '');      // Trailing comma
  address = address.replace(/^\s*,\s*/g, '');   // Leading comma
  
  // Additional cleanup for any remaining patterns of excess commas
  // Repeat the comma cleanup to catch any new consecutive commas
  address = address.replace(/,\s*,/g, ',');
  
  // Final pass to remove any trailing/leading commas again
  address = address.replace(/,\s*$/g, '');
  address = address.replace(/^\s*,\s*/g, '');
  
  return address.trim();
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
