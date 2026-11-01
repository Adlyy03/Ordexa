<?php

namespace App\Modules\Table\Services;

use App\Modules\Table\Models\Table;
use chillerlan\QRCode\Output\QRMarkupSVG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QRCodeService
{
    public function generate(Table $table): string
    {
        $table->loadMissing(['branch.restaurant']);

        $restaurantSlug = $table->branch?->restaurant?->slug ?? 'restaurant';
        $branchSlug = $table->branch?->slug ?? 'main';
        $token = $table->qr_token;

        $orderBaseUrl = config('app.order_url', 'http://localhost:3000');
        $url = "{$orderBaseUrl}/order/r/{$restaurantSlug}/{$branchSlug}/{$token}";

        $options = new QROptions([
            'outputInterface' => QRMarkupSVG::class,
        ]);

        $qrData = (new QRCode($options))->render($url);

        $filename = "qr-codes/{$token}.svg";
        Storage::disk('public')->put($filename, $qrData);
        $qrUrl = url("/storage/{$filename}");

        $table->update(['qr_image_url' => $qrUrl]);

        return $qrUrl;
    }

    public function regenerate(Table $table): string
    {
        $table->update(['qr_token' => (string) Str::uuid()]);

        return $this->generate($table);
    }
}
