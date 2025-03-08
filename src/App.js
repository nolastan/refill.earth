import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { processUrls, getDateRangeDisplay, shortenAddress } from './utils/textUtils';
import FloatingActionButton from './FloatingActionButton';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.446747);
  const [lat, setLat] = useState(37.775);
  const [zoom, setZoom] = useState(12.5);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // Create tooltip div
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute w-screen left-0 right-0 bottom-0 whitespace-nowrap text-center hidden mb-5';
    document.body.appendChild(tooltip);
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/nolastan/cl3nhkh9y001114mql0e3j8fj?optimize=true',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    fetch("https://api.thepark.today/")
      .then(response => response.json())
      .then(data => {
        const { shops } = data;
        shops.forEach(shop => {
          let { name, address, start, end, description, lat, lng, image, emoji } = shop;
          const image_tag = image ? `<img src="${image}" alt="" style="width: 100%; aspect-ratio: 2; object-fit: cover; border-radius: 3px;" />` : '';
          const { url, cleanedText: updatedDescription } = processUrls(description);
          
          const { displayText, fullDate } = getDateRangeDisplay(start, end);
          const markerElement = document.createElement('div');

          if (name.startsWith('[FUF]')) {
            markerElement.innerHTML = `<img src="fuf-sticker.png" class="h-12 hover:h-14" />`;
            name = name.replace('[FUF]', 'Friends of the Urban Forest: ');
          } else {
            markerElement.innerHTML = `<span class="text-4xl hover:text-5xl">${emoji || '📍'}</span>`;
          } 

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(`
              <div style="pointer-events: auto;">
                <div class="bg-green-900 p-4 relative">
                  <time datetime="${new Date(start).toISOString()}" title="${fullDate}" class="text-lg font-medium text-green-200 opacity-80">${displayText}</time>
                  <h2 class="text-xl font-black text-green-50 tracking-tight leading-6">${name}</h2>
                </div>
                <div class="p-4 gap-2 flex flex-col">
                  <p class="font-semibold leading-[14px]">
                    ${shortenAddress(address)}
                  </p>
                  <p>${updatedDescription}</p>
                  ${url ? `<a href="${url}" target="_blank" class="top-3 right-3 absolute w-6 h-6 hover:text-green-500 focus:outline-none focus-visible:outline-1 focus-visible:outline-green-700 focus-visible:bg-green-800 rounded-full p-1">
                    <svg data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                    </svg>
                  </a>` : ''}
                </div>
              </div>
              ${image_tag}
            `))
            .addTo(map.current);
        });
      });

    fetch("https://api.thepark.today/cleanups")
      .then(response => response.json())
      .then(shops => {
        shops.forEach(shop => {
          const { title, location, start, end, url, lat, lng, description } = shop;
          const { displayText, fullDate } = getDateRangeDisplay(start, end);
          const markerElement = document.createElement('div');
          markerElement.innerHTML = `<span class="text-xl hover:text-2xl">
            <img src="https://img1.wsimg.com/isteam/ip/fad50d2f-ac5a-4f12-a65f-fc1d7ccf7f33/RefuseRefuseLogoVersions_R3_White.png/:/rs=w:562,h:200,cg:true,m/cr=w:562,h:200/qt=q:95" class="h-6 bg-green-700 p-0.5 rounded bg-opacity-70 hover:bg-opacity-100" />
          </span>`;

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(`
              <div style="pointer-events: auto;">
                <div class="bg-green-900 p-4 relative">
                  <time datetime="${new Date(start).toISOString()}" title="${fullDate}" class="text-lg font-medium text-green-200 opacity-80">${displayText}</time>
                  <h2 class="text-xl font-black text-green-50 tracking-tight leading-6">${title}</h2>
                </div>
                <div class="p-4 gap-2 flex flex-col">
                  <p class="font-semibold leading-[14px]">
                    ${location}
                  </p>
                  <p>${description}</p>
                  ${url ? `<a href="${url}" target="_blank" class="top-3 right-3 absolute w-6 h-6 hover:text-green-500 focus:outline-none focus-visible:outline-1 focus-visible:outline-green-700 focus-visible:bg-green-800 rounded-full p-1">
                    <svg data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                    </svg>
                  </a>` : ''}
                </div>
              </div>
            `))
            .addTo(map.current);
        });
      });

      fetch("https://api.thepark.today/illuminate")
      .then(response => response.json())
      .then(shops => {
        shops.reverse().forEach(shop => {
          const { name, address, start, end, lat, lng, description } = shop;
          const { displayText, fullDate } = getDateRangeDisplay(start, end);
          const markerElement = document.createElement('div');
          markerElement.innerHTML = `<svg viewBox="0 0 725 725" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-10 bg-green-700 p-1 rounded-full bg-opacity-50 hover:bg-opacity-100">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M341.424.514c-16.023.806-42.924 4.605-59.248 8.367l-9.249 2.131.496 5.161c.273 2.84 1.193 12.586 2.044 21.661.852 9.075 2.878 25.825 4.503 37.223 1.624 11.398 2.954 21.15 2.954 21.67 0 .52-3.038 1.936-6.75 3.148-9.001 2.939-26.703 10.149-34.169 13.918-7.004 3.536-7.662 3.637-8.392 1.291-.299-.962-3.982-11.65-8.184-23.75-4.202-12.1-9.835-29.588-12.519-38.863-2.683-9.275-5.105-17.089-5.381-17.365-.672-.672-23.221 11.244-34.817 18.4-9.957 6.143-25.788 17.126-25.788 17.89 0 2.63 27.926 53.841 37.865 69.438l4.142 6.5-7.754 6.953c-8.779 7.874-18.75 17.746-25.127 24.88L151.73 184l-2.528-2.333c-4.958-4.577-25.718-28.62-39.574-45.833-7.749-9.625-14.4-17.5-14.782-17.5-2.35 0-28.365 33.571-39.04 50.381l-5.323 8.382 4.97 4.403c8.917 7.899 37.694 30.83 49.971 39.818 6.6 4.832 12.345 9.092 12.767 9.468.422.375-1.657 5.827-4.619 12.115-2.963 6.288-7.532 17.118-10.153 24.067l-4.767 12.633-4.614-1.981c-10.14-4.355-47.379-23.194-59.614-30.159-7.15-4.07-13.308-7.113-13.685-6.763-2.5 2.323-16.774 58.988-16.806 66.717-.008 1.804 1.945 2.696 14.741 6.729 18.732 5.903 42.4 12.593 57.545 16.265l11.795 2.859-.738 5.533c-.405 3.043-.713 14.875-.683 26.293l.055 20.761-9.612-.572c-20.946-1.245-50.203-3.639-61.112-4.999-17.773-2.216-16.284-2.82-15.53 6.3 1.82 22.05 7.975 60.924 10.221 64.559 1.133 1.834 63.501-4.737 84.458-8.898 2.506-.497 2.771-.157 4.887 6.282 3.364 10.233 9.549 25.534 13.473 33.325 1.92 3.813 3.491 7.295 3.491 7.738 0 .443-1.463 1.372-3.25 2.064-10.013 3.879-43.754 15.058-59.697 19.779-10.146 3.004-18.67 5.686-18.945 5.96-1.947 1.947 32.91 60.441 36.016 60.441 2.818 0 42.436-21.287 64.376-34.589l12-7.276 4.381 5.183c2.41 2.85 10.615 11.332 18.234 18.849l13.853 13.668-9.234 8.39c-15.731 14.294-25.513 22.619-41.156 35.028-8.293 6.578-15.205 12.293-15.36 12.7-.873 2.289 38.596 32.584 54.146 41.563l4.864 2.808 3.415-3.912c7.736-8.864 30.735-37.826 40.231-50.662 5.595-7.562 10.396-13.75 10.669-13.75.273 0 4.632 2.077 9.686 4.615 9.174 4.608 28.745 12.607 34.102 13.939 1.557.387 3.05 1.274 3.317 1.972.603 1.57-19.509 42.83-30.452 62.474-4.442 7.975-7.766 14.796-7.386 15.158 3.129 2.984 58.065 16.815 66.883 16.839 1.965.005 13.894-37.936 21.326-67.829 2.096-8.432 3.962-15.463 4.146-15.623.184-.16 5.735.136 12.335.658 6.6.523 18.259.667 25.909.322l13.908-.629-.636 15.434c-.7 16.957-3.037 44.328-5.178 60.651-.756 5.764-1.237 10.619-1.068 10.787.541.541 25.398-1.709 36.408-3.295 5.861-.845 15.512-2.516 21.447-3.714l10.79-2.178-.613-7.041c-1.901-21.849-3.838-39.042-6.199-55.04-1.462-9.9-2.682-19.512-2.713-21.36l-.055-3.36 15-5.216c8.25-2.869 19.036-7.065 23.97-9.325l8.97-4.11 1.818 4.686c4.373 11.269 15.885 46.056 20.248 61.185 2.616 9.075 4.876 16.64 5.021 16.812.366.433 19.305-9.117 28.973-14.61 6.179-3.511 25.056-15.57 31.793-20.31 1.605-1.128-15.589-33.814-33.512-63.708-4.391-7.323-7.825-13.412-7.632-13.531 2.947-1.814 15.101-12.735 25.351-22.779l13-12.738 10.265 11.319c12.474 13.756 31.163 35.941 39.484 46.872l6.131 8.054 6.883-7.44c10.974-11.864 30.682-38.063 38.036-50.561 1.006-1.71-39.032-34.313-60.817-49.523l-7.32-5.111 4.831-9.123c4.889-9.233 11.264-23.77 14.634-33.373 1.013-2.888 2.198-5.25 2.634-5.25 2.8 0 55.671 26.526 71.652 35.949 2.931 1.728 5.447 3.009 5.59 2.846.144-.162 2.307-6.595 4.808-14.295 4.899-15.086 8.554-28.989 11.173-42.5.906-4.675 1.86-9.245 2.119-10.155.379-1.33-1.647-2.35-10.316-5.195-17.631-5.786-27.598-8.666-50.787-14.676l-22-5.702.5-9.386c.275-5.162.5-16.981.5-26.264v-16.878l13 .667c25.367 1.302 59.474 4.33 70.25 6.237l3.25.575-.001-4.862c-.002-12.449-4.282-45.91-7.848-61.361l-1.731-7.5-5.46.296c-14.738.797-60.749 6.277-79.705 9.493-.772.131-3.167-5.445-6.301-14.665-2.781-8.182-7.031-19.1-9.443-24.263l-4.386-9.386 3.187-1.331c11.802-4.927 60.277-20.758 75.385-24.62l4.198-1.073-2.893-6.447c-5.987-13.343-20.481-38.109-29.688-50.729l-3.447-4.725-11.184 5.592c-15.155 7.578-30.103 15.844-49.035 27.116-8.718 5.191-16.173 9.057-16.565 8.59-12.24-14.543-18.477-21.423-25.916-28.587l-9.074-8.739 11.371-10.382c12.895-11.776 37.757-32.675 47.751-40.14 3.682-2.75 6.714-5.302 6.739-5.67.077-1.128-20.622-18.596-32.372-27.319-13.068-9.702-25.422-17.739-26.613-17.314-1.707.61-24.634 28.837-38.879 47.868l-14.646 19.565-14.493-7.065c-7.971-3.886-18.847-8.661-24.169-10.612l-9.677-3.547 13.274-26.953c11.796-23.952 18.625-36.942 24.769-47.12L489.984 23l-5.78-2.176c-17.088-6.432-61.53-17.205-63.278-15.338-1.793 1.916-12.178 36.271-19.412 64.22-2.472 9.551-4.684 17.555-4.916 17.787-.231.232-7.565-.102-16.298-.742-8.732-.64-20.334-.876-25.782-.525l-9.906.638.674-15.765c.738-17.263 2.996-43.849 5.068-59.662.728-5.557 1.128-10.44.888-10.853-.24-.412-1.197-.665-2.127-.56-.93.103-4.391.324-7.691.49Zm1.722 112.569c-.153 13.888.072 33.269.5 43.068l.778 17.816 18.702.184 18.703.183 1.148-7c5.375-32.757 13.477-74.122 15.002-76.59.642-1.038 2.365-1.04 9.118-.014 8.577 1.303 37.831 8.44 40.276 9.825 1.083.614-.378 4.906-6.904 20.279-6.61 15.569-23.545 59.031-23.545 60.424 0 .174 3.487 1.552 7.75 3.062 4.263 1.51 11.995 4.726 17.183 7.147 5.188 2.421 9.737 4.056 10.11 3.634.372-.422 5.981-9.317 12.464-19.767 10.285-16.578 31.277-48.441 33.491-50.835.425-.459 2.286-.059 4.137.89 5.688 2.917 25.961 17.058 33.647 23.47l7.283 6.075-21.283 21.239c-11.705 11.682-25.22 25.55-30.034 30.818l-8.751 9.578 13.261 13.393 13.262 13.392 11.99-8.799c18.604-13.653 58.323-39.942 59.37-39.295 2.65 1.638 27.12 40.843 27.12 43.451 0 .348-2.812 1.714-6.25 3.035-19.75 7.59-72.75 30.702-72.75 31.724 0 .228 1.519 3.44 3.375 7.139 1.856 3.699 5.052 11.225 7.1 16.725 2.049 5.5 3.828 10.11 3.953 10.244.125.134 8.742-1.78 19.149-4.255 22.002-5.231 64.462-13.783 65.127-13.118 1.719 1.718 7.293 31.162 8.829 46.629l.645 6.5-39.07.134c-21.489.073-40.992.422-43.339.774l-4.269.641V381.786l2.5.497c1.375.273 10.825 1.881 21 3.572 18.478 3.072 50.162 9.196 57.25 11.067 3.172.836 3.749 1.407 3.741 3.701-.014 4.293-5.437 29.85-8.365 39.417l-2.664 8.707-4.481-1.957a3341.783 3341.783 0 0 1-9.231-4.05c-12.724-5.61-64.981-25.906-66.701-25.906-.153 0-1.302 3.038-2.552 6.75-2.641 7.845-9.684 24.159-11.243 26.042-.635.767-.7 1.625-.162 2.11.5.45 9.458 6.125 19.908 12.613 25.844 16.043 51.5 33.443 51.5 34.927 0 1.765-15.992 25.598-22.749 33.902a3532.312 3532.312 0 0 0-6.751 8.316c-.743.927-8.123-5.789-28.711-26.126-15.242-15.055-29.224-28.527-31.072-29.936l-3.36-2.563-13.175 13.085c-7.801 7.748-12.896 13.553-12.492 14.232.375.632 5.064 7.273 10.42 14.759 5.356 7.486 15.939 22.957 23.518 34.381l13.779 20.772-2.953 2.395c-10.4 8.435-40.102 26.163-41.39 24.704-.418-.475-2.705-5.813-5.082-11.863-8.61-21.917-28.303-66.5-29.375-66.5-.252 0-4.137 1.779-8.634 3.954-4.497 2.174-12.102 5.358-16.901 7.075l-8.726 3.121 4.319 18.175c4.299 18.093 11.541 52.945 12.852 61.85l.688 4.675-3.853 1.085c-7.243 2.042-22.968 5.025-33.414 6.339l-10.438 1.314-.531-42.742c-.292-23.507-.742-42.928-1-43.157-.258-.229-8.845-.194-19.083.077l-18.614.493-2.196 14.12c-2.888 18.568-12.938 68.883-13.964 69.909-1.163 1.163-19.312-1.818-36.271-5.958l-14.659-3.579 3.53-8.125c10.249-23.596 29.102-72.364 28.183-72.9-.217-.127-4.881-1.724-10.364-3.549-5.483-1.826-13.155-4.791-17.048-6.59l-7.079-3.27-8.339 13.591c-10.659 17.373-38.305 59.092-39.158 59.092-1.702 0-23.497-14.035-33.729-21.72l-11.484-8.626 10.828-10.077c5.955-5.542 19.765-19.485 30.69-30.984l19.862-20.908-3.787-3.041c-2.083-1.672-8.325-7.463-13.87-12.868l-10.084-9.828-9.416 6.849c-23.086 16.791-59.698 41.203-61.796 41.203-2.12 0-27.21-37.182-28.38-42.058-.132-.553 4.777-2.984 10.911-5.404 14.571-5.747 41.505-17.276 53.965-23.099 5.436-2.54 10.904-5.02 12.152-5.511l2.269-.893-4.531-9.02c-2.491-4.962-5.914-12.507-7.605-16.768-1.692-4.261-3.214-7.887-3.383-8.057-.168-.171-8.117 1.547-17.663 3.817-17.241 4.1-58.658 12.591-64.307 13.183-2.717.285-3.055-.044-4.246-4.144-2.79-9.605-6.307-27.082-7.604-37.796l-1.362-11.25 38.082-.009c20.944-.004 40.389-.286 43.209-.625l5.129-.616-.129-18.379c-.107-15.402-.371-18.45-1.628-18.814-.825-.24-5.1-.956-9.5-1.592-12.934-1.869-38.7-6.648-57.318-10.631l-17.319-3.705.662-5.064c1.963-15.023 8.942-45.565 10.411-45.565.359 0 7.832 3.089 16.608 6.864s25.631 10.547 37.456 15.047c11.825 4.501 22.528 8.61 23.784 9.13 1.632.677 2.41.592 2.728-.297.245-.684 1.999-5.744 3.897-11.244 1.899-5.5 4.752-12.907 6.341-16.46l2.888-6.46-16.069-9.892c-14.26-8.778-49.906-32.223-54.977-36.158-1.834-1.424-1.66-1.892 4.497-12.099 3.522-5.841 10.388-15.947 15.257-22.459l8.853-11.84 24.22 24.184c13.322 13.301 27.378 26.977 31.236 30.391l7.015 6.207 5.632-6.761c3.098-3.719 8.797-9.817 12.665-13.551 3.868-3.734 7.033-6.946 7.033-7.138 0-.191-3.889-5.662-8.643-12.156-10.202-13.939-39.357-57.666-39.357-59.029 0-2.304 39.086-28.279 42.554-28.279.71 0 1.844 1.688 2.521 3.75 4.226 12.889 31.694 75.617 32.831 74.98 4.408-2.472 24.871-11.899 28.848-13.29 3.842-1.344 5.125-2.255 4.772-3.389-3.015-9.701-15.195-66.261-17.053-79.187l-.666-4.636 12.847-3.059c13.563-3.23 33.981-6.575 42.846-7.02l3-.15-.278 25.25Z" fill="#fff"/>
            </svg>
          `;
          const url = "https://illuminate.org/events"

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(`
              <div style="pointer-events: auto;">
                <div class="bg-green-900 p-4 relative">
                  <time datetime="${new Date(start).toISOString()}" title="${fullDate}" class="text-lg font-medium text-green-200 opacity-80">${displayText}</time>
                  <h2 class="text-xl font-black text-green-50 tracking-tight leading-6">${name}</h2>
                </div>
                <div class="p-4 gap-2 flex flex-col">
                  <p class="font-semibold leading-[14px]">
                    ${address}
                  </p>
                  <p>${description}</p>
                  ${url ? `<a href="${url}" target="_blank" class="top-3 right-3 absolute w-6 h-6 hover:text-green-500 focus:outline-none focus-visible:outline-1 focus-visible:outline-green-700 focus-visible:bg-green-800 rounded-full p-1">
                    <svg data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                    </svg>
                  </a>` : ''}
                </div>
              </div>
            `))
            .addTo(map.current);
        });
      });

    fetch("https://api.thepark.today/parks")
      .then(response => response.json())
      .then(parks => {
        // Convert parks data to GeoJSON with polygons
        const geojson = {
          type: 'FeatureCollection',
          features: parks.map(park => ({
            type: 'Feature',
            geometry: park.shape || {
              // Fallback to point if no shape available
              type: 'Point',
              coordinates: [park.longitude, park.latitude]
            },
            properties: {
              name: park.property_name,
              acres: park.acres || 1,
              id: park.property_id
            }
          }))
        };
  
        // Add the parks source
        map.current.addSource('parks', {
          type: 'geojson',
          data: geojson
        });
  
        // Add fill layer for parks
        map.current.addLayer({
          id: 'parks-fill',
          type: 'fill',
          source: 'parks',
          paint: {
            'fill-opacity': 0
          }
        });
  
        // Helper function to calculate center of a MultiPolygon
        const calculateCenter = (geometry) => {
          let coordinates;
          
          switch (geometry.type) {
            case 'MultiPolygon':
              coordinates = geometry.coordinates[0][0];
              break;
            case 'Polygon':
              coordinates = geometry.coordinates[0];
              break;
            case 'Point':
              return geometry.coordinates;
            default:
              console.log('Unexpected geometry type:', geometry.type);
              return null;
          }
        
          // Calculate the center by averaging all points
          if (coordinates && coordinates.length > 0) {
            const center = coordinates.reduce((sum, coord) => {
              return [sum[0] + coord[0], sum[1] + coord[1]];
            }, [0, 0]);
            return [
              center[0] / coordinates.length,
              center[1] / coordinates.length
            ];
          }
          return null;
        };

        mapContainer.current.addEventListener('mousemove', (e) => {
          const features = map.current.queryRenderedFeatures(
            [e.offsetX, e.offsetY],
            { layers: ['parks-fill'] }
          );
          
          if (features.length === 0) {
            // No park under toast, hide tooltip
            tooltip.classList.add('hidden');
          } else {
            // Update park name toast
            tooltip.innerHTML = `<div class="bg-green-700 bg-opacity-60 py-1 px-2 rounded text-xs z-50 text-green-50 font-medium inline-block">${features[0].properties.name}</div>`;
            tooltip.classList.remove('hidden');
          }
        });
      });
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="w-screen h-screen relative" />
      <FloatingActionButton />
    </div>
  );
}
