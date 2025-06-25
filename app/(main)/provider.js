"use client";
import React from 'react'
import { AppSidebar } from './_components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function DashboardProvider({children}) {
  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <div className="flex-1 relative">
            <div className="absolute top-4 left-4">
              <SidebarTrigger />
            </div>
            <div className="pt-6 w-full">
              {children}
            </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardProvider