import Chatcontext from "./Chatcontext";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

const Usechat = (props) => {

    const [userdet, setuserdet] = useState(null); // object
    const [token, setToken] = useState(localStorage.getItem("token")); // string
    const [socket, setSocket] = useState(null); // object
    const [onlineUsers, setOnlineUsers] = useState([]); // array  [""id,"id"]
    const [messages, setMessages] = useState([]); // array
    const [users, setUsers] = useState([]); // array
    const [selectedUser, setSelectedUser] = useState(null); // object
    const [newMessage, setNewMessage] = useState({ text: "", image: "" }); // object
    const [mediaFiles, setMediaFiles] = useState([]);
    const [unseenMessages, setUnseenMessages] = useState({})
    const [updateprofile, setupdateprofile] = useState(null);
    const [mike,setmike] = useState(null)

    const getusers = async () => {
        if (!token) {
            return;
        }
        try {
            const response = await fetch("https://real-time-chatapp-1-0iom.onrender.com/user/userdetails", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "token": `${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setuserdet(data.details);
                setupdateprofile(data.details);
                if (!socket) {
                    connectsocket(data.details);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error("Error fetching users");
        }
    }

    // connecting the socket , refer to app.js
    const connectsocket = async (userdet) => {
        try {
            if (!userdet || socket?.connected) {
                return;
            }
            const newSocket = io("https://real-time-chatapp-1-0iom.onrender.com", {
                query: {
                    userId: userdet._id
                }
            });

            newSocket.on("connect", () => {
                console.log("Socket connected");
            });

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                toast.error("Connection error. Please try again.");
            });

            newSocket.on("getOnlineUsers", (userIds) => {
                setOnlineUsers(userIds);
            });

            setSocket(newSocket);
        } catch (error) {
            console.log(error);
            toast.error("Error connecting to socket");
        }
    }

    // messages data

    const getuserfrnds = async () => {
        try {
            const response = await fetch("https://real-time-chatapp-1-0iom.onrender.com/message/userfrnd", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "token": `${token}`
                }
            })
            const data = await response.json()
            // console.log(data)
            setUsers(data.users)
            setUnseenMessages(data.unseenmessages)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getmessages = async (userId) => {   // selected and our user messages
        try {
            const response = await fetch(`https://real-time-chatapp-1-0iom.onrender.com/message/convo/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "token": `${token}`
                }
            })
            const data = await response.json()
            if (data.success) {
                setMessages(data.message)
            }
            else {
                toast.error("in valid")
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendmessage = async (newMessage) => {
        try {
            const response = await fetch(`https://real-time-chatapp-1-0iom.onrender.com/message/send/${selectedUser._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "token": `${token}`
                },
                body: JSON.stringify({
                    text: newMessage.text || "",
                    image: newMessage.image || ""
                })
            })
            if (!response.ok) {
                const errData = await response.json();
                toast.error(errData.message || "Failed to send message");
                return;
            }

            const data = await response.json();
            setMessages((prevMessages) => [...prevMessages, data.newmessage]);
            // const data = await response.json()
            // if(data.success){
            //     console.log(data.newmessage)
            //     setMessages((prevMessages)=>[...prevMessages,data.newmessage])
            // }
            // else{
            //     toast.error("message failed");
            // }
        } catch (error) {
            toast.error(error.message);
            console.log(error.message)
        }
    }

    const subscribeToMessages = () => {
        if (!socket) return;

        // Always clean up before re-subscribing to avoid stacking listeners
        socket.off("newmessage");

        socket.on("newmessage", async (newmessage) => {
            if (newmessage.senderId === selectedUser?._id) {
                newmessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newmessage]);
                await fetch(`https://real-time-chatapp-1-0iom.onrender.com/message/mark/${newmessage._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "token": `${token}`
                    }
                });
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newmessage.senderId]: (prevUnseenMessages[newmessage.senderId] || 0) + 1
                }));
                setMessages((prevMessages) => [...prevMessages, newmessage]);
            }
        });
    };

    const unsubscribeToMessages = () => {
        if (!socket) return;
        socket.off("newmessage")
    }

    useEffect(() => {
        if (selectedUser) {
            subscribeToMessages()
        }
        else {
            unsubscribeToMessages()
        }
    }, [selectedUser, socket])
    useEffect(() => {
        if (token && !socket) {
            getusers();
        }
        return () => {
            if (socket?.connected) {
                socket.disconnect();
            }
        };
    }, [token]);

    useEffect(() => {
        if (token && userdet) {
            getuserfrnds();
        }
    }, [onlineUsers, token, userdet]);





    const contextValue = {
        userdet,
        setuserdet,
        token,
        setToken,
        socket,
        setSocket,
        onlineUsers,
        setOnlineUsers,
        messages,
        setMessages,
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        newMessage,
        setNewMessage,
        mediaFiles,
        setMediaFiles,
        unseenMessages,
        setUnseenMessages,
        updateprofile,
        connectsocket,
        setupdateprofile,
        getusers,
        getuserfrnds,
        sendmessage,
        subscribeToMessages,
        unsubscribeToMessages,
        getmessages,
        mike,
        setmike
    }

    return (
        <Chatcontext.Provider value={contextValue}>
            {props.children}
        </Chatcontext.Provider>
    )
}

export default Usechat
