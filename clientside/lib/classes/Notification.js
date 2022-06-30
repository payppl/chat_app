class Notification extends React.Component {
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
export default Notification;