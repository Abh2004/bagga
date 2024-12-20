'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFolders } from '@/lib/utils'

export default function Dashboard() {
  const [folders, setFolders] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setFolders(getFolders())
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(folders).map(([name, photos]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative overflow-hidden rounded">
                <Image 
                  src={photos[0]} 
                  alt={`Thumbnail for ${name}`} 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">{photos.length} photos</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Link href="/">
        <Button variant="outline" className="w-full m-2">Back to Home</Button>
      </Link>
      <Link href="/generate">
        <Button variant="outline" className="bg-gray-900 w-full m-2 text-white">Generate Link</Button>
      </Link>
    </div>
  )
}

