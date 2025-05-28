import { createContext, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({children}) =>{

    const [messages,setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket,axios} = useContext(AuthContext);

    //function to get all usersa for sidebar
    const getUsers = async() =>{
        try{
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
            }
        }catch(error){
            console.log(error.message);
            toast.error(error.message);
        }
    }

    const value = {
        getUsers,
    }
    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>)
}