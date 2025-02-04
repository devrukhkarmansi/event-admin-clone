"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/use-users";
import { useSessions, useHighlightedSessions } from "@/hooks/use-sessions";
import { Users, Calendar, UserCheck, Star } from "lucide-react";
import { useCheckInCount } from "@/hooks/use-check-ins";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function DashboardPage() {
  const { data: users } = useUsers();
  const { data: sessions } = useSessions({});
  const { data: checkIns } = useCheckInCount();
  const router = useRouter();
  const { data: highlightedSessions } = useHighlightedSessions(6);

  return (
    <div className="p-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push("/dashboard/users")}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.meta.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push("/dashboard/check-ins")}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Check-ins
            </CardTitle>
            <UserCheck className="h-8 w-8 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkIns?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique attendees today
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push("/dashboard/sessions")}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Calendar className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.meta.totalItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total scheduled sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {highlightedSessions?.items && highlightedSessions.items.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <CardTitle>Featured Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative mx-auto px-4"
            >
              <CarouselContent>
                {(highlightedSessions?.items || []).map((session) => (
                  <CarouselItem
                    key={session.id}
                    className="basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <Link
                      href={`/dashboard/sessions?viewId=${session.id}`}
                      className="group block relative overflow-hidden rounded-lg m-2 hover:ring-2 hover:ring-primary transition-all"
                    >
                      <div className="aspect-[16/9] relative">
                        {session.banner ? (
                          <Image
                            src={session.banner.url}
                            alt={session.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Star className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {session.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="capitalize">
                            {session.sessionType?.toLowerCase() || "-"}
                          </span>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(session.startTime || ""),
                              "MMM d, HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {highlightedSessions.items.length > 3 && (
                <>
                  <CarouselPrevious className="absolute -left-4 hover:bg-background top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute -right-4 hover:bg-background top-1/2 -translate-y-1/2" />
                </>
              )}
            </Carousel>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
