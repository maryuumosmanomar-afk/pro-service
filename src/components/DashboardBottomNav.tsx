 import { Link } from "@tanstack/react-router";
import {
  Home,
  Wrench,
  MessageCircle,
  User,
} from "lucide-react";

type Props = {
  role: "customer" | "professional";
};

export default function DashboardBottomNav({
  role,
}: Props) {
  const dashboardLink =
    role === "customer"
      ? "/customer-dashboard"
      : "/professional-dashboard";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">

      <div className="mx-auto flex max-w-md items-center justify-around py-3">

        <Link
          to={dashboardLink}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </Link>

        <Link
          to="/services"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <Wrench className="h-6 w-6" />
          <span className="text-xs">Services</span>
        </Link>

        <Link
          to="/messages"
          search={{ receiverId: undefined }}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs">Messages</span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>

      </div>

    </div>
  );
}