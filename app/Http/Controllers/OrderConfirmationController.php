<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;
use Larasell\Larasell\Price;

class OrderConfirmationController extends Controller
{
    public function __invoke(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('order-confirmation', [
            'order' => [
                'publicId' => $order->public_id,
                'number' => $order->number,
                'items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unitPrice' => Price::format($item->unit_price, $order->currency, App::currentLocale()),
                    'total' => Price::format($item->total, $order->currency, App::currentLocale()),
                ])->values(),
                'subtotal' => Price::format($order->subtotal, $order->currency, App::currentLocale()),
                'shipping' => $order->getRawOriginal('shipping_price') === null
                    ? null
                    : Price::format($order->shipping_price, $order->currency, App::currentLocale()),
                'total' => Price::format($order->total, $order->currency, App::currentLocale()),
            ],
        ]);
    }
}
