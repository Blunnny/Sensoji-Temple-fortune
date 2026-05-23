import "./style.css";
import "./styles/pilgrimage.css";
import { App } from "./app/App";

const appEl = document.querySelector<HTMLDivElement>("#app");

if (appEl) {
  const app = new App(appEl);
  void app.start();
}
