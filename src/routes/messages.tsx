import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";


export const Route = createFileRoute("/messages")({
  validateSearch: (search) => {
    return {
      receiverId: search.receiverId as string,
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
const [isOnline, setIsOnline] = useState(false);

const receiverId = search.receiverId;

  useEffect(() => {

  if (!receiverId) return;

  getCurrentUser();
  loadMessages();
  loadReceiverProfile();




  const channel = supabase
    .channel("messages-room")

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        loadMessages();
      }
    )

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };

},  [receiverId]);

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
      avatar_url
    `)
    .eq("id", receiverId)
    .single();


  if (error) {
    console.log(error.message);
    return;
  }


  setReceiverProfile(data);

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
  `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),
   and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    console.log(
      "Load messages error:",
      error.message
    );
    return;
  }


  setMessages(data || []);
};
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
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

return (
  <div className="flex h-screen flex-col bg-gray-100">

    {/* HEADER */}
    <div className="flex items-center gap-3 border-b bg-white px-5 py-4 shadow-sm">

      <img
        src={
          receiverProfile?.avatar_url ||
          "https://ui-avatars.com/api/?name=User"
        }
        className="h-12 w-12 rounded-full object-cover"
      />

      <div>
        <h2 className="font-bold">
          {receiverProfile?.full_name || "User"}
        </h2>

        <p className="text-sm text-green-600">
          {isOnline ? "Online" : "Offline"}
        </p>

      </div>

    </div>


    {/* CHAT AREA */}

    <div className="flex-1 overflow-y-auto p-5">

      {messages.length === 0 ? (

        <p className="text-center text-gray-500 mt-10">
          No messages yet
        </p>

      ) : (

        messages.map((msg)=>{

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


              </div>

            </div>

          );

        })

      )}


      <div ref={messagesEndRef}/>

    </div>



    {/* INPUT */}

    <div className="border-t bg-white p-4">

      <div className="flex gap-3">


        <textarea
          rows={1}
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-xl border p-3"
        />


        <button
          onClick={sendMessage}
          className="rounded-xl bg-blue-600 px-6 text-white"
        >
          Send
        </button>


      </div>

    </div>


  </div>
);


  };


  <div/>
}