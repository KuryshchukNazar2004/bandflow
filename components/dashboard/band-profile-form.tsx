"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Band, Instrument, Photo, Member } from "@prisma/client"
import { useRouter } from "next/navigation"
import { X, Upload, Loader2, Plus, Music } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  genre: z.string().min(2, "Genre must be at least 2 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  bio: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  photo: z.string().optional(),
})

interface BandProfileFormProps {
  band: Band & { instruments: Instrument[]; photos: Photo[]; members: Member[] }
}

export function BandProfileForm({ band }: BandProfileFormProps) {
  const router = useRouter()
  const [instruments, setInstruments] = React.useState<string[]>(
    band.instruments.map(i => i.name)
  )
  const [instrumentInput, setInstrumentInput] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)

  // Members state
  const [members, setMembers] = React.useState<{ name: string; role: string; photo?: string | null }[]>(
    band.members ? band.members.map(m => ({ name: m.name, role: m.role, photo: m.photo })) : []
  )
  const [newMemberName, setNewMemberName] = React.useState("")
  const [newMemberRole, setNewMemberRole] = React.useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: band.name || "",
      genre: band.genre || "",
      city: band.city || "",
      bio: band.bio || "",
      price: band.price || 0,
      photo: band.photos?.[0]?.url || "",
    },
  })

  const addMember = () => {
    if (newMemberName.trim() && newMemberRole.trim()) {
      setMembers([...members, { name: newMemberName.trim(), role: newMemberRole.trim(), photo: null }])
      setNewMemberName("")
      setNewMemberRole("")
    }
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  // Handle instrument tags
  const addInstrument = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && instrumentInput.trim()) {
      e.preventDefault()
      if (!instruments.includes(instrumentInput.trim())) {
        setInstruments([...instruments, instrumentInput.trim()])
      }
      setInstrumentInput("")
    }
  }

  const removeInstrument = (instrument: string) => {
    setInstruments(instruments.filter((i) => i !== instrument))
  }

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      form.setValue("photo", data.url)
      toast.success("Photo uploaded", {
        description: "Your photo has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed", {
        description: "Could not upload photo. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch(`/api/bands/${band.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          instruments: instruments,
          members: members,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated", {
        description: "Your band profile has been updated successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Update failed", {
        description: "Could not update profile. Please try again.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-normal font-serif text-[#1A1A1A] mb-2">Профіль гурту</h2>
            <p className="text-[#6B6B7E] text-lg">Інформація яку бачать клієнти на вашій публічній сторінці</p>
          </div>
          <Button 
            type="submit" 
            className="bg-[#2D1B69] hover:bg-[#2D1B69]/90 text-white rounded-xl px-6 py-6 text-base font-medium"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Збереження...
              </>
            ) : (
              "Зберегти зміни"
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - 1/2 width */}
          <div className="space-y-8">
            
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl border border-[#E4E1DC] p-8 space-y-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Основна інформація</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1A1A1A]">Назва гурту *</FormLabel>
                      <FormControl>
                        <Input placeholder="Velvet Storm" {...field} className="h-12 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1A1A1A]">Жанр *</FormLabel>
                      <FormControl>
                        <Input placeholder="Rock / Indie" {...field} className="h-12 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1A1A1A]">Місто *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kyiv" {...field} className="h-12 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-[#1A1A1A]">Базова ціна (₴)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="8000" {...field} className="h-12 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-[#1A1A1A]">Опис гурту</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Velvet Storm — рок-гурт з Києва..." 
                        className="min-h-[120px] rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instruments Card */}
            <div className="bg-white rounded-xl border border-[#E4E1DC] p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Інструменти</h3>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {instruments.map((instrument) => (
                  <Badge 
                    key={instrument} 
                    variant="secondary" 
                    className="pl-4 pr-2 py-2 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1A1A1A] text-sm font-medium gap-2 border border-[#E4E1DC]"
                  >
                    {instrument}
                    <button
                      type="button"
                      title="Видалити"
                      onClick={() => removeInstrument(instrument)}
                      className="text-[#6B6B7E] hover:text-[#EF4444]"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  value={instrumentInput}
                  onChange={(e) => setInstrumentInput(e.target.value)}
                  onKeyDown={addInstrument}
                  placeholder="Додати інструмент..."
                  className="h-12 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]"
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (instrumentInput.trim() && !instruments.includes(instrumentInput.trim())) {
                      setInstruments([...instruments, instrumentInput.trim()])
                      setInstrumentInput("")
                    }
                  }}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-12 px-6 rounded-lg font-medium"
                >
                  <Plus size={18} className="mr-2" />
                  Додати
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-6">
            
            {/* Avatar Upload Card */}
            <div className="bg-white rounded-xl border border-[#E4E1DC] p-8 space-y-4 shadow-sm h-fit">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Аватар гурту</h3>
                <p className="text-sm text-[#6B6B7E]">JPEG або PNG, до 10МБ</p>
              </div>

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Avatar</FormLabel>
                    <FormControl>
                      <div className="mt-4">
                        <label 
                          htmlFor="avatar-upload" 
                          className={`
                            relative flex flex-col items-center justify-center w-full h-48 
                            border-2 border-dashed rounded-xl cursor-pointer 
                            transition-colors duration-200 ease-in-out
                            ${field.value ? 'border-[#7C3AED] bg-[#F3E8FF]/10' : 'border-[#E4E1DC] hover:border-[#7C3AED] hover:bg-[#F8F7FF]'}
                          `}
                        >
                          {field.value ? (
                            <div className="relative w-full h-full p-2">
                              <img 
                                src={field.value} 
                                alt="Band avatar" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                <Upload className="text-white h-8 w-8" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                              <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#6B6B7E] mb-3">
                                <Upload size={24} />
                              </div>
                              <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                                Перетягни або клікни для завантаження
                              </p>
                              <p className="text-xs text-[#6B6B7E]">
                                PNG, JPG до 10MB
                              </p>
                            </div>
                          )}
                          <input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleFileChange}
                            disabled={isUploading}
                          />
                        </label>
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Members Card */}
            <div className="bg-white rounded-xl border border-[#E4E1DC] p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Учасники гурту</h3>
                <span className="text-sm text-[#6B6B7E]">{members.length} учасників</span>
              </div>
              
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 bg-[#FCFCFD] p-3 rounded-xl border border-[#F3F4F6]">
                    <div className="w-10 h-10 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white shrink-0">
                      <Music size={18} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="bg-white px-3 py-2 rounded-lg border border-[#E4E1DC] text-sm text-[#1A1A1A]">
                        {member.name}
                      </div>
                      <div className="bg-white px-3 py-2 rounded-lg border border-[#E4E1DC] text-sm text-[#1A1A1A]">
                        {member.role}
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Видалити"
                      onClick={() => removeMember(index)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#6B6B7E]">Ім'я</label>
                    <Input
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Олексій Шевченко"
                      className="h-11 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#6B6B7E]">Роль</label>
                    <Input
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="Вокал, гітара..."
                      className="h-11 rounded-lg border-[#E4E1DC] focus-visible:ring-[#2D1B69]"
                    />
                  </div>
                </div>
                <Button 
                  type="button" 
                  onClick={addMember}
                  disabled={!newMemberName.trim() || !newMemberRole.trim()}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-11 rounded-lg font-medium"
                >
                  <Plus size={18} className="mr-2" />
                  Додати учасника
                </Button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </Form>
  )
}