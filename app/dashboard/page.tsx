'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFolders } from '@/lib/utils'

export default function Dashboard() {
  const [folders, setFolders] = useState<Record<string, string[]>>({})
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    setFolders(getFolders())
  }, [])

  const handleDownloadFolder = async (folderName: string, photos: string[]) => {
    const zip = new JSZip()
    const folder = zip.folder(folderName)

    for (const photo of photos) {
      const response = await fetch(photo)
      const blob = await response.blob()
      folder?.file(photo.split('/').pop() || 'file', blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${folderName}.zip`)
  }

  return (
    <div className="space-y-4">
      {selectedPhoto ? (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl h-full max-h-[90%]">
            <button
              className="absolute top-4 right-4 text-white text-2xl bg-gray-800 rounded-full p-2 z-50 hover:bg-gray-700"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <div className="relative w-full h-full">
              <Image 
                src={selectedPhoto} 
                alt="Selected Photo" 
                layout="fill"
                objectFit="contain"
                className="rounded"
              />
            </div>
          </div>
        </div>
      ) : selectedFolder ? (
        <div>
          <h2 className="text-2xl font-bold">{selectedFolder}</h2>
          <div className="grid grid-cols-3 gap-4">
            {folders[selectedFolder]?.map((photo, idx) => (
              <div 
                key={idx} 
                className="aspect-square relative overflow-hidden rounded cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image 
                  src={photo} 
                  alt={`Photo ${idx + 1} in ${selectedFolder}`} 
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setSelectedFolder(null)}
          >
            Back to Folders
          </Button>
          <Button 
            variant="outline" 
            className="mt-4 bg-gray-900 text-white" 
            onClick={() => handleDownloadFolder(selectedFolder, folders[selectedFolder])}
          >
            Download Folder as Zip
          </Button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(folders).map(([name, photos]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="aspect-square relative overflow-hidden rounded cursor-pointer"
                    onClick={() => setSelectedFolder(name)}
                  >
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
      )}
    </div>
  )
}
