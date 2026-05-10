import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 同じフォルダ内の App.tsx をインポート
import './index.css';    // スタイルシートを読み込み

// HTMLの <div id="root"></div> を取得
const container = document.getElementById('root');

// もし root 要素が見つからない場合の安全策
if (!container) {
  console.error("Root element not found. Please check index.html");
} else {
  const root = ReactDOM.createRoot(container);
  
  // React アプリを画面に描画
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
