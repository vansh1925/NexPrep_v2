"use client";
import React from 'react'
import { AppSidebar } from './_components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function DashboardProvider({children}) {
  return (
    <SidebarProvider>
      <div>
        <AppSidebar />
        <div>
            <SidebarTrigger>
              {children}
            </SidebarTrigger>
          </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardProvider