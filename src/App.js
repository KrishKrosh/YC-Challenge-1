import React from "react";
import Example from "./list.jsx";
import "./App.css";
import Details from "./details";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  // eslint-disable-next-line
  Link,
  // eslint-disable-next-line
  Redirect
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Example} />
        <Route exact path="/details" component={Details} />
      </Switch>
    </Router>
  );
}

export default App;
