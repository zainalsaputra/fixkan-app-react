import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box, Card, Dialog, Divider,
  CardMedia, Typography, IconButton, CardContent, DialogTitle, DialogContent, CircularProgress
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
  const [openMap, setOpenMap] = useState(false);

  const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetch(`${BASE_URL}/reports/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (!data) return <Typography>No data found.</Typography>;

  const position: [number, number] = [parseFloat(data.latitude), parseFloat(data.longitude)];

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}>
      <CardMedia
        component="img"
        height="400"
        image={data.image}
        alt={data.type_report}
        sx={{ borderRadius: 2, mb: 3 }}
      />

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
            <Typography variant="body2">Provinsi: {data.location.province}</Typography>
            <Typography variant="body2">Kabupaten: {data.location.district}</Typography>
            <Typography variant="body2">Kecamatan: {data.location.subdistrict}</Typography>
            <Typography variant="body2">Desa: {data.location.village}</Typography>
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

        <Typography variant="caption" color="text.secondary">
          Dilaporkan pada: {new Date(data.createdAt).toLocaleString()}
        </Typography>

        {data.latitude !== '0.00000000' && data.longitude !== '0.00000000' && (
          <Box mt={4}>
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
    <Typography variant="subtitle1" fontWeight={600}>Lokasi Peta</Typography>
    <IconButton onClick={() => setOpenMap(true)}>
      <MapIcon color="primary" />
    </IconButton>
  </Box>

  <Dialog open={openMap} onClose={() => setOpenMap(false)} maxWidth="md" fullWidth>
    <DialogTitle>
      Lokasi Peta
      <IconButton
        aria-label="close"
        onClick={() => setOpenMap(false)}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
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
    </DialogContent>
  </Dialog>
</Box>

        )}
      </CardContent>
    </Card>
  );
}
