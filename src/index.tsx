import React from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import Root from "./components/root";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<Root />, document.getElementById("root"));
serviceWorker.unregister();
