/* eslint-env browser, node */
/* global React */
const chuj = require('marked');
let typing = false;
let typingTimer;

document.addEventListener('DOMContentLoaded', function onLoad() {
  const app = React.createElement(App);
  ReactDOM.render(app, document.body);
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      url: '',
      users: [],
      messages: [],
      status: ''
    };
    this.onLogin = this.onLogin.bind(this);
    this.onZarejestruj = this.onZarejestruj.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSend = this.onSend.bind(this);
  }
  initSocket(url) {
    this.setState({ status: 'Connecting...' });
    const socket = io.connect(url);
    socket.on('connect', () => {
      this.appendMessage(`Connected to server ${ this.state.url }`);
      this.setState({ status: '' });
    });
    socket.on('message', data => {
      this.appendMessage(`__${ data.username }:__ ${ data.text }`);
    });
    socket.on('login', data => {
      this.appendMessage(`${ data.username } has logged in.`);
      this.setState({ users: data.users });
      
    });
    socket.on('typing', data => {
      this.setState({ status: `${ data.username } is typing...` });
    });
    socket.on('stop-typing', () => {
      this.setState({ status: '' });
    });
    socket.on('logout', data => {
      this.appendMessage(`${ data.username } disconnected.`);
      this.setState({ users: data.users });
    });
    this.socket = socket;
  }
  appendMessage(message) {
    this.setState((prev, props) => {
      const messages = prev.messages;
      messages.push(message);
      return { messages };
    });
  }
  onLogin(url, username, pass) {
    this.setState({ url, username });
    this.initSocket(url);
    this.socket.emit('login', { username, pass });
    this.refs.inputBar.focus();
  }
  onZarejestruj(url,username, pass) {
    const socket = io.connect(url);
    console.log(`emmiting ${username,password}`);
    this.socket.emit('register', {username,pass});
  }
  onInput(text) {
    const username = this.state.username;
    if (!typing) {
      typing = true;
      this.socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(() => {
      typing = false;
      this.socket.emit('stop-typing', { username });
    }, 1000);
  }
  onSend(text) {
    const username = this.state.username;
    this.socket.emit('message', { username, text });
  }
  componentDidMount() {
    this.refs.loginBox.focus();
  }
  render() {
    return React.createElement(
      'main',
      null,
      React.createElement(LoginBox, { ref: 'loginBox', url: 'http://192.166.219.19:3010', onLogin: this.onLogin }),
      React.createElement(
        'div',
        { className: 'content' },
        React.createElement(UserList, { users: this.state.users }),
        React.createElement(ChatArea, { messages: this.state.messages, status: this.state.status })
      ),
      React.createElement(InputBar, { ref: 'inputBar', onInput: this.onInput, onSend: this.onSend })
    );
  }
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);

    this.senddata = this.senddata.bind(this);
    this.register = this.register.bind(this);
  }
  focus() {
    this.refs.username.focus();
  }
  senddata() {
    //if (e.keyCode === 13) {
    const value = this.refs.username.value.trim();
    const url = this.refs.url.value.trim();
    const pass = this.refs.password.value.trim();
    if (value && pass ) {
      this.props.onLogin(url, value, pass);
      this.refs.root.classList.add('hidden');
     } else {
      console.log('enter username or password');
      }
    }
  register() {
    const value = this.refs.username.value.trim();
    const pass = this.refs.password.value.trim();
    const url = this.refs.url.value.trim();
    if (value && pass ) {
      //this.props.onRegister(value, pass);
      this.props.onZarejestruj(url, value, pass);
      //this.initSocket(url);
    } else {
      console.log('provide username or password');
    }
  }
  render() {
    return React.createElement(
      'div',
      { id: 'login-box', ref: 'root' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'h2',
          null,
          'Login'
        ),
        React.createElement('input', { type: 'url', id: 'server-url', ref: 'url', value: this.props.url }),
        React.createElement('input', { type: 'text', placeholder: 'enter username', id: 'username', ref: 'username', autofocus: true }),
        React.createElement('input', { type: 'password', placeholder: 'enter password', id: 'password', ref: 'password', autofocus: true }),
        React.createElement('button',{ type: 'button', onClick: this.senddata, id: 'login-button', autofocus: true}, 'Login'),
        React.createElement('button',{ type: 'button', onClick: this.register, id: 'login-button', autofocus: true}, 'Register')
      )
    );
  }
}

class UserList extends React.Component {
  render() {
    const opts = { sanitize: true };
    const users = this.props.users.map(user => React.createElement('li', { dangerouslySetInnerHTML: { __html: chuj(user,opts) } }));
    return React.createElement(
      'aside',
      null,
      React.createElement(
        'h3',
        null,
        'Connected Users'
      ),
      React.createElement(
        'ul',
        { id: 'users' },
        users
      ),
      React.createElement(
        'div',
        { id: 'user-stats' },
        users.length,
        ' users online.'
      )
    );
  }
}

class ChatArea extends React.Component {
  render() {
    const opts = { sanitize: true };
    const text = this.props.messages.map(msg => `${ chuj(msg,opts) }\n`).join('');
    return React.createElement(
      'div',
      { id: 'chat' },
      
      React.createElement('div', { id: 'chat-text', dangerouslySetInnerHTML: { __html: text } }),
      React.createElement(
        'div',
        { id: 'chat-status-msg' },
        this.props.status
      )
    );
  }
}

class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  onKeyDown(e) {
    if (e.keyCode === 13) {
      this.send();
    }
  }
  onInput() {
    const value = this.refs.input.value.trim();
    this.props.onInput(value);
  }
  onClick() {
    this.send();
  }
  send() {
    const value = this.refs.input.value.trim();
    if (value) {
      this.props.onSend(value);
      this.refs.input.value = ''; // Should I mutate state instead?
    }
  }
  focus() {
    this.refs.input.focus();
  }
  render() {
    return React.createElement(
      'div',
      { className: 'input' },
      React.createElement('input', {
        type: 'text',
        id: 'text-input',
        ref: 'input',
        placeholder: 'say something...',
        onInput: this.onInput,
        onKeyDown: this.onKeyDown
      }),
      React.createElement(
        'button',
        { id: 'send-btn', onClick: this.onClick },
        'Send'
      )
    );
  }
}