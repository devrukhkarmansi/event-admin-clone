import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  src?: string | null
  firstName: string | null
  lastName: string | null
}

export function UserAvatar({ src, firstName = "", lastName = "" }: UserAvatarProps) {
  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : ""

  return (
    <Avatar>
      {src ? (
        <AvatarImage src={src} alt={`${firstName || ''} ${lastName || ''}`} />
      ) : (
        <AvatarFallback>
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      )}
    </Avatar>
  )
} 