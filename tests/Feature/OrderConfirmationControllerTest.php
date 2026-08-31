<?php

use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Enums\Currency;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Price;

it('renders the translated product name saved on the order item', function () {
    $order = Order::query()->create([
        'number' => 'LS-000001',
        'currency' => Currency::EUR,
        'customer_email' => 'ada@example.com',
        'customer_name' => 'Ada Lovelace',
        'subtotal' => Price::of(950),
        'total' => Price::of(950),
    ]);
    $order->items()->create([
        'product_name' => [
            'en' => 'Kebab',
            'de' => 'Döner',
        ],
        'unit_price' => Price::of(950),
        'quantity' => 1,
        'inventory_quantity' => 0,
        'total' => Price::of(950),
    ]);

    $response = $this
        ->withCookie('locale', 'de')
        ->get(route('order.confirmation', $order));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('order-confirmation')
        ->where('order.publicId', $order->public_id)
        ->where('order.items.0.name', 'Döner')
        ->where('order.items.0.quantity', 1));
});

it('never replaces the saved item name with current product data', function () {
    $product = Product::query()->create([
        'slug' => 'chicken-doner',
        'name' => [
            'en' => 'Chicken Doner',
            'de' => 'Hähnchen-Döner',
        ],
        'price' => Price::of(950),
    ]);
    $order = Order::query()->create([
        'number' => 'LS-000001',
        'currency' => Currency::EUR,
        'customer_email' => 'ada@example.com',
        'customer_name' => 'Ada Lovelace',
        'subtotal' => Price::of(950),
        'total' => Price::of(950),
    ]);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => [
            'en' => 'Historical Chicken Doner',
            'de' => 'Historischer Hähnchen-Döner',
        ],
        'unit_price' => Price::of(950),
        'quantity' => 1,
        'inventory_quantity' => 0,
        'total' => Price::of(950),
    ]);

    $response = $this
        ->withCookie('locale', 'de')
        ->get(route('order.confirmation', $order));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('order.items.0.name', 'Historischer Hähnchen-Döner'));
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
