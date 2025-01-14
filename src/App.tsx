import './App.css'
import InputForm from './components/InputForm'
import { mockRequestAndGetRouteStatus } from './api/mock';
function App() {

  const onSubmit = (data: { origin: string, destination: string }) => {
    console.log(data);
    // requestAndGetRouteStatus(data.origin, data.destination);
    mockRequestAndGetRouteStatus(data.origin, data.destination);
  };

  const onReset = () => {
    console.log('reset');
  };

  return (
    <>
      <InputForm onSubmit={onSubmit} onReset={onReset} />
    </>
  )
}

export default App
