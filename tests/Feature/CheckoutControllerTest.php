<?php

use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Enums\Visibility;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Price;

it('renders the checkout page', function () {
    $response = $this->get(route('checkout'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('checkout'));
});

it('creates an order and redirects using its non guessable public id', function () {
    $product = checkoutProduct();

    $response = $this->post(route('checkout.store'), [
        'fulfillment_method' => 'delivery',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'phone' => null,
        'street' => 'Main Street 1',
        'postcode' => '10115',
        'city' => 'Berlin',
        'notes' => 'No onions',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $order = Order::query()->sole();

    $response->assertRedirect(route('order.confirmation', $order));
    expect($order->public_id)->toHaveLength(32)
        ->and($order->public_id)->not->toBe((string) $order->id)
        ->and($order->notes)->toBe('No onions')
        ->and($order->customer_phone)->toBeNull()
        ->and($order->shipping_option)->toBe('delivery')
        ->and($order->shipping_price?->amount())->toBe('300')
        ->and($order->total->amount())->toBe('2200')
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->quantity)->toBe(2);
});

it('requires delivery address fields only for delivery orders', function () {
    $product = checkoutProduct();

    $response = $this->post(route('checkout.store'), [
        'fulfillment_method' => 'delivery',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    $response->assertInvalid(['street', 'postcode', 'city']);
    $this->assertDatabaseEmpty('larasell_orders');
});

function checkoutProduct(): Product
{
    return Product::query()->create([
        'slug' => fake()->unique()->slug(),
        'name' => ['en' => 'Kebab'],
        'price' => Price::of(950),
        'status' => Visibility::Visible,
    ]);
}
