const API_URL = import.meta.env.VITE_API_URL;

interface RouteRequest {
  origin: string;
  destination: string;
}

interface RouteResponse {
  token: string;
}

type Coordinates = [string, string]; // [latitude, longitude]

interface RouteStatusBase {
  status: 'in progress' | 'failure' | 'success';
}

interface RouteStatusBusy extends RouteStatusBase {
  status: 'in progress';
}

interface RouteStatusFailure extends RouteStatusBase {
  status: 'failure';
  error: string;
}

interface RouteStatusSuccess extends RouteStatusBase {
  status: 'success';
  path: Coordinates[];
  total_distance: number;
  total_time: number;
}

export type RouteStatus = RouteStatusBusy | RouteStatusFailure | RouteStatusSuccess;

/**
 * Client-side function to request a route
 * @param origin Address of the pickup point
 * @param destination Address of the drop-off point
 * @returns Promise containing the routing token
 * @throws Error if the request fails
 */
export const requestRoute = async (
  { origin, destination }: RouteRequest
): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as RouteResponse;
  return data.token;
};

// Example usage:
// try {
//   const token = await requestRoute(
//     { origin: 'Innocentre, Hong Kong', 
//       destination: 'Hong Kong International Airport Terminal 1' }
//   );
//   console.log('Route token:', token);
// } catch (error) {
//   console.error('Failed to request route:', error);
// }

/**
 * Client-side function to get route status and details
 * @param token The processing token returned from the `/route` endpoint
 * @returns Promise containing the route status and details
 * @throws Error if the request fails
 */
export const getRouteStatus = async (token: string): Promise<RouteStatus> => {
  const response = await fetch(`${API_URL}/${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as RouteStatus;
  return data;
};

// Example usage:
// try {
//   const routeStatus = await getRouteStatus('9d3503e0-7236-4e47-a62f-8b01b5646c16');
//   
//   switch (routeStatus.status) {
//     case 'in progress':
//       console.log('Route is being processed...');
//       break;
//     case 'failure':
//       console.log('Route failed:', routeStatus.error);
//       break;
//     case 'success':
//       console.log('Route found!');
//       console.log('Path:', routeStatus.path);
//       console.log('Total distance:', routeStatus.total_distance);
//       console.log('Total time:', routeStatus.total_time);
//       break;
//   }
// } catch (error) {
//   console.error('Failed to get route status:', error);
// }

/**
 * Function to request a route and get its status, retrying if the status is 'in progress'
 * @param origin Address of the pickup point
 * @param destination Address of the drop-off point
 * @param maxRetries Maximum number of retries if the status is 'in progress'
 * @param retryDelay Delay between retries in milliseconds
 * @returns Promise containing the final route status and details
 * @throws Error if the request fails or maximum retries are exceeded
 */
export const requestAndGetRouteStatus = async (
  origin: string,
  destination: string,
  maxRetries: number = 5,
  retryDelay: number = 2000
): Promise<RouteStatus> => {
  try {
    const token = await requestRoute({ origin, destination });
    let retries = 0;

    while (retries < maxRetries) {
      const routeStatus = await getRouteStatus(token);

      switch (routeStatus.status) {
        case 'in progress':
          retries++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          console.log("retry ", retries);
          break;
        case 'failure':
          throw new Error(`${routeStatus.error}`);
        case 'success':
          return routeStatus;
      }
    }

    throw new Error('Maximum retries exceeded');
  } catch (error) {
    console.error('Failed to request and get route status:', error);
    throw error;
  }
};
