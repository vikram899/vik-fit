import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import AppRoot from './src/core/index';

function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppRoot />
    </>
  );
}

registerRootComponent(App);
