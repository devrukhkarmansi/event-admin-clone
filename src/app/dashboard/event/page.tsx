"use client";

import { useEvent } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  eventsService,
  UpdateEventParams,
} from "@/services/events/events.service";
import { useToast } from "@/hooks/use-toast";
import { useUploadMedia } from "@/hooks/use-media";
import { MediaType } from "@/services/media/types";
import { FileUpload } from "@/components/ui/file-upload";
import { MarkdownContent } from "@/components/markdown-content";
import type { ToastFunction } from "@/hooks/use-toast";

interface FormData {
  name: string;
  description: string;
  logo?: { id: number; url: string };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  floorPlans: {
    id?: number;
    mediaId?: number;
    file?: File;
    label: string;
  }[];
}

interface FloorPlanUpdate {
  id?: number;
  mediaId: number;
  label: string;
}

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

export default function EventPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: event, isLoading: eventLoading } = useEvent();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showFloorPlans, setShowFloorPlans] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    logo: undefined,
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    floorPlans: [],
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEventParams) => eventsService.updateEvent(data),
    onSuccess: () => {
      showToast(toast, {
        title: "Success",
        description: "Event updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      showToast(toast, {
        title: "Error",
        description: error.message || "Failed to update event",
        type: "error",
      });
    },
  });

  const uploadLogo = useUploadMedia();

  const handleLogoChange = async (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, logo: undefined }));
      return;
    }

    try {
      setUploadingLogo(true);
      const { id, url } = await uploadLogo.mutateAsync({
        file,
        mediaType: MediaType.EVENT_LOGO,
      });
      setFormData((prev) => ({
        ...prev,
        logo: { id, url },
      }));
      showToast(toast, {
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload logo:", error);
      showToast(toast, {
        title: "Error",
        description: "Failed to upload logo",
        type: "error",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFloorPlanChange = async (files: File | null) => {
    if (!files) return;

    // Create a new FileReader to get preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const newFloorPlan = {
        file: files,
        label: "New Floor Plan",
      };

      setFormData((prev) => ({
        ...prev,
        floorPlans: [...prev.floorPlans, newFloorPlan],
      }));
    };
    reader.readAsDataURL(files);
  };

  const handleFloorPlanLabelChange = (index: number, label: string) => {
    setFormData((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.map((fp, i) =>
        i === index ? { ...fp, label } : fp
      ),
    }));
  };

  const handleRemoveFloorPlan = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      floorPlans: prev.floorPlans.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        logo: event.logo,
        address: {
          line1: event.address.line1 || "",
          line2: event.address.line2 || "",
          city: event.address.city || "",
          state: event.address.state || "",
          country: event.address.country || "",
          postalCode: event.address.postalCode || "",
        },
        floorPlans:
          event.floorPlans?.map((fp) => ({
            id: fp.id,
            mediaId: fp.mediaId,
            label: fp.label,
          })) || [],
      });
    }
  }, [event]);

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: event!.name,
      description: event!.description,
      logo: event!.logo,
      address: {
        line1: event!.address.line1,
        line2: event!.address.line2,
        city: event!.address.city,
        state: event!.address.state,
        country: event!.address.country,
        postalCode: event!.address.postalCode,
      },
      floorPlans:
        event!.floorPlans?.map((fp) => ({
          id: fp.id,
          mediaId: fp.mediaId,
          label: fp.label,
        })) || [],
    });
  };

  const handleSave = async () => {
    if (!event) return;
    try {
      // First upload any new floor plan images
      const floorPlanUploads = await Promise.all(
        formData.floorPlans
          .filter((fp) => fp.file)
          .map(async (fp) => {
            const { id: mediaId, url } = await uploadLogo.mutateAsync({
              file: fp.file!,
              mediaType: MediaType.EVENT_FLOOR_PLAN,
            });
            showToast(toast, {
              title: "Success",
              description: "Floor plan uploaded successfully",
            });
            return { ...fp, mediaId, url };
          })
      );

      // Prepare floor plans data
      const floorPlans = formData.floorPlans
        .map((fp) => {
          if (fp.file) {
            const uploaded = floorPlanUploads.find((u) => u.file === fp.file);
            if (!uploaded?.mediaId) return null;
            return {
              mediaId: uploaded.mediaId,
              label: fp.label,
            };
          }
          if (!fp.mediaId) return null;
          return {
            id: fp.id,
            mediaId: fp.mediaId,
            label: fp.label,
          };
        })
        .filter((fp): fp is FloorPlanUpdate => fp !== null);

      // Create update payload without logoId by default
      const updatePayload: Omit<UpdateEventParams, "logoId"> = {
        id: event.id,
        name: formData.name,
        description: formData.description,
        address: {
          line1: formData.address.line1,
          line2: formData.address.line2,
          city: formData.address.city,
          state: formData.address.state,
          country: formData.address.country,
          postalCode: formData.address.postalCode,
        },
        floorPlans,
      };

      // Only include logoId if it has changed
      if (formData.logo?.id !== event.logo?.id) {
        (updatePayload as UpdateEventParams).logoId =
          formData.logo?.id || undefined;
      }

      await updateMutation.mutateAsync(updatePayload);
    } catch (error) {
      console.error("Failed to update event:", error);
      showToast(toast, {
        title: "Error",
        description: "Failed to update event",
        type: "error",
      });
    }
  };

  if (eventLoading) {
    return <LoadingScreen />;
  }

  if (!event) return <div>Event not found</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Details</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Information</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFloorPlans(true)}
                  disabled={!event?.floorPlans?.length}
                >
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  View Floor Plans
                </Button>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Event
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {isEditing && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  <div className="max-w-[300px] mx-auto">
                    <FileUpload
                      accept="image/*"
                      onChange={handleLogoChange}
                      loading={uploadingLogo}
                      disabled={updateMutation.isPending}
                      value={formData.logo?.url}
                      className="h-[300px]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={isEditing ? formData.name : event.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Event description (supports markdown)"
                    className="mt-2"
                    rows={6}
                  />
                ) : (
                  <div className="mt-2">
                    {event?.description ? (
                      <MarkdownContent content={event.description} />
                    ) : (
                      <p className="text-muted-foreground">No description</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <div className="grid gap-4 mt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Street Address
                    </label>
                    <Input
                      placeholder="Address Line 1"
                      value={
                        isEditing ? formData.address.line1 : event.address.line1
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            line1: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Input
                      placeholder="Address Line 2 (Optional)"
                      value={
                        isEditing ? formData.address.line2 : event.address.line2
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            line2: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        City
                      </label>
                      <Input
                        placeholder="City"
                        value={
                          isEditing ? formData.address.city : event.address.city
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        State
                      </label>
                      <Input
                        placeholder="State"
                        value={
                          isEditing
                            ? formData.address.state
                            : event.address.state
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              state: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Country
                      </label>
                      <Input
                        placeholder="Country"
                        value={
                          isEditing
                            ? formData.address.country
                            : event.address.country
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              country: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Postal Code
                      </label>
                      <Input
                        placeholder="Postal Code"
                        value={
                          isEditing
                            ? formData.address.postalCode
                            : event.address.postalCode
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              postalCode: e.target.value,
                            },
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Floor Plans
                  </label>
                  <FileUpload
                    accept="image/*"
                    onChange={handleFloorPlanChange}
                    multiple
                    value={undefined}
                    className="mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {formData.floorPlans.map((floorPlan, index) => (
                      <div
                        key={floorPlan.id || index}
                        className="relative group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={
                              floorPlan.file
                                ? URL.createObjectURL(floorPlan.file)
                                : event?.floorPlans?.find(
                                    (fp) => fp.id === floorPlan.id
                                  )?.media.url || ""
                            }
                            alt={floorPlan.label}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Input
                          value={floorPlan.label}
                          onChange={(e) =>
                            handleFloorPlanLabelChange(index, e.target.value)
                          }
                          className="mt-2"
                          placeholder="Floor Plan Label"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFloorPlan(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showFloorPlans} onOpenChange={setShowFloorPlans}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>Event Floor Plans</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event?.floorPlans?.map((floorPlan) => (
                <div key={floorPlan.id} className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={floorPlan.media.url}
                      alt={floorPlan.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-center">
                    {floorPlan.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
