'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateUniqueLink } from '@/lib/utils'

export default function GenerateLink() {
  const [link, setLink] = useState('')

  const handleGenerateLink = () => {
    const newLink = generateUniqueLink()
    setLink(newLink)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Generate Link</h1>
      <Button onClick={handleGenerateLink} className="w-full">Generate Unique Link</Button>
      {link && (
        <div className="space-y-2">
          <Input value={link} readOnly />
          <Button onClick={handleCopyLink} variant="outline" className=" bg-blue-600 text-white w-full ">Copy Link</Button>
        </div>
      )}
      <Link href="/dashboard">
        <Button variant="outline" className="w-full m-2">Go to Dashboard</Button>
      </Link>
    </div>
  )
}

