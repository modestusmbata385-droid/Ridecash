import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RideMap({ pickup, destination, driver }: any) {
  const ref = useRef<WebView>(null);

  const html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0}</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
 var map=L.map('map').setView([${pickup?.lat || -6.8},${pickup?.lng || 39.28}],14);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

 var pickupIcon=L.divIcon({html:'🟢',iconSize:[24,24]});
 var destIcon=L.divIcon({html:'⚫',iconSize:[24,24]});
 var carIcon=L.divIcon({html:'🚗',iconSize:[28,28]});

 ${pickup ? `L.marker([${pickup.lat},${pickup.lng}],{icon:pickupIcon}).addTo(map);` : ''}
 ${destination ? `L.marker([${destination.lat},${destination.lng}],{icon:destIcon}).addTo(map);` : ''}

 var driverMarker=null;
 function updateDriver(lat,lng){
   if(!driverMarker){
     driverMarker=L.marker([lat,lng],{icon:carIcon}).addTo(map);
   }else{
     driverMarker.setLatLng([lat,lng]);
   }
 }
 ${driver ? `updateDriver(${driver.lat},${driver.lng});` : ''}
</script>
</body></html>`;

  useEffect(() => {
    if (driver && ref.current) {
      ref.current.injectJavaScript(
        `updateDriver(${driver.lat},${driver.lng});true;`
      );
    }
  }, [driver]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
