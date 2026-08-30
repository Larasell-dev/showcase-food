<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use Larasell\Larasell\Address;
use Larasell\Larasell\Checkout\Checkout;
use Larasell\Larasell\Enums\Currency;
use Larasell\Larasell\Models\Cart;
use Larasell\Larasell\Models\Product;

class CheckoutController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('checkout');
    }

    public function store(StoreOrderRequest $request, Checkout $checkout): RedirectResponse
    {
        $data = $request->validated();
        $cart = Cart::query()->create(['currency' => Currency::EUR]);

        try {
            foreach ($data['items'] as $item) {
                $product = Product::query()->visible()->findOrFail($item['product_id']);
                $cart->add($product, $item['quantity']);
            }

            $cart->selectShippingOption($data['fulfillment_method']);
            $result = $checkout->create(
                $cart,
                [
                    'customer_email' => $data['email'],
                    'customer_name' => $data['name'],
                    'customer_phone' => $data['phone'] ?? null,
                    'shipping_address' => $this->shippingAddress($data),
                ],
                $data['payment_method'],
                idempotencyKey: (string) Str::uuid(),
            );

            /** @var Order $order */
            $order = $result->order;
            $order->update(['notes' => $data['notes'] ?? null]);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'items' => $exception->getMessage(),
            ]);
        } finally {
            $cart->delete();
        }

        return to_route('order.confirmation', $order);
    }

    /** @param array<string, mixed> $data */
    private function shippingAddress(array $data): ?Address
    {
        if ($data['fulfillment_method'] !== 'delivery') {
            return null;
        }

        $nameParts = preg_split('/\s+/', trim($data['name'])) ?: [];
        $firstName = Arr::first($nameParts);
        $lastName = count($nameParts) > 1
            ? implode(' ', array_slice($nameParts, 1))
            : $firstName;

        return new Address(
            country: 'DE',
            firstName: $firstName,
            lastName: $lastName,
            street: $data['street'],
            city: $data['city'],
            postcode: $data['postcode'],
            email: $data['email'],
            phone: $data['phone'] ?? null,
        );
    }
}
