import './App.css'
import InputForm from './components/InputForm'
import Map from './components/Map'
import { RouteStatus } from './api';
import { useState } from 'react';
function App() {

  const [routeStatus, setRouteStatus] = useState<RouteStatus | null>(null);

  const onFinish = (status: RouteStatus | null) => {
    setRouteStatus(status);
  };

  const onReset = () => {
    setRouteStatus(null);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 md:gap-16 items-stretch h-full">
        <InputForm onFinish={onFinish} onReset={onReset} routeStatus={routeStatus} />
        <Map routeStatus={routeStatus} />
      </div>

    </>
  )
}

export default App
