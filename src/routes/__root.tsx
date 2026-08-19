import { createRootRoute, Outlet } from "@tanstack/react-router";
import PresenceManager from "@/components/PresenceManager";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <PresenceManager />

      <Outlet />
    </>
  );
}