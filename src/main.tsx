// main.tsx — the app's entry point.
// This file finds the <div id="root"> in index.html and tells React to render
// our <App /> component inside it.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
