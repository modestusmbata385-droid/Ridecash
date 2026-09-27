import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import PrimaryButton from './PrimaryButton';
import { colors, radius } from '../theme';

type LatLng = { lat: number; lng: number };

export default function LocationPicker({
  visible,
  title,
  initialRegion,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  initialRegion: LatLng;
  onConfirm: (loc: LatLng & { address: string }) => void;
  onClose: () => void;
}) {
  const webRef = useRef<WebView>(null);
  const [center, setCenter] = useState(initialRegion);
  const [address, setAddress] = useState('Sogeza ramani kuchagua eneo...');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const debounce = useRef<any>(null);

  useEffect(() => {
    if (visible) reverse(initialRegion);
  }, [visible]);

  async function reverse(loc: LatLng) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&accept-language=en`,
        { headers: { 'User-Agent': 'RideCash-App' } }
      );
      const d = await r.json();
      setAddress(d.display_name || 'Eneo');
    } catch {}
  }

  async function search(text: string) {
    setQuery(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.length < 3) return setResults([]);

    debounce.current = setTimeout(async () => {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=tz&limit=6`,
        { headers: { 'User-Agent': 'RideCash-App' } }
      );
      setResults(await r.json());
    }, 500);
  }

  const html = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0}</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
 var map=L.map('map',{zoomControl:false}).setView([${initialRegion.lat},${initialRegion.lng}],15);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
 map.on('moveend',()=>{
   var c=map.getCenter();
   window.ReactNativeWebView.postMessage(JSON.stringify({lat:c.lat,lng:c.lng}));
 });
</script></body></html>`;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <View style={s.top}>
          <Text style={s.title}>{title}</Text>
          <TextInput
            style={s.input}
            placeholder="Tafuta Kariakoo, Mbagala..."
            value={query}
            onChangeText={search}
          />
          <FlatList
            data={results}
            keyExtractor={(i) => String(i.place_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.row}
                onPress={() => {
                  const loc = {
                    lat: Number(item.lat),
                    lng: Number(item.lon),
                  };
                  setCenter(loc);
                  setAddress(item.display_name);
                  setResults([]);
                  webRef.current?.injectJavaScript(
                    `map.setView([${loc.lat},${loc.lng}],16);true;`
                  );
                }}
              >
                <Text numberOfLines={2}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          style={{ flex: 1 }}
          onMessage={(e) => {
            const loc = JSON.parse(e.nativeEvent.data);
            setCenter(loc);
            reverse(loc);
          }}
        />

        <View style={s.pin}>
          <Text style={{ fontSize: 32 }}>📍</Text>
        </View>

        <View style={s.bottom}>
          <Text numberOfLines={2}>{address}</Text>
          <PrimaryButton
            title="Thibitisha eneo hili"
            onPress={() => onConfirm({ ...center, address })}
          />
          <PrimaryButton title="Ghairi" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  top: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
  },
  row: {
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  pin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
  bottom: {
    backgroundColor: colors.card,
    padding: 16,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
});
