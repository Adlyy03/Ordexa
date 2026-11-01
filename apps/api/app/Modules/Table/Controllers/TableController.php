<?php

namespace App\Modules\Table\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Table\Models\Table;
use App\Modules\Table\Services\QRCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    public function __construct(
        protected QRCodeService $qrCodeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Table::with('branch');

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        $tables = $query->orderBy('name')->get();

        return response()->json([
            'data' => $tables,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'name' => ['required', 'string', 'max:100'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $token = (string) Str::uuid();

        $table = Table::create([
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'capacity' => $validated['capacity'] ?? 4,
            'is_active' => $validated['is_active'] ?? true,
            'qr_token' => $token,
        ]);

        // Generate QR code SVG/PNG
        $this->qrCodeService->generate($table);

        return response()->json([
            'message' => 'Meja berhasil ditambahkan.',
            'data' => $table->fresh(['branch']),
        ], 201);
    }

    public function show(Table $table): JsonResponse
    {
        return response()->json([
            'data' => $table->load('branch'),
        ]);
    }

    public function update(Request $request, Table $table): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $table->update($validated);

        return response()->json([
            'message' => 'Meja berhasil diperbarui.',
            'data' => $table->fresh(['branch']),
        ]);
    }

    public function destroy(Table $table): JsonResponse
    {
        $table->delete();

        return response()->json([
            'message' => 'Meja berhasil dihapus.',
        ]);
    }

    public function regenerateQr(Table $table): JsonResponse
    {
        $qrUrl = $this->qrCodeService->regenerate($table);

        return response()->json([
            'message' => 'QR Code berhasil diperbarui.',
            'data' => [
                'qr_token' => $table->qr_token,
                'qr_image_url' => $qrUrl,
            ],
        ]);
    }
}
