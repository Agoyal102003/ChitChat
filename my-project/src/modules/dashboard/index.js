import React, { useEffect, useRef, useState} from 'react';
import Avatar from '../../assets/Avatar.svg';
import Call from '../../assets/Call.svg';
import Send from '../../assets/Send.svg';
import Plus from '../../assets/Plus.svg';
import Input from '../../components/input';
import {io} from 'socket.io-client';

const Dashboard = () => {

  //   const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState({})
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const messageRef=useRef(null)

  console.log(messages, 'messages')

  useEffect(() => {
    setSocket(io('http://localhost:8080'))
  }, [])

  useEffect(() => {
    socket?.emit('addUser', user?.id)
    socket?.on('getUsers', users =>{
      console.log('activeUsers:>>', users);
    })
    socket?.on('getMessage', data => {
      // setMessages({messages: [...messages?.messages, data], receiver: messages?.receiver, conversationId: messages?.conversationId})
      setMessages(prev => ({
        ...prev,
        messages: [...prev.messages, {user: data.user, message: data.message}]
      }))
    })
  }, [socket])

  useEffect(() => {
    messageRef?.current?.scrollIntoView({behaviour:'smooth'})
  }, [messages?.messages])

  useEffect(() => {
    const loggedInUser= JSON.parse(localStorage.getItem('user:detail'))
    const fetchConversations= async() => {
        const res=await fetch (`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resData=await res.json()
        console.log('resData:>>', resData)
        setConversations(resData)
    }
    fetchConversations();
  }, [])

  useEffect(() => {
    const fetchUsers= async() => {
      console.log("Request to fetch users is being made")
      const res=await fetch (`http://localhost:8000/api/users/${user?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resData=await res.json()
        console.log('Response from server:', resData);
        setUsers(resData)
    };
    if (user) {
      fetchUsers();
    }
  }, [user])

  useEffect(() => {
    try {
      const userDetail = localStorage.getItem('user:detail');
      setUser(JSON.parse(userDetail));
    } catch (error) {
      console.error('Error parsing user details:', error);
    }
  }, []);

  console.log('user:>>', user);
  console.log('conversations:>>', conversations);

  const fetchMessages= async(conversationId, receiver) => {
    const res=await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user.id}&&receiverId=${messages?.receiver?.receiverId}`, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json'
        }
    });
    const resData= await res.json()
    console.log('resData :>>', resData);
    setMessages({messages: resData, receiver, conversationId})
  }

  const sendMessage=async(e) => {
    socket?.emit('sendMessage', {
      conversationId: messages?.conversationId,
          senderId: user.id,
          message,
          receiverId: messages.receiver.receiverId,
    });
    const res=await fetch(`http://localhost:8000/api/message`, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
          conversationId: messages?.conversationId,
          senderId: user.id,
          message,
          receiverId: messages.receiver.receiverId,
        })
    });
    if (res.ok) {
      setMessage('');
    } else {
      console.error('Failed to send message:', res.status, res.statusText);
    }
  }

  return (
    <div className='w-screen flex'>
      <div className='w-[25%] h-screen bg-secondary overflow-scroll'>
        <div className='flex items-center my-8 mx-14'>
          <div className='border border-primary p-2 rounded-full'><img src={Avatar} width={75} height={75} /></div>
          <div className='ml-6'>
          <h3 className='text-2xl'>{user?.fullName}</h3>

            <p className='text-lg font-light'>My account</p>
          </div>
        </div>
        <hr />
        <div className='mx-14 mt-10'>
          <div className='text-primary text-lg'>Messages</div>
          <div>
            {
                conversations.length >0 ?
                conversations.map(({ conversationId, user, img }, index) => (
              <div key={index} className='flex items-center py-8 border-b border-b-gray-300'>
                <div className='cursor-pointer flex items-center' onClick={() => fetchMessages(conversationId, user )}>
                  <div><img src={Avatar} width={60} height={60} /></div>
                  <div className='ml-6'>
                    <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                    <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                  </div>
                </div>
              </div>
            )) : <div className='text-center text-lg font-semibold mt-24'>No conversations</div>
            }
          </div>
        </div>
      </div>
      <div className='w-[50%] h-screen bg-white flex flex-col items-center'>
        {
          messages?.receiver?.fullName &&
          <div className='w-[75%] bg-secondary h-[80px] my-14 py-2 rounded-full flex items-center px-14'>
          <div className='cursor-pointer'><img src={Avatar} width={60} height={60} /></div>
          <div className='ml-6 mr-auto'>
            <h3 className='text-lg' >{messages?.receiver?.fullName}</h3>
            <p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
          </div>
          <div className='cursor-pointer'>
            <img src={Call} width={24} height={24} />
          </div>
        </div>}
        <div className='h-[75%] w-full overflow-scroll shadow-sm'>
          <div className='p-14'>
            {
              messages?.messages?.length>0 ?
              messages.messages.map(({message, user : {id}= {}}) => {
                return(
                  <div>
                  <div className={`max-w-[60%] rounded-b-xl p-4 mb-6 ${id===user?.id ? 
                  'rounded-tl-xl ml-auto text-white bg-primary' : 'bg-secondary rounded-tr-xl'} `} >
                  {message}</div>
                  <div ref={messageRef}></div>
                  </div>
                  )
              }) : <div className='text-center text-lg font-semibold mt-24'>No messages</div>
            }
          </div>
        </div>
        {
          messages?.receiver?.fullName &&
          <div className='p-14 w-full flex item-center'>
          <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className='w-[100%]' inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none' />
          <div className={`cursor-pointer ml-4 p-2 bg-light rounded-full ${!message && 'pointer-events-none'}`} onClick={() => sendMessage()}>
            <img src={Send} width={30} height={30} />
          </div>
          <div className={`cursor-pointer ml-4 p-2 bg-light rounded-full ${!message && 'pointer-events-none'}`}>
            <img src={Plus} width={30} height={30} />
          </div>
          </div>
        }
      </div>
      <div className='w-[25%] h-screen bg-light px-8 py-16 overflow-scroll' >
        <div className='text-primary text-lg'>People</div>
        <div>
            {
                users.length >0 ?
                users.map(({ userId, user, img }, index) => (
              <div key={index} className='flex items-center py-8 border-b border-b-gray-300'>
                <div className='cursor-pointer flex items-center' onClick={() => fetchMessages('new', user )}>
                  {/* <div><img src={img} width={60} height={60} /></div> */}
                  <div><img src={Avatar} width={60} height={60} alt={`${user?.fullName} icon`} /></div>
                  <div className='ml-6'>
                    <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                    <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                  </div>
                </div>
              </div>
            )) : <div className='text-center text-lg font-semibold mt-24'>No conversations</div>
            }
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
