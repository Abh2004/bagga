'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlashlightIcon as FlashIcon, FlashlightOffIcon as FlashOffIcon, RotateCcw } from 'lucide-react';
import { isLinkValid, saveFolder } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function CreateFolder() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [photos, setPhotos] = useState<Array<{ dataUrl: string; timestamp: string }>>([]);
  const [folderName, setFolderName] = useState('');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [orientation] = useState('portrait');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing the camera', err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the video frame
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Get current timestamp
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        // Configure text style
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Position timestamp in bottom left corner with padding
        const padding = 10;
        const textX = padding;
        const textY = canvas.height - padding;
        
        // Add text stroke for better visibility
        ctx.strokeText(timestamp, textX, textY);
        ctx.fillText(timestamp, textX, textY);
        
        const photo = {
          dataUrl: canvas.toDataURL('image/jpeg'),
          timestamp: timestamp
        };
        
        setPhotos([...photos, photo]);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (isLinkValid(`/create/${id}`) && folderName && photos.length > 0) {
      // Modify saveFolder to handle the new photo format
      saveFolder(folderName, photos.map(photo => photo.dataUrl));
      router.push('/dashboard');
    } else {
      alert('Invalid link or missing folder name/photos');
    }
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

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

        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-white"></div>
          </button>
        </div>

        <div className="absolute left-4 top-1/2 -translate-y-1/2 max-h-80 overflow-y-auto 
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-black/20
          [&::-webkit-scrollbar-thumb]:bg-white/50
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:hover:bg-white/70
          hover:pr-2 transition-all">
          <div className="space-y-2 p-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-16 h-16">
                <Image
                  src={photo.dataUrl}
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
          {photos.length > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          )}
        </div>

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
  );
}