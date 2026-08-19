import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PresenceManager() {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const startPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      channel = supabase.channel("online-users", {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      const broadcastOnlineUsers = () => {
        if (!channel || cancelled) return;

        const state = channel.presenceState();

        const onlineUserIds = Object.values(state).flatMap(
          (presences: any) =>
            presences
              .map((presence: any) => presence.user_id)
              .filter(Boolean)
        );

        window.dispatchEvent(
          new CustomEvent("online-users-updated", {
            detail: {
              onlineUserIds,
            },
          })
        );
      };

      // MUHIIM:
      // Dhammaan presence callbacks-ka waa in la dhigaa
      // KA HOR subscribe().
      channel.on(
        "presence",
        { event: "sync" },
        () => {
          console.log("Presence sync");
          broadcastOnlineUsers();
        }
      );

      channel.on(
        "presence",
        { event: "join" },
        ({ key }) => {
          console.log("User joined:", key);
          broadcastOnlineUsers();
        }
      );

      channel.on(
        "presence",
        { event: "leave" },
        ({ key }) => {
          console.log("User left:", key);
          broadcastOnlineUsers();
        }
      );

      channel.subscribe(async (status) => {
        console.log("PresenceManager status:", status);

        if (status !== "SUBSCRIBED" || cancelled) {
          return;
        }

        await channel?.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });

        console.log("User presence tracked:", user.id);

        // Markaa status-ka hadda jira isla markiiba dir
        broadcastOnlineUsers();
      });
    };

    startPresence();

    return () => {
      cancelled = true;

      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
        channel = null;
      }

      // Nadiifi online users markii user-ku baxo
      window.dispatchEvent(
        new CustomEvent("online-users-updated", {
          detail: {
            onlineUserIds: [],
          },
        })
      );
    };
  }, []);

  return null;
}