"use client"

import { useState } from "react"
import { Member } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, Upload, User } from "lucide-react"
import Image from "next/image"

interface MembersManagerProps {
  initialMembers: Member[]
  bandId: string
}

export function MembersManager({ initialMembers, bandId }: MembersManagerProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [photo, setPhoto] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const resetForm = () => {
    setName("")
    setRole("")
    setPhoto("")
    setEditingMember(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setName(member.name)
    setRole(member.role)
    setPhoto(member.photo || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/members/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete member")

      setMembers(members.filter((m) => m.id !== id))
      toast.success("Member deleted")
      router.refresh()
    } catch (error) {
      toast.error("Error deleting member")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setPhoto(data.url)
      toast.success("Photo uploaded")
    } catch (error) {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !role) {
      toast.error("Name and Role are required")
      return
    }

    try {
      setIsLoading(true)
      
      if (editingMember) {
        // Update
        const res = await fetch(`/api/members/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role, photo }),
        })

        if (!res.ok) throw new Error("Failed to update member")

        const updated = await res.json()
        setMembers(members.map((m) => (m.id === updated.id ? updated : m)))
        toast.success("Member updated")
      } else {
        // Create
        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, role, photo }),
        })

        if (!res.ok) throw new Error("Failed to create member")

        const created = await res.json()
        setMembers([...members, created])
        toast.success("Member added")
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast.error("Operation failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Band Members</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No members added yet. Add your band members here.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.photo ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Update member details."
                : "Add a new member to your band."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Vocalist / Guitarist"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                {photo && (
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                    <Image
                      src={photo}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
              {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMember ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
