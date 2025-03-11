import { shortenAddress } from './textUtils';

export const generateMarker = (start, fullDate, dateDisplayText, name, address, description, url) => {
  return(`
  <div style="pointer-events: auto;">
    <div class="bg-green-900 p-4 relative">
      <time datetime="${new Date(start).toISOString()}" title="${fullDate}" class="text-lg font-medium text-green-200 opacity-80">${dateDisplayText}</time>
      <h2 class="text-xl font-black text-green-50 tracking-tight leading-6">${name}</h2>
    </div>
    <div class="p-4 gap-2 flex flex-col">
      <p class="font-semibold leading-[14px]">
        ${shortenAddress(address)}
      </p>
      <p>${description}</p>
      ${externalLinkIcon(url)}
    </div>
  </div>
  `);
};

const externalLinkIcon = (url) => {
  return(url ? `
    <a href="${url}" target="_blank" class="top-3 right-3 absolute w-6 h-6 hover:text-green-500 focus:outline-none focus-visible:outline-1 focus-visible:outline-green-700 focus-visible:bg-green-800 rounded-full p-1">
      <svg data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
      </svg>
    </a>` : '');
}