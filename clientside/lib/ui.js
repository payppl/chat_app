import RoomList from './classes/RoomList.js';
import Notification from './classes/Notification.js';
import CreateRooms from './classes/Rooms.js';
import InputBar from './classes/InputBar.js';
import ChatArea from './classes/ChatArea.js';
import UserList from './classes/UserList.js';
import LoginBox from './classes/LoginBox.js';


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
document.addEventListener('keydown', (event) => {
  var name = event.key;
  if(name === 'j') {
    console.log('eo');
  }
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      url: '',
      users: ['ea','ew'],
      messages: [],
      status: '',
      rooms: ['chuj','pizda'],
      currentroom: 'chuj'
      
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
  onShowNotification( notifitext) {
    //var notifibox = document.querySelector('notifi');
    //document.getElementById('#notifi-msg').attributes[0].name = notifitext;\
    document.getElementById('notifi').style.display = 'flex';
    var chuj = document.getElementById('notifi-msg');
    chuj.innerHTML = '';
    chuj.innerHTML = notifitext;
    //textnofiti = notifitext;
    //document.querySelector('#').value
    //console.log(" wqe " + `${chuj.innerHTML}`+ " ");
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
    if(username == null){
      this.onShowNotification("Username not correct or is null");
      if(cr == null) {
        this.onShowNotification("Room is null");
        if(text == null) {
          this.onShowNotification("text is null");
        }
      }
    }else {
      socket.emit('message', { username, text, cr});
    }

  }

  TalkToOthers() {

      
    var constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
        var mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.onstart = function(e) {
            this.chunks = [];
        };
        mediaRecorder.ondataavailable = function(e) {
            this.chunks.push(e.data);
            var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
            //console.log(e.data);
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
      this.onShowNotification('podałeś nie prawidłową nazwe kanału lub nazwa kanału jest pusta');
    }
  }
  onJoinTR(roomname) {
    const username = this.state.username;
    //console.log('clicket ' + `${roomname}`);
    socket.emit('JoinRoom', {username, roomname});
    this.state.currentroom = roomname;
    this.onShowNotification(`current room ${this.state.currentroom}`);
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
      React.createElement(Notification, {ref: 'notificationBox'}),
      React.createElement(
        'div',
        { className: 'content' },
          React.createElement(UserList, { users: this.state.users }),
          React.createElement(
            'div',
            {className: 'center-divs'},
            React.createElement(ChatArea, { messages: this.state.messages, status: this.state.status }),
            React.createElement(InputBar, { ref: 'inputBar', onInput: this.onInput, onSend: this.onSend, TalkToOthers: this.TalkToOthers }),
            
          ),
          React.createElement(RoomList, {rooms: this.state.rooms, returnCRoom: this.returnCRoom, onJoinTR: this.onJoinTR }),
         React.createElement(CreateRooms, {ref: 'CreateRooms', rooms: this.state.rooms, onRoomCreated: this.onRoomCreated, OnLeaveRoom: this.OnLeaveRoom, onJoinTR: this.onJoinTR,returnCRoom: this.returnCRoom  }),
          ),
    );
  }
}








