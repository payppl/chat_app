

class InputBar extends React.Component {
    constructor(props) {
      super(props);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onInput = this.onInput.bind(this);
      this.onSendEmoji = this.onSendEmoji.bind(this);
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
          'a',
          {id: 'emoji-btn', onClick: this.onSendEmoji },
          '😁'
        )
      );
    }
}
export default InputBar;