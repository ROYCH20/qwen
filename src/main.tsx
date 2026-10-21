import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./ErrorBoundary";
import { initVkBridge } from "./vk";

// Инициализация VK Bridge
initVkBridge();

// ─── v17.6-mobile-fix: динамическая высота видимой области ────────────────
// iOS Safari / Chrome Android: вьюпорная высота включает адресную строку, из-за чего
// фон «прыгает» при скролле, а клавиатура ломает layout. window.visualViewport
// .height точнее учитывает address bar и клавиатуру. --app-height всегда равен
// реальной видимой высоте контента без учета UI браузера.
function setAppHeight() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${vh}px`);
}
setAppHeight();

window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', () => setTimeout(setAppHeight, 100));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', setAppHeight);
}
// ────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
