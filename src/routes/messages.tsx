import { useEffect, useRef, useState } from "react";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Phone, Video, MoreVertical, Smile } from "lucide-react";


export const Route = createFileRoute("/messages")({
validateSearch: (search) => {
  return {
    receiverId: search.receiverId as string | undefined,
  };
},
  component: MessagesPage,
});

function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const search = useSearch({ from: "/messages" });
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
const [isOnline, setIsOnline] = useState(true);
const [conversations, setConversations] = useState<any[]>([]);
const [loadingConversations, setLoadingConversations] = useState(true);


const receiverId = search.receiverId;

useEffect(() => {

  getCurrentUser();
  
  loadConversations();

  if (!receiverId) return;

  loadReceiverProfile();

  loadMessages();

  const channel = supabase
    .channel("messages-room")
   .on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "messages",
  },
  (payload) => {
    console.log("realtime payload:", payload );
    const message = payload.new as any;
    console.log("New message:", message);

    if (
      (message.sender_id === currentUserId &&
        message.receiver_id === receiverId) ||
      (message.sender_id === receiverId &&
        message.receiver_id === currentUserId)
    ) {
      console.log("loading messages...");
      
      loadMessages();
    }
  }
)
.subscribe((status) => {
  console.log("Realtime status:", status);
});

  return () => {
    supabase.removeChannel(channel);
  };

}, [receiverId]);

const getCurrentUser = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (user) {
    setCurrentUserId(user.id);
  }

};
const loadReceiverProfile = async () => {

  if (!receiverId) return;

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      full_name,
     avatar_URL
    `)
    .eq("id", receiverId)
    .single();

  if (error) {
    console.log(error.message);
    return;
  }

  setReceiverProfile(data);

  // Temporary
  setIsOnline(true);

};
const loadConversations = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;


  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      message,
      created_at,
      sender_id,
      receiver_id
    `)
    .or(
      `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
    )
    .order("created_at", {
      ascending:false
    });


  if(error){
    console.log(
      "Conversation error:",
      error.message
    );
    return;
  }


  const uniqueUsers = new Map();


  data?.forEach((msg)=>{

    const otherUser =
      msg.sender_id === user.id
      ? msg.receiver_id
      : msg.sender_id;


    if(!uniqueUsers.has(otherUser)){
      uniqueUsers.set(otherUser,msg);
    }

  });


 const list = await Promise.all(
  Array.from(uniqueUsers.values()).map(async (msg)=>{

    const otherUser =
      msg.sender_id === user.id
      ? msg.receiver_id
      : msg.sender_id;

    const profile = await getProfile(otherUser);

    return {
      ...msg,
      profile,
    };

  })
);


setConversations(list);

  setLoadingConversations(false);

};
const getProfile = async (userId:string) => {

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_URL")
    .eq("id", userId)
    .single();

  if(error){
    console.log(error.message);
    return null;
  }

  return data;
};
const getConversationProfiles = async () => {

  if (conversations.length === 0) return;

  const ids = conversations.map((item:any)=>{

    return item.sender_id === currentUserId
      ? item.receiver_id
      : item.sender_id;

  });


  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_URL
    `)
    .in("id", ids);


  if(error){
    console.log(
      "Profiles error:",
      error.message
    );
    return;
  }


  const merged = conversations.map((conversation:any)=>{

    const otherId =
      conversation.sender_id === currentUserId
      ? conversation.receiver_id
      : conversation.sender_id;


    return {
      ...conversation,
      profile:
        data?.find(
          (p)=>p.id === otherId
        )
    };

  });


  setConversations(merged);

};
  const loadMessages = async () => {

  if (!receiverId) {
    console.log("No receiver selected");
    return;
  }


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    console.log("No user logged in");
    return;
  }


  const { data, error } = await supabase
    .from("messages")
    .select("*")
 .or(
  `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
)
    .order("created_at", {
      ascending: true,
    });


  if (error) {
    console.log(
      "Load messages error:",
      error.message
    );
    return;
  }


  setMessages(data || []);
  console.log("Loaded messages:", data);
};
useEffect(() => {
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, 100);
}, [messages]);

  const sendMessage = async () => {

   if (!text || !receiverId) {
 alert("Write message");
 return;
}


    // userka hadda login ku jira
    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;


    if (!user) {
      alert("You are not logged in");
      return;
    }


    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: text,
        is_read: false,
      });


    if (error) {
      console.log("Send error:", error.message);
      return;
    }
    setText("");

await loadMessages();

messagesEndRef.current?.scrollIntoView({
  behavior: "smooth",
});




  };

  if (!receiverId) {
  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h2 className="mb-5 text-2xl font-bold">
        Conversations
      </h2>

      {loadingConversations ? (
        <p>Loading...</p>
      ) : conversations.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        conversations.map((conversation) => {

  const otherUser =
    conversation.sender_id === currentUserId
      ? conversation.receiver_id
      : conversation.sender_id;

  return (
    <Link
      key={conversation.id}
      to="/messages"
      search={{
        receiverId: otherUser,
      }}
      className="mb-3 block rounded-lg bg-white p-4 shadow hover:bg-gray-50"
    >
<div className="flex items-center gap-3">

  <img
    src={
      conversation.profile?.avatar_URL ||
      "https://ui-avatars.com/api/?name=User"
    }
    className="h-12 w-12 rounded-full object-cover"
  />


  <div>

    <p className="font-semibold">
      {conversation.profile?.full_name || "User"}
    </p>

    <p className="text-sm text-gray-500">
      {conversation.message}
    </p>

  </div>

</div>

      <p className="text-sm text-gray-500">
        {new Date(
          conversation.created_at
        ).toLocaleString()}
      </p>

    </Link>
  );
})
      )}
    </div>
  );
}
  return (

<div className="flex h-screen flex-col bg-gray-100">

  {/* HEADER */}

  <div className="flex items-center justify-between border-b bg-white px-5 py-4 shadow-sm">

    <div className="flex items-center gap-3">

      <img
        src={
          receiverProfile?.avatar_URL ||
          "https://ui-avatars.com/api/?name=User"
        }
        className="h-12 w-12 rounded-full object-cover"
      />

      <div>

        <h2 className="font-bold text-lg">
          {receiverProfile?.full_name || "User"}
        </h2>

        <p className="text-sm text-green-600">
          {isOnline ? "Online" : "Offline"}
        </p>

      </div>

    </div>

    <div className="flex gap-4">

      <Phone className="h-5 w-5 cursor-pointer" />

      <Video className="h-5 w-5 cursor-pointer" />

      <MoreVertical className="h-5 w-5 cursor-pointer" />

    </div>

  </div>
  {/* CHAT AREA */}

<div className="flex-1 overflow-y-auto p-5">

  {messages.length === 0 ? (

    <div className="mt-10 text-center text-gray-500">
      No messages yet
    </div>

  ) : (

    messages.map((msg) => {

      const isMine =
        msg.sender_id === currentUserId;

      return (

        <div
          key={msg.id}
          className={`mb-3 flex ${
            isMine
              ? "justify-end"
              : "justify-start"
          }`}
        >

          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow ${
              isMine
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >

            <p>
 {msg.message}
</p>


<div className="
flex
justify-end
items-center
gap-1
mt-1
text-xs
opacity-70
">

<span>

{
 new Date(
 msg.created_at
 )
 .toLocaleTimeString(
 [],
 {
 hour:"2-digit",
 minute:"2-digit"
 }
 )
}

</span>


{
isMine && (

<span>

{msg.is_read ? "✔✔" : "✔"}

</span>

)

}


</div>

          </div>

        </div>

      );

    })

  )}

  <div ref={messagesEndRef} />

</div>
{/* INPUT AREA */}

<div className="border-t bg-white p-4">

  <div className="flex items-center gap-3">


    {/* Emoji */}

    <button
      className="rounded-full p-2 hover:bg-gray-100"
      onClick={()=>{
        setText(text + "😊");
      }}
    >

      <Smile className="h-6 w-6 text-gray-500"/>

    </button>



    {/* Text */}

    <textarea

      rows={1}

      value={text}

      onChange={(e)=>
        setText(e.target.value)
      }

      onKeyDown={(e)=>{

        if(
          e.key === "Enter" &&
          !e.shiftKey
        ){

          e.preventDefault();

          sendMessage();

        }

      }}

      placeholder="Type a message..."

      className="
      flex-1
      resize-none
      rounded-full
      border
      px-5
      py-3
      outline-none
      "

    />



    {/* Send */}

    <button

      onClick={sendMessage}

      className="
      rounded-full
      bg-blue-600
      px-6
      py-3
      text-white
      "

    >

      Send

    </button>


  </div>

</div>

</div>

);
}

