import {
  Video, Zap, Home, Heart, Camera, Monitor, Car, Stethoscope,
} from "lucide-react";

export const serviceCategories = [
  { id: "video", title: "Video Editors", description: "Professional video editing & post-production", icon: Video, color: "oklch(0.55 0.2 260)", professionals: 48 },
  { id: "electrical", title: "Electricians", description: "Licensed electrical installations & repairs", icon: Zap, color: "oklch(0.7 0.17 75)", professionals: 62 },
  { id: "renovation", title: "House Renovation", description: "Complete home renovation & remodeling", icon: Home, color: "oklch(0.55 0.17 155)", professionals: 35 },
  { id: "makeup", title: "Wedding Makeup", description: "Bridal & event makeup artistry", icon: Heart, color: "oklch(0.6 0.2 350)", professionals: 29 },
  { id: "photography", title: "Photographers", description: "Events, portraits & commercial photography", icon: Camera, color: "oklch(0.5 0.15 200)", professionals: 54 },
  { id: "computer", title: "Computer Technicians", description: "PC repair, networking & IT support", icon: Monitor, color: "oklch(0.45 0.18 260)", professionals: 41 },
  { id: "mechanic", title: "Car Mechanics", description: "Auto repair, maintenance & diagnostics", icon: Car, color: "oklch(0.5 0.1 40)", professionals: 38 },
  { id: "medical", title: "Emergency Medical", description: "First aid & emergency medical support", icon: Stethoscope, color: "oklch(0.55 0.22 25)", professionals: 22 },
];

export const featuredProfessionals = [
  { id: 1, name: "Sarah jama", title: "Senior Video Editor", category: "Video Editors", rating: 4.9, reviews: 127, hourlyRate: 65, location: "Downtown", distance: "1.2 km", avatar: "SC" },
  { id: 2, name: "Mike Johnson", title: "Licensed Electrician", category: "Electricians", rating: 4.8, reviews: 89, hourlyRate: 55, location: "Midtown", distance: "2.5 km", avatar: "MJ" },
  { id: 3, name: "Emily Rose", title: "Bridal Makeup Artist", category: "Wedding Makeup", rating: 5.0, reviews: 64, hourlyRate: 80, location: "Uptown", distance: "0.8 km", avatar: "ER" },
  { id: 4, name: "James Lee", title: "Auto Mechanic", category: "Car Mechanics", rating: 4.7, reviews: 103, hourlyRate: 50, location: "Eastside", distance: "3.1 km", avatar: "JL" },
];

export const mockRequests = [
  { id: "REQ-001", customer: "Alex Morgan", service: "Electricians", message: "Need wiring fixed in kitchen", status: "pending" as const, date: "2026-05-06", distance: "1.5 km" },
  { id: "REQ-002", customer: "Lisa Park", service: "Video Editors", message: "Wedding video editing needed", status: "accepted" as const, date: "2026-05-05", distance: "2.3 km" },
  { id: "REQ-003", customer: "Tom Wilson", service: "Photographers", message: "Corporate headshots for team", status: "completed" as const, date: "2026-05-03", distance: "0.9 km" },
  { id: "REQ-004", customer: "Nina Ray", service: "Computer Technicians", message: "Laptop not booting up", status: "rejected" as const, date: "2026-05-04", distance: "4.2 km" },
];