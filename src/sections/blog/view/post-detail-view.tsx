import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useParams, useNavigate } from 'react-router-dom';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';

import MapIcon from '@mui/icons-material/Map';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box, Card, Alert, Dialog,
  Button, Divider, Snackbar, CardMedia,
  Typography, IconButton, CardContent,
  DialogTitle, DialogActions, DialogContent, LinearProgress, DialogContentText, linearProgressClasses
} from '@mui/material';

import { fetchReports, deleteReport } from 'src/utils/reports-services';

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
  const navigate = useNavigate();
  const [data, setData] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const cacheKey = `report-${id}`;
    const timestampKey = `report-${id}-timestamp`;
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(timestampKey);
    const TTL = 3 * 60 * 1000;
    const now = Date.now();
    const isExpired = !cachedTime || now - Number(cachedTime) > TTL;

    if (cached && !isExpired) {
      setData(JSON.parse(cached));
      setIsLoading(false);
      return;
    }

    fetchReports(`/${id}`)
      .then((res) => {
        setData(res);
        setIsLoading(false);
        localStorage.setItem(cacheKey, JSON.stringify(res));
        localStorage.setItem(timestampKey, now.toString());
      })
      .catch((err) => {
        console.error('Failed to fetch report detail:', err);
        setIsLoading(false);
      });
  }, [id]);

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async (reportId: string) => {
    try {
      setIsDeleting(true);
  
      await deleteReport(`/${reportId}`);
  
      localStorage.removeItem(`report-${reportId}`);
      localStorage.removeItem(`report-${reportId}-timestamp`);
  
      setOpenConfirm(false);
  
      setTimeout(() => {
        enqueueSnackbar('Postingan berhasil dihapus!', { variant: 'success' });
      }, 300);
  
      setTimeout(() => {
        navigate('/report');
      }, 3000);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  
  const capitalizeWords = (str?: string) => {
    if (!str?.trim()) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress
          sx={{
            width: 1,
            maxWidth: 320,
            bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
            [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
          }}
        />
      </Box>
    );
  }

  if (!data) return <Typography>No data found.</Typography>;

  const position: [number, number] = [parseFloat(data.latitude), parseFloat(data.longitude)];

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', mt: 5, p: 3 }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={data.image}
          alt={data.type_report}
          sx={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 2 }}
        />
        <IconButton
          onClick={() => setOpenConfirm(true)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            border: '2px solid',
            borderColor: 'error.main',
            bgcolor: 'white',
            color: 'error.main',
            boxShadow: 3,
            width: 48,
            height: 48,
            '&:hover': {
              bgcolor: 'error.light',
            },
          }}
        >
          <DeleteIcon />
        </IconButton>
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

        {data.latitude === '0.00000000' && data.longitude === '0.00000000' ? (
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight={600}>Lokasi Peta</Typography>
            <Typography variant="body2">Peta tidak tersedia, pelapor tidak mencantumkan koordinat.</Typography>
          </Box>
        ) : (
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

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yakin ingin menghapus postingan ini? Tindakan ini tidak bisa dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Batal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(`${id}`)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbarOpen(false)}>
          Postingan berhasil dihapus!
        </Alert>
      </Snackbar>
    </Card>
  );
}
