<?php

namespace App\Models;

use Illuminate\Support\Str;
use Larasell\Larasell\Models\Order as LarasellOrder;

class Order extends LarasellOrder
{
    protected static function booted(): void
    {
        static::creating(function (Order $order): void {
            $order->public_id ??= Str::random(32);
        });
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }
}
