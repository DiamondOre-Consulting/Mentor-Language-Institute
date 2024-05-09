import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const Chat = () => {

  const socket = useMemo(() => io('http://localhost:7000'), [])
  // const socket = io('http://localhost:7000')
    
    // const currentUser = "Wall.E";
    // const recipient = "Eva";
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [sentMsg, setSentMsg] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [room, setRoom] = useState('');
    const [socketId, setSocketId] = useState('');

    // console.log(messages);

    const sendMessage = (e) => {
      e.preventDefault();
      socket.emit('message', {room, message});
      setMessage('');

    };
  

    useEffect(() => {
      // Event listener for receiving messages
      socket.on('connect', () => {
        setSocketId(socket.id);
        console.log('Connected');
      });

      socket.on('received', (data) => {
        console.log('received', data);
        setMessages((messages) => [...messages, data]);
      })
      


      socket.on('welcome', (s) => {
        console.log(s);
      })
  
      return () => {
        socket.disconnect();
      };
    }, []);

    // useEffect(() => {
    //   const totalCon = messages+sentMsg
    //   setConversation((conversation) => [...conversation, totalCon])
    // }, [messages, sentMsg])
  
    return (
      <div className='mt-16'>
        <h6>{socketId}</h6>
        <input type="text" value={room} onChange={e => setRoom(e.target.value)} />
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
        <div>
          {messages ? (messages?.map((msg, index) => (
            <div key={index}>
              
              {msg}
            </div>
          ))) : "Nothing"}
          {/* {conversation.map((message, index) => (
            <p key={index}>{message}</p>
          ))} */}
        </div>
      </div>
    );
  };
  
  export default Chat;