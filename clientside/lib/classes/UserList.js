const chuj = require('marked');


class UserList extends React.Component {
  constructor(props){
    super(props);
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

export default UserList;