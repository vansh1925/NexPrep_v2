import React from 'react'
import DashboardProvider from './provider'
import Provider from '../provider'

function DashboardLayout({children}) {
  return (
    <div className="w-full">
        <Provider>
          <DashboardProvider>
            <div className='pt-4 w-full'>
              {children}
            </div>
          </DashboardProvider>
        </Provider>
    </div>

  )
}

export default DashboardLayout