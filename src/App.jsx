import Dashboard from "./pages/Dashboard";
import { AlarmProvider } from "./context/AlarmContext";

function App() {
  return (
    <AlarmProvider>
      <Dashboard/>
    </AlarmProvider>
  );
}

export default App;