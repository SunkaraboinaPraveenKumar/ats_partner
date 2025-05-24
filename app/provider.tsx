"use client"
import React from 'react'
import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';
function Provider({children}: { children: React.ReactNode }) {
    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return (
    <ConvexProvider client={convex}>
        {children}
    </ConvexProvider>
  )
}

export default Provider