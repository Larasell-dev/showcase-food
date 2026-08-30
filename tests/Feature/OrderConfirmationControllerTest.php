<?php

use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Enums\Currency;
use Larasell\Larasell\Price;

it('renders a saved order and its item snapshots', function () {
    $order = Order::query()->create([
        'number' => 'LS-000001',
        'currency' => Currency::EUR,
        'customer_email' => 'ada@example.com',
        'customer_name' => 'Ada Lovelace',
        'subtotal' => Price::of(950),
        'total' => Price::of(950),
    ]);
    $order->items()->create([
        'product_name' => 'Kebab',
        'unit_price' => Price::of(950),
        'quantity' => 1,
        'inventory_quantity' => 0,
        'total' => Price::of(950),
    ]);

    $response = $this->get(route('order.confirmation', $order));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('order-confirmation')
        ->where('order.publicId', $order->public_id)
        ->where('order.items.0.name', 'Kebab')
        ->where('order.items.0.quantity', 1));
});

it('does not expose orders through their sequential database id', function () {
    $order = Order::query()->create([
        'number' => 'LS-000001',
        'currency' => Currency::EUR,
        'customer_email' => 'ada@example.com',
        'customer_name' => 'Ada Lovelace',
        'subtotal' => Price::of(950),
        'total' => Price::of(950),
    ]);

    $response = $this->get('/order-confirmation/'.$order->id);

    $response->assertNotFound();
});
