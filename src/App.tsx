import { ChatProvider } from './context/ChatContext';
import WidgetShell from './components/WidgetShell';

function App() {
  return (
    <ChatProvider>
      <WidgetShell />
    </ChatProvider>
  );
}

export default App;
