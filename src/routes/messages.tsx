import { useEffect, useRef, useState } from "react";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Phone, Video, MoreVertical, Smile } from "lucide-react";
import DashboardBottomNav from "@/components/DashboardBottomNav";

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
  const receiverId = search.receiverId;

  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);



// ============================================
// CHECK RECEIVER ONLINE STATUS
// ============================================

useEffect(() => {
  if (!receiverId) {
    setIsOnline(false);
    return;
  }

  const handleOnlineUsersUpdated = (event: Event) => {
    const customEvent = event as CustomEvent<{
      onlineUserIds: string[];
    }>;

    const onlineUserIds =
      customEvent.detail?.onlineUserIds || [];

    setIsOnline(
      onlineUserIds.includes(receiverId)
    );
  };

  window.addEventListener(
    "online-users-updated",
    handleOnlineUsersUpdated
  );

  return () => {
    window.removeEventListener(
      "online-users-updated",
      handleOnlineUsersUpdated
    );
  };
}, [receiverId]);
 
  // ============================================
  // GET CURRENT USER
  // ============================================

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setCurrentUserId(user.id);
    }
  };

  // ============================================
  // LOAD RECEIVER PROFILE
  // ============================================

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
      console.log("Receiver profile error:", error.message);
      return;
    }

    setReceiverProfile(data);
  };

  // ============================================
  // GET PROFILE
  // ============================================

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_URL")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("Profile error:", error.message);
      return null;
    }

    return data;
  };

  // ============================================
  // LOAD CONVERSATIONS
  // ============================================

  const loadConversations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingConversations(false);
      return;
    }

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
        ascending: false,
      });

    if (error) {
      console.log(
        "Conversation error:",
        error.message
      );
      setLoadingConversations(false);
      return;
    }

    const uniqueUsers = new Map();

    data?.forEach((msg) => {
      const otherUser =
        msg.sender_id === user.id
          ? msg.receiver_id
          : msg.sender_id;

      if (!uniqueUsers.has(otherUser)) {
        uniqueUsers.set(otherUser, msg);
      }
    });

    const list = await Promise.all(
      Array.from(uniqueUsers.values()).map(async (msg) => {
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

  // ============================================
  // LOAD UNREAD COUNT
  // ============================================

  const loadUnreadCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { count, error } = await supabase
      .from("messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.log(
        "Unread count error:",
        error.message
      );
      return;
    }

    setUnreadCount(count || 0);
  };

  // ============================================
  // LOAD MESSAGES
  // ============================================

  const loadMessages = async () => {
    if (!receiverId) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    // Mark received messages as read
    await supabase
      .from("messages")
      .update({
        is_read: true,
      })
      .eq("sender_id", receiverId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    // Refresh unread count
    await loadUnreadCount();
  };

  // ============================================
  // INITIAL PAGE DATA
  // ============================================

  useEffect(() => {
    getCurrentUser();
    loadConversations();
    loadUnreadCount();
  }, []);

  // ============================================
  // LOAD SELECTED CONVERSATION
  // ============================================

  useEffect(() => {
    if (!receiverId || !currentUserId) {
      return;
    }

    loadReceiverProfile();
    loadMessages();

    const channel = supabase
      .channel(`messages-room-${currentUserId}-${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as any;

          const isThisConversation =
            (message.sender_id === currentUserId &&
              message.receiver_id === receiverId) ||
            (message.sender_id === receiverId &&
              message.receiver_id === currentUserId);

          if (isThisConversation) {
            loadMessages();
          } else {
            loadUnreadCount();
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [receiverId, currentUserId]);

  
  // ============================================
  // AUTO SCROLL
  // ============================================

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = async () => {
    const trimmedText = text.trim();

    if (!trimmedText || !receiverId) {
      return;
    }

    const {
      data: userData,
    } = await supabase.auth.getUser();

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
        message: trimmedText,
        is_read: false,
      });

    if (error) {
      console.log(
        "Send message error:",
        error.message
      );
      return;
    }

    setText("");

    await loadMessages();

    await loadConversations();

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ============================================
  // CONVERSATIONS PAGE
  // ============================================

  if (!receiverId) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">

        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 px-5 py-5 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-3xl">

            <h1 className="text-2xl font-bold text-slate-900">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Your conversations
            </p>

          </div>
        </div>

        {/* Conversations */}
        <main className="mx-auto max-w-3xl px-4 py-6">

          {loadingConversations ? (

            <div className="flex flex-col items-center justify-center py-20">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading conversations...
              </p>

            </div>

          ) : conversations.length === 0 ? (

            <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">

                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H5l-3 2 1-4a8 8 0 1117-6z"
                  />
                </svg>

              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No conversations yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Start a conversation with a professional to see your messages here.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Browse Services
              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {conversations.map((conversation) => {

                const otherUser =
                  conversation.sender_id === currentUserId
                    ? conversation.receiver_id
                    : conversation.sender_id;

                const avatar =
                  conversation.profile?.avatar_URL;

                const name =
                  conversation.profile?.full_name || "User";

                return (
                  <Link
                    key={conversation.id}
                    to="/messages"
                    search={{
                      receiverId: otherUser,
                    }}
                    className="group block rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex items-center gap-4">

                      {/* Avatar */}
                      <div className="relative shrink-0">

                        {avatar ? (

                          <img
                            src={avatar}
                            alt={name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-50"
                          />

                        ) : (

                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                            {name
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                        )}

                      </div>

                      {/* Message information */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-3">

                          <h3 className="truncate font-semibold text-slate-900 group-hover:text-blue-600">
                            {name}
                          </h3>

                          <span className="shrink-0 text-xs text-slate-400">
                            {new Date(
                              conversation.created_at
                            ).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>

                        </div>

                        <div className="mt-1 flex items-center justify-between gap-3">

                          <p className="truncate text-sm text-slate-500">
                            {conversation.message ||
                              "No message"}
                          </p>

                          <span className="shrink-0 text-xs text-slate-400">
                            {new Date(
                              conversation.created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                        </div>

                      </div>

                      {/* Arrow */}
                      <div className="hidden text-blue-500 transition-transform group-hover:translate-x-1 sm:block">
                        →
                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </main>

        {/* Bottom Navigation */}
        <DashboardBottomNav role="customer" />

      </div>
    );
  }

  // ============================================
  // CHAT PAGE
  // ============================================

  return (
    <div className="flex h-screen flex-col bg-gray-100">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b bg-white px-4 py-3">

        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="relative shrink-0">

            <img
              src={
                receiverProfile?.avatar_URL ||
                "https://ui-avatars.com/api/?name=User"
              }
              alt={
                receiverProfile?.full_name || "User"
              }
              className="h-12 w-12 rounded-full object-cover"
            />

            {/* Online Dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
            )}

          </div>

          {/* Name + Status */}
          <div>

            <h2 className="text-lg font-bold">
              {receiverProfile?.full_name || "User"}
            </h2>

            {isOnline && (
              <p className="text-xs text-green-500">
                Online
              </p>
            )}

          </div>

        </div>

        {/* Actions */}
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

                  <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">

                    <span>
                      {new Date(
                        msg.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {isMine && (
                      <span>
                        {msg.is_read
                          ? "✔✔"
                          : "✔"}
                      </span>
                    )}

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
            type="button"
            className="rounded-full p-2 hover:bg-gray-100"
            onClick={() => {
              setText((current) => `${current}😊`);
            }}
          >
            <Smile className="h-6 w-6 text-gray-500" />
          </button>

          {/* Text */}

          <textarea
            rows={1}
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-full border px-5 py-3 outline-none"
          />

          {/* Send */}

          <button
            type="button"
            onClick={sendMessage}
            className="rounded-full bg-blue-600 px-6 py-3 text-white"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}