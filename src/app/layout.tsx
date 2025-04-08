import React from 'react';
import './globals.css'

export const metadata = {
  title: 'AI Movie Recommendations',
  description: 'Get personalized movie recommendations powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  )
}