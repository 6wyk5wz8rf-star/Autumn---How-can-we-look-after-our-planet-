import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './destinations/planet-atlas/atlas.css';
import './styles/print.css';
import App from './app/App.js';

const root = document.querySelector('#app');
const app = new App(root);
app.init();

globalThis.__OUR_PLANET_APP__ = app;
