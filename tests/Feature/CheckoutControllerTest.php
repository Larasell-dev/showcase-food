<?php

use App\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Enums\Visibility;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Price;
use Larasell\Stripe\Contracts\CreatesCheckoutSessions;
use Stripe\Checkout\Session;

final class FakeStripeCheckoutSessionsForStore implements CreatesCheckoutSessions
{
    /** @var array<string, mixed> */
    public array $parameters = [];

    public function create(array $parameters, array $options = []): Session
    {
        $this->parameters = $parameters;

        return Session::constructFrom([
            'id' => 'cs_test_storefront',
            'object' => 'checkout.session',
            'url' => 'https://checkout.stripe.test/c/pay/cs_test_storefront',
        ]);
    }
}

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

it('redirects Stripe orders to hosted checkout', function () {
    $sessions = new FakeStripeCheckoutSessionsForStore;
    app()->instance(CreatesCheckoutSessions::class, $sessions);
    $product = checkoutProduct();

    $response = $this
        ->withHeader('X-Inertia', 'true')
        ->post(route('checkout.store'), [
            'fulfillment_method' => 'pickup',
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'payment_method' => 'stripe',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

    $order = Order::query()->sole();

    $response
        ->assertConflict()
        ->assertHeader('X-Inertia-Location', 'https://checkout.stripe.test/c/pay/cs_test_storefront');
    expect($order->payments->first()->method)->toBe('stripe')
        ->and($order->payments->first()->reference)->toBe('cs_test_storefront')
        ->and($sessions->parameters['success_url'])->toContain('{CHECKOUT_SESSION_ID}')
        ->and($sessions->parameters['cancel_url'])->toBe(route('checkout'));
});

it('resolves a Stripe success redirect to the public order confirmation', function () {
    $sessions = new FakeStripeCheckoutSessionsForStore;
    app()->instance(CreatesCheckoutSessions::class, $sessions);
    $product = checkoutProduct();
    $this->post(route('checkout.store'), [
        'fulfillment_method' => 'pickup',
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'payment_method' => 'stripe',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);
    $order = Order::query()->sole();

    $response = $this->get(route('checkout.stripe.success', [
        'session_id' => 'cs_test_storefront',
    ]));

    $response->assertRedirect(route('order.confirmation', $order));
});

it('allows Stripe webhook requests through CSRF validation', function () {
    $response = $this->post('/larasell/stripe/webhook');

    $response->assertBadRequest();
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
