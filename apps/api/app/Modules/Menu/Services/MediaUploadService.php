<?php

namespace App\Modules\Menu\Services;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUploadService
{
    public function createPresignedUpload(string $folder = 'menu-items', string $extension = 'jpg'): array
    {
        $extension = strtolower(ltrim($extension, '.'));
        $validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
        if (! in_array($extension, $validExtensions, true)) {
            $extension = 'jpg';
        }

        $fileName = Str::uuid().'.'.$extension;
        $fileKey = "{$folder}/{$fileName}";

        // If Cloudflare R2 is configured
        if (config('filesystems.disks.r2.key') && config('filesystems.disks.r2.secret')) {
            /** @var FilesystemAdapter $disk */
            $disk = Storage::disk('r2');
            $uploadUrl = $disk->temporaryUploadUrl(
                $fileKey,
                now()->addMinutes(15)
            );
            $publicUrl = config('filesystems.disks.r2.url', '').'/'.$fileKey;

            return [
                'mode' => 'presigned_r2',
                'upload_url' => $uploadUrl,
                'file_key' => $fileKey,
                'public_url' => $publicUrl,
            ];
        }

        // Local development storage fallback
        $publicUrl = url("/storage/{$fileKey}");

        return [
            'mode' => 'local_fallback',
            'upload_url' => url('/api/media/upload'),
            'file_key' => $fileKey,
            'public_url' => $publicUrl,
        ];
    }
}
