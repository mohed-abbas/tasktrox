'use client';

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Trash2 } from 'lucide-react';

interface AvatarUploadProps {
  name: string;
  avatar: string | null | undefined;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading: boolean;
  isDeleting: boolean;
  uploadError: Error | null;
}

export function AvatarUpload({
  name,
  avatar,
  onUpload,
  onDelete,
  isUploading,
  isDeleting,
  uploadError,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, PNG, GIF, or WebP image');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      onUpload(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a photo to personalize your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <Avatar className="size-24">
            <AvatarImage src={avatar ?? undefined} alt={name} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || isDeleting}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 size-4" />
                )}
                {avatar ? 'Change Photo' : 'Upload Photo'}
              </Button>

              {avatar && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDelete}
                  disabled={isUploading || isDeleting}
                  className="text-red-500 hover:text-red-600"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Remove
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              JPEG, PNG, GIF, or WebP. Max size 5MB.
            </p>

            {uploadError && (
              <p className="text-sm text-red-500">
                {uploadError.message || 'Failed to upload avatar'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
