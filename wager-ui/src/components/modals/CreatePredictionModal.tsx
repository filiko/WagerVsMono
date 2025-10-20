"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface CreatePredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePredictionModal({
  open,
  onOpenChange,
}: CreatePredictionModalProps) {
  const [title, setTitle] = React.useState("");
  const [wagerType, setWagerType] = React.useState("Football");
  const [answeringType, setAnsweringType] = React.useState(
    "Multiple options (max. 4)"
  );
  const [options, setOptions] = React.useState(["Real Madrid", "Barcelona"]);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(
    null
  );
  const [endTime, setEndTime] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      const img = new window.Image();

      img.onload = () => {
        let { width, height } = img;
        const maxWidth = 800;
        const maxHeight = 600;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < 500000) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.5
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);
        const objectUrl = URL.createObjectURL(compressedFile);
        setImagePreviewUrl(objectUrl);
      } catch (error) {
        console.error("Error compressing image:", error);
        setImageFile(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreviewUrl(objectUrl);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async () => {
    if (!title || !wagerType || !endTime || options.length < 2 || !imageFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", title);
      formData.append("description", title);
      formData.append("category", wagerType.toLowerCase());
      formData.append("side1", options[0]);
      formData.append("side2", options[1]);
      formData.append("wagerEndTime", endTime);
      formData.append("isPublic", isPublic.toString());
      formData.append("image", imageFile);

      console.log("Sending wager data:", {
        name: title,
        description: title,
        category: wagerType.toLowerCase(),
        side1: options[0],
        side2: options[1],
        wagerEndTime: endTime,
        isPublic: isPublic.toString(),
        imageFile: imageFile?.name,
        imageSize: imageFile?.size,
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/wagers`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Wager created successfully:", result);
        onOpenChange(false);
        setTitle("");
        setWagerType("Football");
        setAnsweringType("Multiple options (max. 4)");
        setOptions(["Real Madrid", "Barcelona"]);
        setImageFile(null);
        setImagePreviewUrl(null);
        setEndTime("");
        setIsPublic(true);
      } else {
        console.error("Response status:", response.status);
        console.error("Response headers:", response.headers);

        let errorMessage = "Failed to create wager. Please try again.";
        try {
          const error = await response.json();
          console.error("Error creating wager:", error);
          if (error.error) {
            errorMessage = error.error;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          const text = await response.text();
          console.error("Raw response:", text);
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting wager:", error);
      toast.error("Failed to create wager. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e]  border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium text-white text-center">
            New Wager
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full gap-8 h-[500px]">
          {/* Left Section - Form Fields */}
          <div className="flex flex-col flex-[1_1_50%] gap-4 overflow-y-auto">
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title <label className="text-[#1FE6E5]">*</label>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Who will win the NBA Finals?"
                className="bg-white/5 border-[#1FE6E5] text-white placeholder:text-white/40 h-12 text-lg"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Wager Type <label className="text-[#1FE6E5]">*</label>
              </label>
              <Select value={wagerType} onValueChange={setWagerType}>
                <SelectTrigger className="w-full bg-white/5 border-[#1FE6E5] text-white h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#1FE6E5]">
                  <SelectItem value="Football" className="text-white">
                    Football
                  </SelectItem>
                  <SelectItem value="Basketball" className="text-white">
                    Basketball
                  </SelectItem>
                  <SelectItem value="Crypto" className="text-white">
                    Crypto
                  </SelectItem>
                  <SelectItem value="Events" className="text-white">
                    Events
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Answering Type <label className="text-[#1FE6E5]">*</label>
              </label>
              <Select value={answeringType} onValueChange={setAnsweringType}>
                <SelectTrigger className="w-full bg-white/5 border-[#1FE6E5] text-white h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#1FE6E5]">
                  <SelectItem
                    value="Multiple options (max. 4)"
                    className="text-white"
                  >
                    Multiple options (max. 4)
                  </SelectItem>
                  <SelectItem value="Yes/No" className="text-white">
                    Yes/No
                  </SelectItem>
                  <SelectItem value="Numeric" className="text-white">
                    Numeric
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Options <label className="text-[#1FE6E5]">* (Max 4)</label>
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="bg-white/5 border-[#1FE6E5] text-white placeholder:text-white/40 h-12 text-lg"
                  />
                ))}
                {options.length === 2 && (
                  <Button
                    onClick={addOption}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-[#1FE6E5] hover:bg-white/10"
                  >
                    Add Third Option
                  </Button>
                )}
                {options.length === 3 && (
                  <Button
                    onClick={addOption}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-[#1FE6E5] hover:bg-white/10"
                  >
                    Add Fourth Option
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                End Time <label className="text-[#1FE6E5]">*</label>
              </label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-white/5 border-[#1FE6E5] text-white placeholder:text-white/40 h-12 text-lg"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-white/80">
                  Visibility
                </Label>
                <p className="text-xs text-white/60">
                  {isPublic
                    ? "Public - Anyone can participate"
                    : "Private - Only invited users can participate"}
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-[#1FE6E5]"
              />
            </div>
          </div>

          {/* Right Section - Image Upload */}
          <div className="flex-[1_1_50%]">
            <div className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Upload Image <label className="text-[#1FE6E5]">*</label>
              </label>
              <p className="text-sm text-white/60">
                Please upload your wager image so our AI can use it to create
                the final wager card.
              </p>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-3 sm:p-6 text-center hover:border-white/40 transition-colors min-h-[300px] flex flex-col justify-center items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                {imagePreviewUrl ? (
                  <label
                    htmlFor="image-upload"
                    className="relative w-full h-[260px] sm:h-[300px] overflow-hidden rounded-md cursor-pointer flex items-center justify-center"
                  >
                    <Image
                      src={imagePreviewUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#1FE6E5] rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-black">+</span>
                      </div>
                    </div>
                  </label>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-[#1FE6E5] rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-black">+</span>
                    </div>
                    <span className="text-white/80">Upload Image</span>
                  </label>
                )}
              </div>

              <Button
                variant="outline"
                className="mt-4 h-12 text-lg bg-[#9A2BD8]/20 border-[#9A2BD8]/20 text-[#9A2BD8] hover:bg-[#9A2BD8]"
              >
                <Image
                  src="/icon/magic.svg"
                  alt="magic"
                  width={24}
                  height={24}
                />
                <label className="text-white/80">Regenerate Image</label>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-4">
          <p className="text-sm  text-center text-white/60 mb-6">
            You will receive a 50% revenue share from all activity on this
            wager.
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#1FE6E5] text-black hover:bg-[#1FE6E5]/90 h-12 text-lg px-8 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Submit"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="bg-white/5 border-[#1FE6E5]/20 text-white hover:bg-white/10 h-12 text-lg px-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
