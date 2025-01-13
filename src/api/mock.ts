const MOCK_API_URL = 'https://sg-mock-api.lalamove.com/route';

interface RouteRequest {
  origin: string;
  destination: string;
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

type RouteStatus = RouteStatusBusy | RouteStatusFailure | RouteStatusSuccess;

/**
 * Mock function to simulate a POST request to /mock/route/500
 * @param origin Address of the pickup point
 * @param destination Address of the drop-off point
 * @returns Promise containing a mock routing token
 * @throws Error to simulate a server error with status 500
 */
export const mockRequestRoute = async (
  { origin, destination }: RouteRequest,
  mockStatus: '500' | 'success'
): Promise<string> => {
  const response = await fetch(`${MOCK_API_URL}/route/${mockStatus}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ origin, destination }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
};

export const mockGetRouteStatus = async (token: string, mockStatus: '500' | 'success' | 'inprogress' | 'failure'): Promise<RouteStatus> => {
  const response = await fetch(`${MOCK_API_URL}/status/${mockStatus}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as RouteStatus;
};
