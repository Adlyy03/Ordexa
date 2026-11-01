<?php

namespace App\Modules\Menu\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Menu\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function __construct(
        protected MediaUploadService $mediaService
    ) {}

    public function presign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'folder' => ['sometimes', 'string', 'in:menu-items,logos,restaurants'],
            'extension' => ['sometimes', 'string', 'in:jpg,jpeg,png,webp,svg'],
        ]);

        $folder = $validated['folder'] ?? 'menu-items';
        $extension = $validated['extension'] ?? 'jpg';

        $data = $this->mediaService->createPresignedUpload($folder, $extension);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'max:5120'], // Max 5MB
            'folder' => ['sometimes', 'string', 'in:menu-items,logos,restaurants'],
        ]);

        $file = $request->file('file');
        $folder = $request->input('folder', 'menu-items');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $fileName, 'public');

        return response()->json([
            'message' => 'Upload berhasil.',
            'data' => [
                'file_key' => $path,
                'public_url' => url("/storage/{$path}"),
            ],
        ], 201);
    }
}
