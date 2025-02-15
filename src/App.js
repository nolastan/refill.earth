import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { processUrls } from './utils/textUtils';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.446747);
  const [lat, setLat] = useState(37.775);
  const [zoom, setZoom] = useState(12.5);

  useEffect(() => {
    if (map.current) return; // initialize map only once
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

    fetch("https://api.thepark.today/")
      .then(response => response.json())
      .then(data => {
        const { shops } = data;
        shops.forEach(shop => {
          const { name, address, start, description, lat, lng, image, website } = shop;
          const image_tag = image ? `<img src="${image}" alt="" style="width: 100%; aspect-ratio: 2; object-fit: cover; border-radius: 3px;" />` : '';
          const { url, cleanedText: updatedDescription } = processUrls(description);

          const date = new Date(start);
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
          const fullDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

          new mapboxgl.Marker()
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="bg-green-900 p-4 relative">
                <time datetime="${date.toISOString()}" title="${fullDate}" class="text-lg font-medium text-green-200 opacity-80">${dayOfWeek}</time>
                <h2 class="text-xl font-black text-green-50 tracking-tight leading-6">${name}</h2>
              </div>
              <div class="p-4 gap-2 flex flex-col">
                <p class="font-semibold leading-[14px]">
                  ${address}
                </p>
                <p>${updatedDescription}</p>
                ${url ? `<a href="${url}" target="_blank" class="top-3 right-3 absolute w-6 h-6 hover:text-green-500 focus:outline-none focus-visible:outline-1 focus-visible:outline-green-700 focus-visible:bg-green-800 rounded-full p-1">
                  <svg data-slot="icon" fill="none" stroke-width="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                  </svg>
                </a>` : ''}
              </div>
              ${image_tag}
            `))
            .addTo(map.current);
        });
      });
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
}
