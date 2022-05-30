const chuj = require('marked');
const electron = require('electron');
const ss = require('socket.io-stream');
const {BrowserWindow} = require('electron');
const color = require('color');
const sfm = require('sfmediastream');
const { useState } = require('react');
let typing = false;
let corrected = false;
let typingTimer;
const socket = io.connect("http://185.238.75.83:3000");


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
      status: '',
      rooms: [],
      currentroom: ''
      
    };
    this.onLogin = this.onLogin.bind(this);
    this.onZarejestruj = this.onZarejestruj.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSend = this.onSend.bind(this);
    this.onJoinTR = this.onJoinTR.bind(this);
    this.onRoomCreated = this.onRoomCreated.bind(this);
    this.TalkToOthers = this.TalkToOthers.bind(this);
    this.returnCRoom = this.returnCRoom.bind(this);
  }
  
  initSocket() {
    this.setState({ status: 'Connecting...' });
    
    
    socket.on('connectedtosever', () => {
      this.appendMessage(`Connected to server `);
      this.setState({ status: '' });
      this.setState({currentroom: 'ogolny'});
      console.log(this.state.currentroom);
    });
    socket.on('currentRoom', data => {
      this.state.currentroom = data.roomname;
    });
    socket.on('reciveRoomList', data => {
      this.state.rooms = data.rooms;
      this.setState({rooms: data.rooms});
    });
    socket.on('emitmessageRoom', data => {
      this.appendMessage(`${data.roomname} dołączasz do pokoju`);
      this.onShowNotification(`${data.roomname} dołączasz do pokoju`);
    });

    socket.on('LeaveRoom', data => {
      this.appendMessage(`${this.state.currentroom} opuszczasz pokój`);
      this.state.currentroom = data.roomname;
      this.state.rooms = data.rooms;
    });
    socket.on('server-message', data => {
      server_name = data.servername;
      server_message = data.servermessage;
      this.appendMessage(`__${Server}:__ ${server_message}`);
    });
    socket.on('loginemit', data => {
      this.appendMessage(`${ data.username } has logged in.`);
      this.onShowNotification(`${ data.username } has logged in.`);
      //this.setState({ users: data.users });
    });
    socket.on('loginemit_data', data => {
        this.setState({users: data.users});
    });
    socket.on('message', data => {
      
      if(this.state.currentroom == data.currentroom ) {
      if(this.state.username == data.username ) {
        var text = data.text;
        var user = data.username;
        var coloredtext = text.fontcolor('green');
        var coloreduser = user.fontcolor('green');
        this.appendMessage(`__${ coloreduser }:__  ${ coloredtext }`);
        
        
      } else {
        this.appendMessage(`__${ data.username }:__  ${ data.text }`);
      }
      
      if(BrowserWindow.getFocusedWindow().isMinimized()) {
        const options = {
          title: `od: ${data.username}`,
          body: `${data.text}`
        }
        const not = new electron.Notification(options);
        not.show();
        not.addListener('click', () => {
          electron.app.show();
        });
      }
    }
      var scroll = document.getElementById('chat');  
      scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
      scroll.animate({scrollTop: scroll.scrollHeight});
    });
    ss(socket).on('voice-callback', function(data) {
      var blob = new Blob([data], { 'type' : 'audio/ogg; codecs=opus' });
      var audio = document.createElement('audio');
      audio.src = window.URL.createObjectURL(blob);
      audio.play();
    });
    socket.on('typing', data => {
      this.setState({ status: `${ data.username } is typing...` });
    });
    socket.on('stop-typing', () => {
      this.setState({ status: '' });
    });
    socket.on('logout', data => {
      this.appendMessage(`${ data.username } disconnected `);
      this.setState({ users: data.users });
    });
    socket.on('disconnect', () => {
      this.setState( {status: 'server: shutting down'});
      window.location.reload();
    }); 
    socket.on('commandreturn', (data) => {
      this.appendMessage(`${data.adminmessage}`);
    });

  }
  appendMessage(message) {
    this.setState((prev, props) => {
      const messages = prev.messages;
      messages.push(message);
      return { messages };
    });
  }
  onShowNotification(notifitext) {
    //var notifibox = document.querySelector('notifi');
    //document.getElementById('#notifi-msg').attributes[0].name = notifitext;\
    document.getElementById('notifi').style.display = 'flex';
    var chuj = document.getElementById('notifi-msg');
    chuj.innerHTML = '';
    chuj.innerHTML = notifitext;
    //textnofiti = notifitext;
    //document.querySelector('#').value
    console.log(" wqe " + `${chuj.innerHTML}`+ " ");
    setTimeout(function () {
      document.getElementById('notifi').style.display = 'none';
    }, 1000);
  }
  onLogin(url, username, pass) {
    let corr = false;
    socket.emit('login', { username, pass, corr });
    socket.once('loginreturn', (correcte) =>{
      let s = correcte;
      corrected = s;
      if(s) {
        this.initSocket();
        this.setState({ url, username });
        var loginbox = document.getElementById('login-box');
        loginbox.style.display = 'none'
        socket.emit('loginemit', { username });
      }
    });
  }
  onZarejestruj(url, username, password) {
    socket.emit('register', { username , password })
    let corrw;
    socket.on('registercallback', (corrwe) => {
       corrw = corrwe;
      });
      if(!corrw) {
        corrw = false;
      } else {
        corrw = true;
      }

  }
  onInput(text) {
    const username = this.state.username;
    if (!typing) {
      typing = true;
      socket.emit('typing', { username });
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingTimer = setTimeout(() => {
      typing = false;
      socket.emit('stop-typing', { username });
    }, 1000);
  }
  onSend(text) {
    const username = this.state.username;
    const cr = this.state.currentroom;
    //io.in(cr).emit(username, text);
    socket.emit('message', { username, text, cr});
  }
  
  TalkToOthers(e) {
    if(e.keyCode == 27){ 
      console.log('eo');
    }
    var constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
        var mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.onstart = function(e) {
            this.chunks = [];
        };
        mediaRecorder.ondataavailable = function(e) {
            this.chunks.push(e.data);
            var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
            console.log(e.data);
            ss(socket).emit('voice', blob);
        };
        mediaRecorder.onstop = function(e) {

        };
    
        // Start recording
        mediaRecorder.start();
    
        // Stop recording after 5 seconds and broadcast it to server
      });
  }
  onRoomCreated(roomname) {
    if(roomname != ''){
      const username = this.state.username;
      //this.state.currentroom = roomname;
      socket.emit('createRoomandJoin', {roomname});
    } else {
      this.appendMessage('podałeś nie prawidłową nazwe kanału lub nazwa kanału jest pusta');
    }
  }
  onJoinTR(roomname) {
    const username = this.state.username;
    console.log('clicket ' + `${roomname}`);
    socket.emit('JoinRoom', {username, roomname});
    this.state.currentroom = roomname;
  }

  OnLeaveRoom(roomname) {
    if(roomname != '') {
      socket.emit('LeaveRoom', {roomname});
    } else {
      this.appendMessage('nie możesz wyjść z pokoju ponieważ nie podałeś poprawnej nazwy');
    }
  }
  componentDidMount() {
    this.refs.loginBox.focus();
  }
  returnCRoom() {
    return this.state.currentroom;
  }
  render() {
    return React.createElement(
      'main',
      null,
      React.createElement(LoginBox, { ref: 'loginBox', url: 'http://185.238.75.83:3000', onLogin: this.onLogin, onZarejestruj: this.onZarejestruj }),
      React.createElement(NotificationBox, {ref: 'notificationBox'}),
      React.createElement(
        'div',
        { className: 'content' },
          React.createElement(UserList, { users: this.state.users, returnCRoom: this.returnCRoom }),
          React.createElement(
            'div',
            {className: 'center-divs'},
            React.createElement(ChatArea, { messages: this.state.messages, status: this.state.status }),
            React.createElement(InputBar, { ref: 'inputBar', onInput: this.onInput, onSend: this.onSend, TalkToOthers: this.TalkToOthers })

          ),
         React.createElement(CreateRooms, {ref: 'CreateRooms', rooms: this.state.rooms, onRoomCreated: this.onRoomCreated, OnLeaveRoom: this.OnLeaveRoom, onJoinTR: this.onJoinTR  }),
          ),
    );
  }
}

class LoginBox extends React.Component {
  constructor(props) {
    super(props);

    this.senddata = this.senddata.bind(this);
    this.regi = this.regi.bind(this);
    
  }
  focus() {
    this.refs.username.focus();
  }
    senddata() {
    //if (e.keyCode === 13) {
      console.log(this.refs.username);
      const value = this.refs.username.value.trim();
      const pass = this.refs.password.value.trim();
      const url = this.refs.url.value.trim();
      const buttons = document.querySelector('button');
      //const cos = this.refs.root.classList;
      if (value && pass ) {
        this.props.onLogin(url, value, pass);
        //buttons.disabled = true;
      }
      //}
    }
    regi() {
      const usr = this.refs.username.value.trim();
      const pass = this.refs.password.value.trim();
      const url = this.refs.url.value.trim();
      if (usr && pass ) {
        this.props.onZarejestruj(url,usr,pass);
        this.refs.username.value = '';
        this.refs.password.value = '';
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
        React.createElement('input', { type: 'password', placeholder: 'enter password', id: 'password', ref: 'password' }),
        React.createElement('button',{ type: 'button', onClick: this.senddata, id: 'login-button', autofocus: true}, 'Login'),
        React.createElement('button',{ type: 'button', onClick: this.regi, id: 'login-button', autofocus: true}, 'Register')
      )
    );
  }
}

class UserList extends React.Component {
  constructor(props){
    super(props);
    this.openRooms = this.openRooms.bind(this);
  }
  openRooms(){
    let romb = document.getElementById("rooms-box");
    romb.style.display = 'flex';
    let cr = this.props.returnCRoom();
    console.log(cr);
    for(const lis of document.querySelectorAll('#room-list>li>p')){
        console.log(lis);
      if(lis.innerHTML === cr) {
        lis.style.color = 'green';

        console.log("true", lis.innerHTML);
      } else {
        console.log("false");
        lis.style.color = 'black';
      }
    }
    
  }
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
      React.createElement('button', {id: 'open-rooms-box', onClick: this.openRooms , type: 'button'}, '*'),
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
    const opts = { 
      sanitize: false,
        xhtml: true };
    const text = this.props.messages.map(msg => `<p>${ chuj(msg,opts) }</p>`).join('');
    
    return React.createElement(
      'div',
      { id: 'chat' },
      
      React.createElement('div', { id: 'chat-text', dangerouslySetInnerHTML: { __html: text } }),
      React.createElement(
        'div',
        { id: 'chat-status-msg' },
        this.props.status
        ),
        
      );
  }
}
class InputBar extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSendEmoji = this.onSendEmoji.bind(this);
    this.onVoicePass = this.onVoicePass.bind(this);
  }
  onSendEmoji() {
    
    let emoji = '😁';
    document.querySelector('#text-input').value += emoji;
   
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
  onVoicePass() {
    this.props.TalkToOthers();
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
      ),
      React.createElement(
        'button',
        { id: 'send-btn2', onClick: this.onVoicePass },
        '🎤'
      ),
      React.createElement(
        'a',
        {id: 'emoji-btn', onClick: this.onSendEmoji },
        '😁'
      )
    );
  }
}
class CreateRooms extends React.Component {
  constructor(props) {
    super(props);
    this.JoinRoom = this.JoinRoom.bind(this);
    this.addRoom = this.addRoom.bind(this);
    this.LeaveRoom = this.LeaveRoom.bind(this);
  }
  addRoom() {
    var room_name = document.querySelector('#rom').value;
    this.props.onRoomCreated(room_name);
    console.log(`click ${room_name}`);
  }
  JoinRoom() {
    var e = event.target.innerText;
    this.props.onJoinTR(e);
    this.Close();
  }
  LeaveRoom() {
    var room_name = document.querySelector('#rom').value;
    this.props.OnLeaveRoom(room_name);
    
    console.log(`click ${room_name}`);
  }
  Close() {
    let box = document.getElementById('rooms-box');
    box.style.display = "none";
  }
  render() {
    const opts ={
      sanitize: true
    };
    const roomst = this.props.rooms.map(rooms => React.createElement('li', { dangerouslySetInnerHTML: { __html: chuj(rooms,opts)} }));
    return React.createElement(
      'div',
      {id: 'rooms-box'},
      React.createElement('div', {id: 'rooms-div'},
      React.createElement('a', {id: 'close-button-rooms', onClick: this.Close}, 'X'),
      React.createElement('input', { type: 'text', placeholder: 'enter room', id: 'rom', ref: 'roomname', autofocus: true }),
      React.createElement(
        'button',
        {id: 'addroom-btn' , onClick: this.addRoom },
        'add'
      ),
      React.createElement(
        'button',
        {id: 'leaveroom-btn' , onClick: this.LeaveRoom },
        'leave'
      ),
      React.createElement('a', {id:'room-list-text'}, 'Lista Pokoi'),
      React.createElement(
        'ul',
        {id: 'room-list',  onClick: this.JoinRoom },
        roomst
      )
      )
    );
  }
}
class NotificationBox extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
    return React.createElement(
      'div',
      {id: 'notifi'},
      React.createElement(
        'a',
        {id: 'notifi-msg'},
        'e'
      )
    );
  }
}
