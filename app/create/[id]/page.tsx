'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FlashlightIcon as FlashIcon, FlashlightOffIcon as FlashOffIcon, RotateCcw, Camera } from 'lucide-react'
import { isLinkValid, saveFolder } from '@/lib/utils'

export default function CreateFolder({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [folderName, setFolderName] = useState('')
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [orientation, setOrientation] = useState('portrait')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
    }
  }

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
      const photo = canvas.toDataURL('image/jpeg')
      setPhotos([...photos, photo])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (isLinkValid(`/create/${params.id}`) && folderName && photos.length > 0) {
      saveFolder(folderName, photos)
      router.push('/dashboard')
    } else {
      alert('Invalid link or missing folder name/photos')
    }
  }

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn)
    // Note: Flash functionality would require additional hardware API support
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera View */}
      <div className="relative h-full">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="h-full w-full object-cover"
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          <div className="border-r border-white/30 col-start-1"></div>
          <div className="border-r border-white/30 col-start-2"></div>
          <div className="border-b border-white/30 row-start-1"></div>
          <div className="border-b border-white/30 row-start-2"></div>
        </div>

        {/* Camera Controls */}
        <div className="absolute inset-x-0 top-6 flex justify-between px-6">
          <div className="flex flex-col gap-4">
            <button 
              onClick={toggleFlash}
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              {isFlashOn ? (
                <FlashIcon className="w-6 h-6" />
              ) : (
                <FlashOffIcon className="w-6 h-6" />
              )}
            </button>
            <button className="text-white p-2 rounded-full hover:bg-white/10">
              <span className="text-sm font-medium">HDR</span>
            </button>
          </div>
          <div className="rotate-90 text-white">
            <span className="text-sm font-medium">{orientation.toUpperCase()}</span>
          </div>
        </div>

        {/* Shutter Button */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-white"></div>
          </button>
        </div>

        {/* Photo Preview */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative w-16 h-16">
              <Image
                src={photo}
                alt={`Captured ${index}`}
                fill
                className="object-cover rounded"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-1 -right-1 bg-black/50 rounded-full p-1"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 inset-x-0 px-6">
          <Input
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="bg-white/10 border-0 text-white placeholder:text-white/50"
          />
          <Button 
            onClick={handleSubmit} 
            className="w-full mt-2"
            variant="secondary"
          >
            Submit Folder
          </Button>
        </div>
      </div>
    </div>
  )
}

