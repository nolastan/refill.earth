import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = 'pk.eyJ1Ijoibm9sYXN0YW4iLCJhIjoiY2lrMXBqaThrMDNicXR1bTA2YmhlOXNldSJ9.JM66zf6O9v1gLgbrQZfrHA';

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

    fetch('https://api.refill.earth/')
      .then(response => response.json())
      .then(data => {
        const { shops } = data;
        shops.forEach(shop => {
          const { name, address, lat, lng, image, website } = shop;
          new mapboxgl.Marker()
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <img src="${image}" alt="" style="width: 100%; aspect-ratio: 2; object-fit: cover; border-radius: 3px;" />
              <h3>${name}</h3>
              <p>${address}</p>
              <a href="${website}" target="_blank">Visit Website</a>
            `))
            .addTo(map.current);
        });
      });
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}