import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

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

    fetch(process.env.REACT_APP_API_URL)
      .then(response => response.json())
      .then(data => {
        const { shops } = data;
        shops.forEach(shop => {
          const { name, address, start, description, lat, lng, image, website } = shop;
          const image_tag = image ? `<img src="${image}" alt="" style="width: 100%; aspect-ratio: 2; object-fit: cover; border-radius: 3px;" />` : '';
          const date = new Date(start).toLocaleDateString('en-US', { weekday: 'long' })
          new mapboxgl.Marker()
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="bg-green-900 p-4">
                <p class="text-lg font-medium text-green-200 opacity-80">${date}</p>
                <h2 class="text-xl font-semibold text-green-50 tracking-tight leading-6">${name}</h2>
              </div>
              <div class="p-4">
                <p><em>${address}</em></p>
                <p>${description}</p>
                ${website ? `<a href="${website}" target="_blank">Visit Website</a>` : ''}
              </div>
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
