"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Photo } from "@prisma/client"
import { X, Upload, Loader2, Image as ImageIcon, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface GalleryManagerProps {
  initialPhotos: Photo[]
  bandSlug: string
}

export function GalleryManager({ initialPhotos, bandSlug }: GalleryManagerProps) {
  const router = useRouter()
  const [photos, setPhotos] = React.useState<Photo[]>(initialPhotos)
  const [isUploading, setIsUploading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const processFiles = async (files: FileList | File[]) => {
    setIsUploading(true)
    let successCount = 0

    // Convert to array if it's a FileList
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`File ${file.name} exceeds 10MB limit`)
        continue
      }
      
      try {
        const formData = new FormData()
        formData.append("file", file)
        
        // 1. Upload to Cloudinary via API
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`)
        const uploadData = await uploadRes.json()

        // 2. Add photo to Band in DB
        const res = await fetch(`/api/bands/${bandSlug}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploadData.url,
            caption: "Band photo"
          }),
        })

        if (res.ok) {
          const newPhoto = await res.json()
          setPhotos(prev => [...prev, newPhoto])
          successCount++
        } else {
          throw new Error("Failed to save photo to database")
        }
      } catch (error) {
        console.error("Error uploading photo:", error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} photo(s) uploaded successfully`)
      router.refresh()
    }
    setIsUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId)
    try {
      const res = await fetch(`/api/bands/${bandSlug}/photos/${photoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
        toast.success("Photo deleted")
        router.refresh()
      } else {
        throw new Error("Failed to delete photo")
      }
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast.error("Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-normal font-serif text-[#1A1A1A] mb-2">Фото галерея</h2>
           <p className="text-[#6B6B7E] text-lg">Фотографії виступів, репетицій та учасників</p>
        </div>
        <Button 
          onClick={() => document.getElementById('gallery-upload')?.click()}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl px-6 py-6 text-base font-medium"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
          Завантажити фото
        </Button>
        <input 
            id="gallery-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
            multiple
        />
      </div>

      {/* Dropzone */}
      <div 
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          flex flex-col items-center justify-center gap-4
          ${isDragging 
            ? 'border-[#7C3AED] bg-[#F3E8FF]/20' 
            : 'border-[#7C3AED] bg-[#F3E8FF]/5 hover:bg-[#F3E8FF]/10'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('gallery-upload')?.click()}
      >
         <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-[#6B6B7E]">
            <ImageIcon size={32} />
         </div>
         <div>
           <p className="text-lg font-medium text-[#1A1A1A]">Перетягни фотографії сюди або клікни для вибору</p>
           <p className="text-sm text-[#6B6B7E] mt-1">PNG, JPG до 10MB кожне</p>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
           <div key={photo.id} className="relative aspect-video rounded-xl overflow-hidden group bg-gray-100">
             <img src={photo.url} alt="Band photo" className="w-full h-full object-cover" />
             
             {/* Gradient overlay for text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
             
             {/* Delete button */}
             <button 
               onClick={(e) => {
                 e.stopPropagation()
                 handleDelete(photo.id)
               }}
               disabled={deletingId === photo.id}
               className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-[#EF4444] text-white rounded-md transition-colors backdrop-blur-sm"
             >
               {deletingId === photo.id ? (
                 <Loader2 size={16} className="animate-spin" />
               ) : (
                 <X size={16} />
               )}
             </button>

             {/* Label */}
             <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium">
                Фото {index + 1}
             </div>
           </div>
        ))}
        
        {/* Placeholders */}
        {Array.from({ length: Math.max(0, 3 - (photos.length % 3 === 0 && photos.length > 0 ? 0 : photos.length % 3)) }).map((_, i) => (
            <div 
              key={`placeholder-${i}`} 
              className="aspect-video rounded-xl border-2 border-dashed border-[#E4E1DC] bg-[#F9FAFB] flex flex-col items-center justify-center text-[#9CA3AF] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors cursor-pointer group"
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
                <div className="w-12 h-12 rounded-full bg-white border border-[#E4E1DC] flex items-center justify-center mb-3 group-hover:border-[#7C3AED] transition-colors">
                  <Plus size={24} />
                </div>
                <span className="text-sm font-medium">Додати фото</span>
            </div>
        ))}
      </div>
    </div>
  )
}
