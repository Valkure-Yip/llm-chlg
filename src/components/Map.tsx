import { RouteStatus } from '@/api';
import { APIProvider, Map as GoogleMap, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

// type Poi = { key: string, location: google.maps.LatLngLiteral, isStart: boolean, isEnd: boolean }
// type Path = { lat: number, lng: number }

const Map = ({ routeStatus }: { routeStatus: RouteStatus | null }) => {
  // const markers = useMemo<Poi[]>(() => {
  //   if (routeStatus?.status === 'success') {
  //     return routeStatus.path.map((point, index) => ({
  //       key: (index + 1).toString(),
  //       location: { lat: Number(point[0]), lng: Number(point[1]) },
  //       isStart: index === 0,
  //       isEnd: index === routeStatus.path.length - 1,
  //     }));
  //   }
  //   return [];
  // }, [routeStatus]);

  // const paths = useMemo<Path[]>(() => {
  //   if (routeStatus?.status === 'success') {
  //     return routeStatus.path.map((point) => ({ lat: Number(point[0]), lng: Number(point[1]) }));
  //   }
  //   return [];
  // }, [routeStatus]);

  return (
    <div className="flex-1">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={() => {
          console.log('Map loaded');
        }}
      >
        <GoogleMap
          mapId={'123'}
          defaultZoom={13}
          defaultCenter={{ lat: 22.319393157958984, lng: 114.16931915283203 }}
        >
          <Directions routeStatus={routeStatus} />
          {/* <Polyline
            strokeColor="#FF0000"
            strokeOpacity={1}
            strokeWeight={2}
            path={paths}
          /> */}
          {/* {markers.map((marker) => (
            <AdvancedMarker key={marker.key} position={marker.location}>
              <Pin background={marker.isStart ? 'green' : marker.isEnd ? 'blue' : 'red'} borderColor="transparent" >
                <span className="text-white font-bold">{marker.key}</span>
              </Pin>
            </AdvancedMarker>
          ))} */}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};

function Directions({ routeStatus }: { routeStatus: RouteStatus | null }) {
  // directions
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  // initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    console.log('initialize directions service and renderer');
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    if (routeStatus?.status !== 'success') return;
    console.log('use directions service');
    directionsRenderer.setMap(map);
    console.log('start to request directions');
    directionsService
      .route({
        origin: { lat: Number(routeStatus.path[0][0]), lng: Number(routeStatus.path[0][1]) },
        destination: { lat: Number(routeStatus.path[routeStatus.path.length - 1][0]), lng: Number(routeStatus.path[routeStatus.path.length - 1][1]) },
        waypoints: routeStatus.path.slice(1, -1).map((point) => ({ location: { lat: Number(point[0]), lng: Number(point[1]) }, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      },
      )
      .then((response) => {
        console.log('directions rendering')
        directionsRenderer.setDirections(response);
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, routeStatus]);
  return null;
}

export default Map;