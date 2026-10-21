import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./ErrorBoundary";
import { initVkBridge } from "./vk";

// Инициализация VK Bridge
initVkBridge();

// v17.6-mobile-fix-v2: setAppHeight()/--app-height и подписки
// resize/orientationchange/visualViewport УДАЛЕНЫ. Высота управляется через
// height:100% + flexbox (html/body/#root — overflow:hidden, скроллится только
// .screen-container), динамическая CSS-переменная больше не нужна.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
