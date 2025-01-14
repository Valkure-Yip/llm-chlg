import { RouteStatus } from '@/api';
import { AdvancedMarker, APIProvider, Map as GoogleMap, Marker, Pin } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import { Polyline } from './geometry/polyline';

type Poi = { key: string, location: google.maps.LatLngLiteral, isStart: boolean, isEnd: boolean }
type Path = { lat: number, lng: number }

const Map = ({ routeStatus }: { routeStatus: RouteStatus | null }) => {
  const markers = useMemo<Poi[]>(() => {
    if (routeStatus?.status === 'success') {
      return routeStatus.path.map((point, index) => ({
        key: (index + 1).toString(),
        location: { lat: Number(point[0]), lng: Number(point[1]) },
        isStart: index === 0,
        isEnd: index === routeStatus.path.length - 1,
      }));
    }
    return [];
  }, [routeStatus]);

  const paths = useMemo<Path[]>(() => {
    if (routeStatus?.status === 'success') {
      return routeStatus.path.map((point) => ({ lat: Number(point[0]), lng: Number(point[1]) }));
    }
    return [];
  }, [routeStatus]);

  return (
    <div className="flex-1 min-h-[600px]">
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
          <Polyline
            strokeColor="#FF0000"
            strokeOpacity={1}
            strokeWeight={2}
            path={paths}
          />
          {markers.map((marker) => (
            <AdvancedMarker key={marker.key} position={marker.location}>
              <Pin background={marker.isStart ? 'green' : marker.isEnd ? 'blue' : 'red'} borderColor="white" >
                <span className="text-white font-bold">{marker.key}</span>
              </Pin>
            </AdvancedMarker>
          ))}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};

export default Map;