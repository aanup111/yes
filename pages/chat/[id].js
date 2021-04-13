import styled from 'styled-components';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import Chatscreen from '../../components/Chatscreen';
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import getRecipientEmail from '../../utils/getRecipientEmail';

function Chat({ chat, messages }) {
    const[user] = useAuthState(auth);
    return (
       <Container>
           <Head>
               <title>Chat with {getRecipientEmail(chat.users, user)}</title>
           </Head>
           <Sidebar />
           <ChatContainer>
                <Chatscreen chat ={chat} messages={messages}/>
           </ChatContainer>
       </Container>
    )
}

export default Chat;

// pre-fetching data from server side ( server side rendered)
export async function getServerSideProps(context) {
    const ref = db.collection('chats').doc(context.query.id);
    
    //prep the messages on the server
    const messegesRef = await ref.collection('messages')
        .orderBy('timestamp', 'asc').get();

    const messages = messegesRef.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).map(messages => ({
            ...messages,
            timestamp: messages.timestamp.toDate().getTime()
        }));

    // prep the chats 
    const chatRes = await ref.get();
    const chat = {
        id: chatRes.id,
        ...chatRes.data()
    }

    return {
        props: {
            messages: JSON.stringify(messages),
            chat: chat,
        }
    };

    }

const Container = styled.div`
    display:flex;
`;

const ChatContainer = styled.div`
    flex: 1;
    overflow: scroll;
    height:100vh;

    // hide scrollbar
    ::-webkit-scrollbar{
        display: none;
    }
    -ms-overflow-style: none; // IE and Edge
    scrollbar-width: none; // Firefox

`;