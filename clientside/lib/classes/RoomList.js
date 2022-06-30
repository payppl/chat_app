const chuj = require('marked');


class RoomList extends React.Component {
    constructor(props){
      super(props);
      this.openRooms = this.openRooms.bind(this);
      this.JoinRoom = this.JoinRoom.bind(this);
    }
    openRooms(){
      let romb = document.getElementById("rooms-box");
      romb.style.display = 'flex';
      let cr = this.props.returnCRoom();
      for(const lis of document.querySelectorAll('#roomlist>li>p')){
        if(lis.innerHTML === cr) {
          lis.style.color = 'green';
        } else {
          lis.style.color = 'black';
        }
      }
    }
    JoinRoom() {
      var e = event.target.innerText;
      this.props.onJoinTR(e);
      let cr = this.props.returnCRoom();
      for(const lis of document.querySelectorAll('#room-list>li>p')){
        if(lis.innerHTML === cr) {
          lis.style.color = 'green';
        } else {
          lis.style.color = 'white';
        }
      }
    }
    render() {
      const opts = { sanitize: true };
      const rooms = this.props.rooms.map(room => React.createElement('li', { dangerouslySetInnerHTML: { __html: chuj(room,opts)} }));
  
  
      return React.createElement(
        'div',
        {id: 'roomlistdiv'},
        React.createElement('button', {id: 'open-rooms-box', onClick: this.openRooms , type: 'button'}, 'menage rooms'),
        React.createElement('a', null ,'Room List'),
        React.createElement(
          'ul',
          { id: 'room-list', onClick: this.JoinRoom },
          rooms,
        ),
      );
    }
  }

export default RoomList;