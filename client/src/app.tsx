import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import { ChatPage } from './ChatPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const App = () => {
  const [isLogin, setIsLogin] = React.useState(false);
  
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <LoginPage />
        </Route>
        <Route path='/register' exact>
          <RegisterPage />
        </Route>
        <Route path='/chat'>
          <ChatPage />
        </Route>
      </Switch>
    </Router>
  )
}

function render() {
  ReactDOM.render(<App />, document.getElementById('root'));
}

render();
