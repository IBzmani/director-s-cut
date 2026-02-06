
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix: Access document through window with any casting to resolve missing global name or incomplete Window type error
const rootElement = (window as any).document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);