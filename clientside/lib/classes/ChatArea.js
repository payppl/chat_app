


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

export default ChatArea;