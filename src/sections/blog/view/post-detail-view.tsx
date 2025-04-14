import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

import MapIcon from '@mui/icons-material/Map';
import {
  Box, Card, CardMedia, Typography,
  IconButton, CardContent, CircularProgress, Divider
} from '@mui/material';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

type Location = {
  province: string;
  district: string;
  subdistrict: string;
  village: string;
};

type ReportDetail = {
  id: string;
  image: string;
  type_report: string;
  description: string;
  address_detail: string;
  longitude: string;
  latitude: string;
  createdAt: string;
  updatedAt: string;
  location: Location;
};

export function PostDetail() {
  const { id } = useParams();
  const [data, setData] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const cacheKey = `report-${id}`;
    const timestampKey = `report-${id}-timestamp`;
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(timestampKey);
    const TTL = 3 * 60 * 1000; // 3 menit
    const now = Date.now();
    const isExpired = !cachedTime || now - Number(cachedTime) > TTL;
  
    if (cached && !isExpired) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }
  
    fetch(`${BASE_URL}/reports/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setLoading(false);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        localStorage.setItem(timestampKey, now.toString());
      })
      .catch((err) => {
        console.error('Failed to fetch report detail:', err);
        setLoading(false);
      });
  }, [id]);  

  const capitalizeWords = (str?: string) => {
    if (!str?.trim()) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (!data) return <Typography>No data found.</Typography>;

  const position: [number, number] = [parseFloat(data.latitude), parseFloat(data.longitude)];

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}>
      <Box
        sx={{
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <CardMedia
          component="img"
          image={data.image}
          alt={data.type_report}
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>


      <CardContent>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {data.type_report}
        </Typography>

        <Typography variant="body1" paragraph color="text.secondary">
          {data.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Alamat Lengkap
          </Typography>
          <Typography variant="body2">{data.address_detail}</Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Wilayah
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
            <Typography variant="body2">Provinsi : {capitalizeWords(data.location.province)}</Typography>
            <Typography variant="body2">Kota/Kabupaten : {capitalizeWords(data.location.district)}</Typography>
            <Typography variant="body2">Kecamatan : {capitalizeWords(data.location.subdistrict)}</Typography>
            <Typography variant="body2">Kelurahan/Desa : {capitalizeWords(data.location.village)}</Typography>
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Koordinat
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Typography variant="body2">Latitude: {data.latitude}</Typography>
            <Typography variant="body2">Longitude: {data.longitude}</Typography>
          </Box>
        </Box>

        {data.latitude === '0.00000000' && data.longitude === '0.00000000' && (
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={600}>Lokasi Peta</Typography>
            <Typography variant="body2">Peta tidak tersedia, pelapor tidak mencantumkan koordinat.</Typography>
          </Box>
        )}

        {data.latitude !== '0.00000000' && data.longitude !== '0.00000000' && (
          <Box mt={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600}>Lokasi Peta</Typography>
              <IconButton
                onClick={() => {
                  const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
                  window.open(googleMapsUrl, '_blank');
                }}
              >
                <MapIcon color="primary" />
              </IconButton>

            </Box>

            <Box position="relative">
              <Box
                position="absolute"
                top={8}
                right={8}
                bgcolor="white"
                p={1}
                borderRadius={1}
                boxShadow={3}
                zIndex={1000}
              >
                <Typography variant="body2"><strong>{data.type_report}</strong></Typography>
                <Typography variant="caption">{data.address_detail}</Typography>
              </Box>

              <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '300px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                />
                <MarkerClusterGroup>
                  <Marker position={position} icon={customIcon}>
                    <Popup>
                      {data.type_report} <br /> {data.address_detail}
                    </Popup>
                  </Marker>
                </MarkerClusterGroup>
              </MapContainer>
            </Box>
          </Box>
        )}

        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Dilaporkan pada: {new Date(data.createdAt).toLocaleString()}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
}
