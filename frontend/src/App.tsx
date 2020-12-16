import React from 'react';
import './App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import CreatePost from './components/CreatePost';
import ViewPost from './components/ViewPost';


class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/create/post" exact component={CreatePost} />
          <Route path="/edit/:id" exact component={CreatePost} />
          <Route path="/read/:slug" exact component={ViewPost} />
        </Switch>
      </Router>
    );
  }
}

export default App;
