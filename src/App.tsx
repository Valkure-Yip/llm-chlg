import './App.css'
import InputForm from './components/InputForm'
import Map from './components/Map'
import { mockRequestAndGetRouteStatus } from './api/mock';
import { RouteStatus } from './api';
import { useState } from 'react';
function App() {

  const [routeStatus, setRouteStatus] = useState<RouteStatus | null>(null);

  const onSubmit = async (data: { origin: string, destination: string }) => {
    console.log(data);
    // requestAndGetRouteStatus(data.origin, data.destination);
    const status = await mockRequestAndGetRouteStatus(data.origin, data.destination);
    console.log(status);
    setRouteStatus(status);
  };

  const onReset = () => {
    console.log('reset');
  };

  return (
    <>
      <div className="flex gap-16">
        <InputForm onSubmit={onSubmit} onReset={onReset} />
        <Map routeStatus={routeStatus} />
      </div>

    </>
  )
}

export default App
