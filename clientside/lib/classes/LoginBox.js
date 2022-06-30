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
          React.createElement('input', { type: 'text', placeholder: 'enter username', id: 'username', ref: 'username', autofocus: true, required: true }),
          React.createElement('input', { type: 'password', placeholder: 'enter password', id: 'password', ref: 'password', required: true }),
          React.createElement('button',{ type: 'button', onClick: this.senddata, id: 'login-button', autofocus: true}, 'Login'),
          React.createElement('button',{ type: 'button', onClick: this.regi, id: 'login-button', autofocus: true}, 'Register')
        )
      );
    }
}

export default LoginBox;