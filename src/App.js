import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { processUrls, getDateRangeDisplay, shortenAddress } from './utils/textUtils';
import { generateMarker } from './utils/markerUtils';
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
      style: 'mapbox://styles/nolastan/cm89id94300fl01sqbb4u07v4?optimize=true',
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
          const { url, cleanedText: updatedDescription } = processUrls(description);
          
          const { displayText, fullDate } = getDateRangeDisplay(start, end);
          const markerElement = document.createElement('div');

          if (name.startsWith('[FUF]')) {
            markerElement.innerHTML = `<img src="fuf-sticker.png" class="w-20 hover:w-24" />`;
            name = name.replace('[FUF]', 'Friends of the Urban Forest: ');
          } else if (name.startsWith('[Sutro]')) {
            markerElement.innerHTML = `<img src="sutro-sticker.png" class="w-20 hover:w-24" />`;
            name = name.replace('[Sutro]', 'Sutro Stewards: ');
          } else if (name.startsWith('[chowder]')) {
            markerElement.innerHTML = `<img src="chowder.png" class="w-12 hover:w-14" />`;
            name = name.replace('[chowder]', '');
          } else if (name.startsWith('[Civic Joy]')) {
            markerElement.innerHTML = `<img src="civic-joy-sticker.png" class="w-10 hover:w-12" />`;
            name = name.replace('[Civic Joy]', '');
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
            }).setHTML(generateMarker(start, fullDate, displayText, name, address, updatedDescription, url)))
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
          markerElement.innerHTML = `<img src="refuse-sticker.png" class="w-20 hover:w-24" />`;

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(generateMarker(start, fullDate, displayText, title, location, description, url)))
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
          markerElement.innerHTML = `<img src="illuminate-sticker.png" class="w-10 hover:w-12" />`;
          const url = "https://illuminate.org/events"

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(generateMarker(start, fullDate, displayText, name, address, description, url)))
            .addTo(map.current);
        });
      });

      // La Cochinita Food
      fetch("https://api.thepark.today/cochinita")
      .then(response => response.json())
      .then(events => {
        events.reverse().filter(event => event.lat !== null).forEach(event => {
          const { title, location, start, end, lat, lng, description, marker, url } = event;
          const { displayText, fullDate } = getDateRangeDisplay(start, end);
          const markerElement = document.createElement('div');
          markerElement.innerHTML = `<img src="${marker}" class="w-12 hover:w-14" />`;

          new mapboxgl.Marker(markerElement, {
            anchor: 'bottom',
            offset: [0, 12]
          })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .setPopup(new mapboxgl.Popup({
              offset: [0, -24]
            }).setHTML(generateMarker(start, fullDate, displayText, title, location, description, url)))
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
