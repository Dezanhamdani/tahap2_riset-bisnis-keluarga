import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App.tsx を読み込み
import './index.css';    // TailwindCSS などのスタイルを適用

/**
 * HTML内の <div id="root"></div> を探して、
 * そこに React アプリケーションを描画（マウント）します。
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Please check your index.html.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
