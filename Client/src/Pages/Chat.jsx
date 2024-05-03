import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:7000');

const Chat = () => {
    
    const currentUser = "Wall.E";
    const recipient = "Eva";
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
  
    useEffect(() => {
      // Event listener for receiving messages
      socket.on('connect', () => {
        // setMessages(prevMessages => [...prevMessages, data]);
        console.log('Connected');
      });

      socket.on('received', (data) => {
        console.log('received', data);
        setMessages(old => [...old, data]);
      })

      socket.on('welcome', (s) => {
        console.log(s);
      })
  
      // return () => {
      //   socket.off('receive_message');
      // };
    }, []);
  
    const sendMessage = () => {
      socket.emit('message', message);
      setMessage('');
    };
  
    return (
      <div>
        <h2>Chatting with {recipient}</h2>
        <div>
          {messages ? (messages?.map((msg, index) => (
            <div key={index}>
              
              {msg.message}
            </div>
          ))) : "Nothing"}
        </div>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    );
  };
  
  export default Chat;