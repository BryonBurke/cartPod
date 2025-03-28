import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Typography, Button, Fab, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import cartPodService, { CartPod } from '../services/cartPodService';

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [cartPods, setCartPods] = useState<CartPod[]>([]);
  const [isGoogleMapsBlocked, setIsGoogleMapsBlocked] = useState(false);
  const [isAddingPod, setIsAddingPod] = useState(false);
  const navigate = useNavigate();
  const longPressTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCartPods = async () => {
      try {
        const pods = await cartPodService.getAllCartPods();
        setCartPods(pods);
      } catch (err) {
        console.error('Error fetching cart pods:', err);
        if (err instanceof Error && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setError('Google Maps is being blocked by your browser. Please disable any ad blockers or privacy extensions for this site.');
          setIsGoogleMapsBlocked(true);
        } else {
          setError('Failed to load cart pod locations. Please make sure the backend server is running.');
        }
      }
    };

    fetchCartPods();
  }, []);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const google = await loadGoogleMaps();

        if (!mapRef.current) {
          throw new Error('Map container not found');
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 45.5155, lng: -122.6789 }, // Portland coordinates
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        setMapReady(true);
        setLoading(false);

        // Add markers for cart pods
        if (cartPods.length > 0) {
          cartPods.forEach(pod => {
            const marker = new google.maps.Marker({
              position: {
                lat: pod.location.coordinates[1],
                lng: pod.location.coordinates[0]
              },
              map: map,
              title: pod.name,
              animation: google.maps.Animation.DROP
            });

            // Add click listener to marker
            marker.addListener('click', () => {
              navigate(`/cart-pod/${pod._id}`);
            });

            markersRef.current.push(marker);
          });
        }

        // Add long-press event listener for adding new cart pods
        map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
          if (!isAddingPod) return;
          
          longPressTimeoutRef.current = setTimeout(() => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              navigate('/cart-pod-form', { 
                state: { 
                  coordinates: [lng, lat],
                  isNewPod: true 
                } 
              });
            }
          }, 500); // 500ms long press
        });

        map.addListener('mouseup', () => {
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
        });

        map.addListener('mousemove', () => {
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        if (err instanceof Error && err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setError('Google Maps is being blocked by your browser. Please disable any ad blockers or privacy extensions for this site.');
          setIsGoogleMapsBlocked(true);
        } else {
          setError('Failed to load map. Please try again later.');
        }
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      // Cleanup markers when component unmounts
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [cartPods, isAddingPod, navigate]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setIsGoogleMapsBlocked(false);
    // Force a reload of the component
    window.location.reload();
  };

  const handleAddPodClick = () => {
    setIsAddingPod(true);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            maxWidth: 400,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {isGoogleMapsBlocked && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              To fix this:
              <ol style={{ textAlign: 'left', marginTop: '8px' }}>
                <li>Disable your ad blocker for this site</li>
                <li>Or add an exception for maps.googleapis.com</li>
                <li>Or try using a different browser</li>
              </ol>
            </Typography>
          )}
          <Button variant="contained" onClick={handleRetry}>
            Retry
          </Button>
        </Box>
      )}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          opacity: mapReady ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 3,
          p: 1,
        }}
      >
        <Typography variant="body1" sx={{ px: 1 }}>
          Add new cart pod
        </Typography>
        <Fab
          color="primary"
          aria-label="add cart pod"
          size="small"
          onClick={handleAddPodClick}
        >
          <AddIcon />
        </Fab>
      </Stack>
      {isAddingPod && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="body1">
            Long press on the map to place a new cart pod
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Map; 