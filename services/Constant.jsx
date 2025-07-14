import { Calendar, LayoutDashboard, List, LogOut, Settings, WalletCards } from "lucide-react"

export const SidebarConstant =[

    {
        name: "Dashboard",
        icon:LayoutDashboard,
        path: "/dashboard",
    },

    {
        name: "All Interviews",
        icon: List,
        path: "/all-interviews",
    },
    {
        name: "Billing",
        icon: WalletCards,
        path: "/billing",
    },
    {
        name: "Settings",
        icon: Settings,
        path: "/settings",
    },
    {
        name: "Signout",
        icon: LogOut,
        path: "/logout",
    }
]
import {
  Code2Icon,
  User2Icon,
  BriefcaseBusinessIcon,
  Puzzle,
  MessageSquare,
  Brain,
  Speech,
} from "lucide-react";

export const InterviewType = [
  {
    title: "Technical",
    icon: Code2Icon,
  },
  {
    title: "Behavioral",
    icon: User2Icon,
  },
  {
    title: "Experience",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Problem Solving",
    icon: Puzzle,
  },
  {
    title: "Communication",
    icon: MessageSquare,
  },
  {
    title: "Critical Thinking",
    icon: Brain,
  },
  {
    title: "Situational",
    icon: Speech,
  },
];

