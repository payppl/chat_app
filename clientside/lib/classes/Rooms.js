const chuj = require('marked');


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
      //console.log(`click ${room_name}`);
    }
    JoinRoom() {
      var e = event.target.innerText;
      this.props.onJoinTR(e);
      let cr = this.props.returnCRoom();
      for(const lis of document.querySelectorAll('#roomlist>li>p')){
        if(lis.innerHTML === cr) {
          lis.style.color = 'green';
        } else {
          lis.style.color = 'black';
        }
      }
      for(const lis of document.querySelectorAll('#room-list>li>p')){
        if(lis.innerHTML === cr) {
          lis.style.color = 'green';
        } else {
          lis.style.color = 'white';
        }
      }
      this.Close();
    }
    LeaveRoom() {
      var room_name = document.querySelector('#rom').value;
      this.props.OnLeaveRoom(room_name);
      
      //console.log(`click ${room_name}`);
    }
    Close() {
      let box = document.getElementById('rooms-box');
      box.style.display = "none";
    }
    render() {
      const opts ={
        sanitize: true
      };
      const roomst = this.props.rooms.map(rooms => React.createElement('li', { dangerouslySetInnerHTML: { __html: chuj(rooms,opts)},  onClick: this.JoinRoom }));
      return React.createElement(
        'div',
        {id: 'rooms-box'},
        React.createElement('div', {id: 'rooms-div'},
        React.createElement('a', {id: 'close-button-rooms', onClick: this.Close}, 'X'),
        React.createElement('input', { type: 'text', placeholder: 'enter room name', id: 'rom', ref: 'roomname', autofocus: true }),
        React.createElement(
          'button',
          {id: 'addroom-btn' , onClick: this.addRoom },
          'add room'
        ),
        React.createElement(
          'button',
          {id: 'leaveroom-btn' , onClick: this.LeaveRoom },
          'leave room'
        ),
        React.createElement('a', {id:'room-list-text'}, 'Room List'),
        React.createElement(
          'ul',
          {id: 'roomlist' },
          roomst
        )
        )
      );
    }
  }
export default CreateRooms;