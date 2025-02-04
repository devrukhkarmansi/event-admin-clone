"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useSessions,
  useDeleteSession,
  useSession,
  useUpdateSession,
  useCreateSession,
} from "@/hooks/use-sessions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Eye,
  ArrowLeft,
  Pencil,
  CalendarIcon,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ToastFunction } from "@/hooks/use-toast";
import {
  CreateSessionParams,
  DifficultyLevel,
  Session,
  SessionType,
} from "@/services/sessions/types";
import { format } from "date-fns";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTracks } from "@/hooks/use-tracks";
import { useUsers } from "@/hooks/use-users";
import { useLocations } from "@/hooks/use-locations";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/file-upload";
import { Pagination } from "@/components/ui/pagination";
import { useUploadMedia } from "@/hooks/use-media";
import { MediaType } from "@/services/media/types";
import { TableSkeleton } from "@/components/table-skeleton";
import { MarkdownContent } from "@/components/markdown-content";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";
import React from "react";

const showToast = (
  toast: ToastFunction,
  {
    title,
    description,
    type = "success",
  }: {
    title: string;
    description: string;
    type?: "success" | "error";
  }
) => {
  toast({
    title,
    description,
    variant: type === "error" ? "destructive" : "default",
    duration: 3000,
  });
};

export default function SessionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionTypes = [
    { value: SessionType.WORKSHOP, label: "Workshop" },
    { value: SessionType.TALK, label: "Talk" },
    { value: SessionType.PANEL, label: "Panel" },
  ];

  const difficultyLevels = [
    { value: DifficultyLevel.BEGINNER, label: "Beginner" },
    { value: DifficultyLevel.INTERMEDIATE, label: "Intermediate" },
    { value: DifficultyLevel.ADVANCED, label: "Advanced" },
  ];

  const [viewId, setViewId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    sessionType: "all" as SessionType | "all",
    difficultyLevel: "all" as DifficultyLevel | "all",
    trackId: "all" as string | "all",
    speakerId: "all" as string | "all",
    locationId: "all" as string | "all",
    status: "all" as string | "all",
    startTimeFrom: undefined as string | undefined,
    startTimeTo: undefined as string | undefined,
    endTimeFrom: undefined as string | undefined,
    endTimeTo: undefined as string | undefined,
    isHighlighted: undefined as boolean | undefined,
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { data: sessions, isLoading } = useSessions({
    page,
    limit: pageSize,
    search: filters.search,
    sessionType:
      filters.sessionType === "all"
        ? undefined
        : (filters.sessionType as SessionType),
    difficultyLevel:
      filters.difficultyLevel === "all"
        ? undefined
        : (filters.difficultyLevel as DifficultyLevel),
    trackId: filters.trackId === "all" ? undefined : Number(filters.trackId),
    speakerId: filters.speakerId === "all" ? undefined : filters.speakerId,
    locationId:
      filters.locationId === "all" ? undefined : Number(filters.locationId),
    status: filters.status === "all" ? undefined : filters.status,
    startTimeFrom: filters.startTimeFrom,
    startTimeTo: filters.startTimeTo,
    endTimeFrom: filters.endTimeFrom,
    endTimeTo: filters.endTimeTo,
    isHighlighted: filters.isHighlighted,
  });
  const { data: currentSession, refetch } = useSession(viewId || 0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteSession = useDeleteSession();
  const updateSession = useUpdateSession();
  const createSession = useCreateSession();
  const { toast } = useToast();
  const { data: tracks } = useTracks();
  const { data: locations } = useLocations();
  const uploadMedia = useUploadMedia();
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(
    undefined
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: filteredUsers, isLoading: isUsersLoading } = useUsers({
    search: debouncedQuery,
    page: 1,
    limit: 10,
  });

  const speakerOptions = React.useMemo(
    () =>
      (filteredUsers?.items || []).map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id.toString(),
        description: user.email,
      })),
    [filteredUsers?.items]
  );

  const emptySession = useMemo(
    () => ({
      title: "",
      description: "",
      sessionType: SessionType.TALK,
      startTime: "",
      endTime: "",
      locationId: undefined,
      capacity: 0,
      difficultyLevel: DifficultyLevel.BEGINNER,
      speakerId: "",
      trackId: undefined,
      status: "draft",
    }),
    []
  );

  const [formData, setFormData] = useState<CreateSessionParams>(emptySession);

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    const viewIdParam = searchParams.get("viewId");
    if (viewIdParam) {
      setViewId(Number(viewIdParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentSession && !isAdding) {
      setFormData({
        title: currentSession.title,
        description: currentSession.description || "",
        sessionType: currentSession.sessionType || SessionType.TALK,
        startTime: currentSession.startTime || "",
        endTime: currentSession.endTime || "",
        locationId: currentSession.locationId,
        capacity: currentSession.capacity || 0,
        difficultyLevel:
          currentSession.difficultyLevel || DifficultyLevel.BEGINNER,
        speakerId: currentSession.speaker?.id || "",
        trackId: currentSession.tracks?.[0]?.id,
        status: currentSession.status || "",
        isHighlighted: currentSession.isHighlighted || false,
      });
      if (currentSession.banner?.url) {
        setBannerPreview(currentSession.banner.url);
      }
    } else if (isAdding) {
      setFormData(emptySession);
      setBannerPreview(undefined);
    }
  }, [currentSession, isAdding, emptySession]);

  useEffect(() => {
    if (isAdding) {
      setFormData(emptySession);
    } else if (currentSession && isEditing) {
      setFormData({
        ...currentSession,
        speakerId: currentSession.speaker?.id || undefined,
        locationId: currentSession.location?.id || undefined,
        trackId: currentSession.tracks?.[0]?.id || undefined,
      });
    }
  }, [isAdding, isEditing, currentSession, emptySession]);

  const handleBannerSelect = (file: File | null) => {
    setSelectedBanner(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBannerPreview(undefined);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.status === "published") {
        const missingFields = [];
        if (!formData.speakerId) missingFields.push("Speaker");
        if (!formData.locationId) missingFields.push("Location");
        if (!formData.trackId) missingFields.push("Track");

        if (missingFields.length > 0) {
          showToast(toast, {
            title: "Validation Error",
            description: `${missingFields.join(", ")} ${
              missingFields.length > 1 ? "are" : "is"
            } required for published sessions`,
            type: "error",
          });
          return;
        }
      }

      // Clean up the data before sending to API
      const cleanFormData = {
        title: formData.title,
        description: formData.description,
        sessionType: formData.sessionType,
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: formData.capacity,
        difficultyLevel: formData.difficultyLevel,
        status: formData.status,
        isHighlighted: formData.isHighlighted,
        locationId: formData.locationId,
        speakerId: formData.speakerId || undefined,
      };

      if (isAdding) {
        const newSession = await createSession.mutateAsync(cleanFormData);

        if (selectedBanner) {
          const media = await uploadMedia.mutateAsync({
            file: selectedBanner,
            mediaType: MediaType.SESSION_BANNER,
          });
          await updateSession.mutateAsync({
            id: newSession.id,
            bannerId: media.id,
          });
          showToast(toast, {
            title: "Success",
            description: "Session banner uploaded successfully",
          });
        }

        showToast(toast, {
          title: "Success",
          description: "Session created successfully",
        });
        setIsAdding(false);
        setViewId(null);
      } else {
        await updateSession.mutateAsync({
          id: currentSession!.id,
          ...cleanFormData,
        });

        if (selectedBanner) {
          const media = await uploadMedia.mutateAsync({
            file: selectedBanner,
            mediaType: MediaType.SESSION_BANNER,
          });
          await updateSession.mutateAsync({
            id: currentSession!.id,
            bannerId: media.id,
          });
          showToast(toast, {
            title: "Success",
            description: "Session banner updated successfully",
          });
        }

        setIsEditing(false);
        await refetch();
        showToast(toast, {
          title: "Success",
          description: "Session updated successfully",
        });
      }
      setSelectedBanner(null);
      setBannerPreview(undefined);
    } catch (error) {
      console.error(error);
      showToast(toast, {
        title: "Error",
        description: "Failed to save session",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteSession.mutateAsync(deleteId);
      showToast(toast, {
        title: "Success",
        description: "Session deleted successfully",
      });
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      showToast(toast, {
        title: "Error",
        description: "Failed to delete session",
        type: "error",
      });
    }
  };

  const handleSetEditing = (editing: boolean) => {
    if (editing && currentSession) {
      setFormData({
        title: currentSession.title,
        description: currentSession.description,
        sessionType: currentSession.sessionType,
        startTime: currentSession.startTime,
        endTime: currentSession.endTime,
        locationId: currentSession.locationId,
        capacity: currentSession.capacity,
        difficultyLevel: currentSession.difficultyLevel,
        speakerId: currentSession.speaker?.id || "",
        trackId: currentSession.tracks?.[0]?.id,
        status: currentSession.status,
        isHighlighted: currentSession.isHighlighted,
      });
    }
    setIsEditing(editing);
  };

  const handleCloseView = () => {
    setViewId(null);
    router.push("/dashboard/sessions");
  };

  if ((viewId && currentSession) || isAdding) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (isEditing || isAdding) {
                if (confirm("Discard changes?")) {
                  setIsEditing(false);
                  setIsAdding(false);
                  handleCloseView();
                  setFormData(emptySession);
                }
              } else {
                handleCloseView();
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isAdding ? "Cancel" : "Back to Sessions"}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>
                    {isAdding
                      ? "Add Session"
                      : currentSession?.title || "Session Details"}
                  </CardTitle>
                  {isEditing || isAdding ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isHighlighted: !prev.isHighlighted,
                        }))
                      }
                      className="hover:text-yellow-500"
                    >
                      <Star
                        className={cn(
                          "h-5 w-5",
                          formData.isHighlighted
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  ) : (
                    <Star
                      className={cn(
                        "h-5 w-5",
                        currentSession?.isHighlighted
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      )}
                    />
                  )}
                </div>
                {!isEditing && !isAdding ? (
                  <Button
                    variant="outline"
                    onClick={() => handleSetEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      updateSession.isPending || createSession.isPending
                    }
                  >
                    {updateSession.isPending || createSession.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    disabled={!isEditing && !isAdding}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Track</label>
                  <Select
                    value={formData.trackId?.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        trackId: Number(value),
                      }))
                    }
                    disabled={!isEditing && !isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks?.map((track) => (
                        <SelectItem key={track.id} value={track.id.toString()}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing || isAdding ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Session description (supports markdown)"
                    className="mt-2"
                    rows={6}
                  />
                ) : (
                  <div className="mt-2 text-muted-foreground">
                    {currentSession?.description ? (
                      <MarkdownContent content={currentSession.description} />
                    ) : (
                      "No description"
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium">Session Type</label>
                  <Select
                    value={formData.sessionType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        sessionType: value as SessionType,
                      }))
                    }
                    disabled={!isEditing && !isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Difficulty Level
                  </label>
                  <Select
                    value={formData.difficultyLevel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficultyLevel: value as DifficultyLevel,
                      }))
                    }
                    disabled={!isEditing && !isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    value={formData.capacity}
                    type="number"
                    disabled={!isEditing && !isAdding}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        capacity: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startTime && "text-muted-foreground"
                        )}
                        disabled={!isEditing && !isAdding}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startTime ? (
                          format(new Date(formData.startTime), "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.startTime
                            ? new Date(formData.startTime)
                            : undefined
                        }
                        onSelect={(date) =>
                          date &&
                          setFormData((prev) => ({
                            ...prev,
                            startTime: date.toISOString(),
                          }))
                        }
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={
                            formData.startTime
                              ? format(new Date(formData.startTime), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const date = formData.startTime
                              ? new Date(formData.startTime)
                              : new Date();
                            date.setHours(parseInt(hours), parseInt(minutes));
                            setFormData((prev) => ({
                              ...prev,
                              startTime: date.toISOString(),
                            }));
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endTime && "text-muted-foreground"
                        )}
                        disabled={!isEditing && !isAdding}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endTime ? (
                          format(new Date(formData.endTime), "PPP HH:mm")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.endTime
                            ? new Date(formData.endTime)
                            : undefined
                        }
                        onSelect={(date) =>
                          date &&
                          setFormData((prev) => ({
                            ...prev,
                            endTime: date.toISOString(),
                          }))
                        }
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={
                            formData.endTime
                              ? format(new Date(formData.endTime), "HH:mm")
                              : ""
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const date = formData.endTime
                              ? new Date(formData.endTime)
                              : new Date();
                            date.setHours(parseInt(hours), parseInt(minutes));
                            setFormData((prev) => ({
                              ...prev,
                              endTime: date.toISOString(),
                            }));
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Speaker</label>
                  {isEditing || isAdding ? (
                    <Combobox
                      options={speakerOptions}
                      value={formData.speakerId}
                      onChange={(value) => {
                        setFormData((prev) => ({ ...prev, speakerId: value }));
                      }}
                      placeholder="Search for a speaker..."
                      loading={isUsersLoading}
                      onSearch={setSearchQuery}
                    />
                  ) : currentSession?.speaker ? (
                    <div className="p-2 rounded-md border">
                      <p className="font-medium">
                        {currentSession.speaker.firstName}{" "}
                        {currentSession.speaker.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentSession.speaker.email}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">
                      No speaker assigned
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    value={formData.locationId?.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        locationId: Number(value),
                      }))
                    }
                    disabled={!isEditing && !isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Banner Image</label>
                {isEditing || isAdding ? (
                  <FileUpload
                    accept="image/*"
                    onChange={handleBannerSelect}
                    value={bannerPreview}
                    className="mt-2"
                  />
                ) : currentSession?.banner ? (
                  <Image
                    src={currentSession.banner.url}
                    alt={currentSession.title}
                    width={800}
                    height={400}
                    className="rounded-lg max-h-[200px] object-cover"
                  />
                ) : (
                  <p className="text-muted-foreground">No banner image</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                    disabled={!isEditing && !isAdding}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      <Card className="mb-6">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <CardTitle>Filters</CardTitle>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", {
                  "-rotate-180": isFiltersOpen,
                })}
              />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: "",
                      sessionType: "all",
                      difficultyLevel: "all",
                      trackId: "all",
                      speakerId: "all",
                      locationId: "all",
                      status: "all",
                      startTimeFrom: undefined,
                      startTimeTo: undefined,
                      endTimeFrom: undefined,
                      endTimeTo: undefined,
                      isHighlighted: undefined,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Session Type</label>
                  <Select
                    value={filters.sessionType}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        sessionType: value as SessionType | "all",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {sessionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Difficulty Level
                  </label>
                  <Select
                    value={filters.difficultyLevel}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        difficultyLevel: value as DifficultyLevel | "all",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Track</label>
                  <Select
                    value={filters.trackId}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        trackId: value as string | "all",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All tracks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tracks</SelectItem>
                      {tracks?.map((track) => (
                        <SelectItem key={track.id} value={track.id.toString()}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Select
                    value={filters.locationId}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        locationId: value as string | "all",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value as string | "all",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Start Date Range
                  </label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !filters.startTimeFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startTimeFrom
                            ? format(new Date(filters.startTimeFrom), "PPP")
                            : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            filters.startTimeFrom
                              ? new Date(filters.startTimeFrom)
                              : undefined
                          }
                          onSelect={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              startTimeFrom: date?.toISOString(),
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !filters.startTimeTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startTimeTo
                            ? format(new Date(filters.startTimeTo), "PPP")
                            : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            filters.startTimeTo
                              ? new Date(filters.startTimeTo)
                              : undefined
                          }
                          onSelect={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              startTimeTo: date?.toISOString(),
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">End Date Range</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !filters.endTimeFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endTimeFrom
                            ? format(new Date(filters.endTimeFrom), "PPP")
                            : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            filters.endTimeFrom
                              ? new Date(filters.endTimeFrom)
                              : undefined
                          }
                          onSelect={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              endTimeFrom: date?.toISOString(),
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal w-full",
                            !filters.endTimeTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endTimeTo
                            ? format(new Date(filters.endTimeTo), "PPP")
                            : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            filters.endTimeTo
                              ? new Date(filters.endTimeTo)
                              : undefined
                          }
                          onSelect={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              endTimeTo: date?.toISOString(),
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Sessions</CardTitle>
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                isHighlighted: !prev.isHighlighted ? true : undefined,
              }))
            }
            className={cn(
              "gap-2",
              filters.isHighlighted &&
                "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                filters.isHighlighted && "fill-yellow-500"
              )}
            />
            {filters.isHighlighted ? "Show All" : "Show Highlighted"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Title
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Track
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Start Time
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Difficulty
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={6} rows={10} />
                ) : (
                  sessions?.items.map((session: Session) => (
                    <tr key={session.id} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Star
                            className={cn(
                              "h-4 w-4",
                              session.isHighlighted
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            )}
                          />
                          <span>{session.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {session.tracks?.[0]?.name || "-"}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">
                          {session.sessionType?.toLowerCase() || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        {session.startTime
                          ? format(
                              new Date(session.startTime),
                              "MMM d, yyyy HH:mm"
                            )
                          : "-"}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">
                          {session.difficultyLevel?.toLowerCase() || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewId(session.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewId(session.id);
                              handleSetEditing(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {sessions && (
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={sessions.meta.totalPages}
                onPageChange={setPage}
                totalItems={sessions.meta.totalItems}
                pageSize={pageSize}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Session"
        description="Are you sure you want to delete this session? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteSession.isPending}
      />
    </div>
  );
}
