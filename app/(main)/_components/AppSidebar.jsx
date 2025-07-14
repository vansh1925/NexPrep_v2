"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SidebarConstant } from "@/services/Constant.jsx"
import { usePathname } from "next/navigation"
import Link from "next/link"


export function AppSidebar() {
  const path=usePathname()

  return (
    <Sidebar collapsible="offcanvas">      
      <SidebarHeader className="flex flex-col items-center gap-4 py-4 px-3">
        <Image src="/NexprepLogo.png" width={150} height={80} alt="Logo" className="h-auto w-[150px]" />

      </SidebarHeader>
      <SidebarContent>      
        <SidebarGroup>
          <SidebarMenu>
            {SidebarConstant && SidebarConstant.map((option, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton 
                  asChild 
                  isActive={path === option.path}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Link href={option.path}>
                    {option.icon && <option.icon className={path === option.path ? "text-primary" : ""} size={18} />}
                    <span className={path === option.path ? "text-primary font-medium" : ""}>{option.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}