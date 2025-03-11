import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// Import leaflet properly
import L from 'leaflet';
// Import the routing machine as a module
import 'leaflet-routing-machine';
import { Button } from '@heroui/button';

// Types
interface Preventa {
  id: string;
  fecha: string;
  total: number;
  estado: string;
  latitud: number;
  longitud: number;
  cliente: {
    id: string;
    nombre: string;
  };
}

interface MapRouteTrackerProps {
  preventas: Preventa[];
}

type Position = [number, number];

// Icons for the map - fix the type issue by using the correct import
const clientIcon = new L.Icon({
  iconUrl: '/assets/user.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const cartIcon = new L.Icon({
  iconUrl: '/assets/car.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Calculate distance between two coordinates (Haversine formula)
const calcularDistancia = (pos1: Position, pos2: Position): number => {
  const toRad = (valor: number) => valor * Math.PI / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(pos2[0] - pos1[0]);
  const dLon = toRad(pos2[1] - pos1[1]);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(pos1[0])) * Math.cos(toRad(pos2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Routing Control Component
interface RoutingMachineProps {
  from: Position;
  to: Position;
  color?: string;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ from, to, color = '#3388ff' }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!from || !to) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Use the correct L.Routing syntax
    // @ts-ignore - We ignore TS errors here because the typings are incomplete for leaflet-routing-machine
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color, weight: 5, opacity: 0.8 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    }).addTo(map);

    // Hide the routing control itinerary and other UI elements
    // @ts-ignore - We ignore TS errors here because the typings are incomplete
    routingControl.hide();

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, from, to, color]);

  return null;
};

// Multi-route component that handles routing to multiple stops
interface MultiRouteProps {
  currentPosition: Position;
  stops: Position[];
  color?: string;
}

const MultiRoute: React.FC<MultiRouteProps> = ({ currentPosition, stops, color = '#0000FF' }) => {
  const map = useMap();
  const routingControlsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!currentPosition || stops.length === 0) return;

    // Clear any existing routing controls
    routingControlsRef.current.forEach(control => {
      if (control) map.removeControl(control);
    });
    routingControlsRef.current = [];

    // Create a new routing control for each segment of the route
    const controls = stops.map((stop, index) => {
      const from = index === 0 ? currentPosition : stops[index - 1];
      const to = stop;

      // @ts-ignore - We ignore TS errors here because the typings are incomplete
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(from[0], from[1]),
          L.latLng(to[0], to[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [
              { color, weight: 5, opacity: 0.8 }
            ],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
      }).addTo(map);

      // Hide the routing control UI elements
      // @ts-ignore - We ignore TS errors here because the typings are incomplete
      routingControl.hide();

      return routingControl;
    });

    routingControlsRef.current = controls;

    // Fit the map to show all routes
    setTimeout(() => {
      const bounds = L.latLngBounds([currentPosition, ...stops]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 1000);

    return () => {
      routingControlsRef.current.forEach(control => {
        if (control) map.removeControl(control);
      });
    };
  }, [map, currentPosition, stops, color]);

  return null;
};

const Mapa_reparto: React.FC<MapRouteTrackerProps> = ({ preventas }) => {
  const [rutaIniciada, setRutaIniciada] = useState<boolean>(false);
  const [posicionActual, setPosicionActual] = useState<Position | null>(null);
  const [ruta, setRuta] = useState<Position[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Preventa | null>(null);
  const [navegacionActiva, setNavegacionActiva] = useState<boolean>(false);
  const [clientesCercanos, setClientesCercanos] = useState<Preventa[]>([]);
  const [rutaOptimizada, setRutaOptimizada] = useState<Position[]>([]);
  const mapRef = useRef(null);

  // Initialize the map centered on the first point or a default location
  const mapaInicial: Position = preventas.length > 0 
    ? [preventas[0].latitud, preventas[0].longitud] 
    : [-12.046374, -77.042793]; // Default to Lima, Peru if no points

  // Fix Leaflet icon issue with Next.js
  useEffect(() => {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }, []);

  // Calculate nearest clients and create optimized route
  const calcularRutaOptimizada = (posicion: Position): void => {
    if (!posicion) return;

    // Calculate distance from current position to each client
    const clientesConDistancia = preventas.map(preventa => ({
      ...preventa,
      distancia: calcularDistancia(posicion, [preventa.latitud, preventa.longitud])
    }));

    // Sort clients by distance from current position
    const clientesOrdenados = [...clientesConDistancia].sort((a, b) => a.distancia - b.distancia);
    
    // Take the 5 nearest clients (or all if less than 5)
    const cercanos = clientesOrdenados.slice(0, 5);
    setClientesCercanos(cercanos);

    // Create positions array for the optimized route
    const posiciones: Position[] = cercanos.map(c => [c.latitud, c.longitud]);
    setRutaOptimizada(posiciones);
  };

  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'granted') {
        // Permiso ya otorgado, inicia la ruta directamente
        iniciarRuta();
      } else if (permissionStatus.state === 'prompt') {
        // El navegador mostrará el mensaje nativo "localhost desea obtener acceso a la ubicación"
        iniciarRuta();
      } else {
        // Permiso denegado, muestra instrucciones detalladas
        alert(
          'Los permisos de ubicación están denegados. Para habilitarlos:\n' +
          '1. Haz clic en el ícono de candado o información en la barra de direcciones.\n' +
          '2. Selecciona "Configuración del sitio" o "Permisos".\n' +
          '3. Cambia "Ubicación" a "Permitir" o "Preguntar".\n' +
          '4. Recarga la página e intenta de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      alert('No se pudo verificar los permisos de ubicación. Revisa tu navegador o conexión.');
    }
  };

  // Start route tracking
  const iniciarRuta = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nuevaPosicion: Position = [latitude, longitude];
          setPosicionActual(nuevaPosicion);
          setRuta([nuevaPosicion]);
          calcularRutaOptimizada(nuevaPosicion);
  
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const nuevaPosicion: Position = [latitude, longitude];
              setPosicionActual(nuevaPosicion);
              setRuta(rutaPrevia => [...rutaPrevia, nuevaPosicion]);
              if (ruta.length > 0 && calcularDistancia(ruta[ruta.length - 1], nuevaPosicion) > 0.2) {
                calcularRutaOptimizada(nuevaPosicion);
              }
            },
            (error) => {
              let mensaje = 'Error desconocido.';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  mensaje = 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  mensaje = 'Ubicación no disponible. Verifica que el GPS esté activado.';
                  break;
                case error.TIMEOUT:
                  mensaje = 'Tiempo de espera agotado. Intenta de nuevo.';
                  break;
              }
              console.error("Error obteniendo ubicación:", error);
              alert(mensaje);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );
          setWatchId(id);
          setRutaIniciada(true);
        },
        (error) => {
          let mensaje = 'Error desconocido.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensaje = 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensaje = 'Ubicación no disponible. Verifica que el GPS esté activado.';
              break;
            case error.TIMEOUT:
              mensaje = 'Tiempo de espera agotado. Intenta de nuevo.';
              break;
          }
          console.error("Error obteniendo ubicación inicial:", error);
          alert(mensaje);
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  // Stop route tracking
  const finalizarRuta = (): void => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setRutaIniciada(false);
    setNavegacionActiva(false);
    setClienteSeleccionado(null);
    setClientesCercanos([]);
    setRutaOptimizada([]);
  };

  // Start navigation to a specific client
  const iniciarNavegacion = (cliente: Preventa): void => {
    if (!posicionActual) {
      alert("Primero debes iniciar la ruta para obtener tu ubicación actual.");
      return;
    }
    setClienteSeleccionado(cliente);
    setNavegacionActiva(true);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Mapa de Ruta de Ventas</h2>
      </div>
      <div className="p-4">
        <div className="flex mb-4 space-x-2">
        <Button 
  onClick={checkLocationPermission} 
  disabled={rutaIniciada}
  className={`px-4 py-2 rounded text-white ${rutaIniciada ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
>
  Iniciar Ruta
</Button>
          <Button 
            onClick={finalizarRuta} 
            disabled={!rutaIniciada}
            className={`px-4 py-2 rounded text-white ${!rutaIniciada ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Finalizar Ruta
          </Button>
          {clienteSeleccionado && (
            <div className="ml-2 bg-blue-100 p-2 rounded flex items-center">
              <span className="mr-2">Navegando hacia: {clienteSeleccionado.cliente.nombre}</span>
              <Button
                onClick={() => {
                  setClienteSeleccionado(null);
                  setNavegacionActiva(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
        
        <div className="h-96 w-full rounded overflow-hidden border border-gray-300">
          <MapContainer 
            center={mapaInicial} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Markers for all clients */}
            {/* Markers for all clients */}
{preventas.map((preventa) => (
  <Marker
    key={preventa.id}
    position={[preventa.latitud, preventa.longitud]}
    icon={clientIcon}
  >
    <Popup>
      <div>
        <h3 className="font-bold">{preventa.cliente.nombre}</h3>
        <p>Total: S/ {preventa.total.toFixed(2)}</p>
        <p>Estado: {preventa.estado}</p>
        {rutaIniciada && posicionActual && (
          <Button
            onClick={() => iniciarNavegacion(preventa)}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm w-full"
          >
            Navegar aquí
          </Button>
        )}
      </div>
    </Popup>
    {/* Add tooltip for client name */}
    <Tooltip permanent direction="top" offset={[0, -20]}>
      {preventa.cliente.nombre}
    </Tooltip>
  </Marker>
))}
            
            {/* Current cart position marker */}
            {posicionActual && (
              <Marker position={posicionActual} icon={cartIcon}>
                <Popup>
                  <div>
                    <h3 className="font-bold">Tu posición actual</h3>
                    <p>{posicionActual[0].toFixed(6)}, {posicionActual[1].toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Historical route tracking polyline */}
            {!navegacionActiva && ruta.length > 1 && (
              <Polyline
                positions={ruta}
                color="gray"
                weight={3}
                opacity={0.5}
                dashArray="5, 5"
              />
            )}
            
            {/* Optimized route to nearest clients */}
            {rutaIniciada && posicionActual && rutaOptimizada.length > 0 && !navegacionActiva && (
              <MultiRoute
                currentPosition={posicionActual}
                stops={rutaOptimizada}
                color="#0052cc" // Azul más oscuro
              />
            )}
            
            {/* Navigation route to selected client */}
            {navegacionActiva && posicionActual && clienteSeleccionado && (
              <RoutingMachine 
                from={posicionActual} 
                to={[clienteSeleccionado.latitud, clienteSeleccionado.longitud]} 
                color="#4285F4" // Google Maps blue
              />
            )}
          </MapContainer>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Clientes</span>
          </div>
          {rutaIniciada && !navegacionActiva && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                <span>Tu recorrido</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-700 rounded-full mr-2"></div>
                <span>Ruta a clientes cercanos</span>
              </div>
            </>
          )}
          {navegacionActiva && (
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
              <span>Ruta de navegación</span>
            </div>
          )}
        </div>
        
        {clientesCercanos.length > 0 && (
  <div className="mt-4">
    <h3 className="font-semibold mb-2">Clientes cercanos sugeridos:</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {clientesCercanos.map(preventa => (
        <div key={preventa.id} className="border p-2 rounded bg-blue-50 hover:bg-blue-100">
          <p className="font-medium text-lg">{preventa.cliente.nombre}</p>
          <p className="text-sm text-gray-600">S/ {preventa.total.toFixed(2)}</p>
          <p className="text-xs text-blue-600">Distancia: {(preventa as any).distancia.toFixed(2)} km</p>
          {rutaIniciada && posicionActual && (
            <Button
              onClick={() => iniciarNavegacion(preventa)}
              className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Navegar
            </Button>
          )}
        </div>
      ))}
    </div>
  </div>
)}
        
        {preventas.length > 0 && clientesCercanos.length === 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Clientes por visitar:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {preventas.map(preventa => (
                <div key={preventa.id} className="border p-2 rounded hover:bg-gray-50">
                  <p className="font-medium">{preventa.cliente.nombre}</p>
                  <p className="text-sm text-gray-600">S/ {preventa.total.toFixed(2)}</p>
                  {rutaIniciada && posicionActual && (
                    <Button
                      onClick={() => iniciarNavegacion(preventa)}
                      className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Navegar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mapa_reparto;