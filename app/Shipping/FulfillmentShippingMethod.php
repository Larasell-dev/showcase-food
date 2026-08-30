<?php

namespace App\Shipping;

use Larasell\Larasell\Models\Cart;
use Larasell\Larasell\Price;
use Larasell\Larasell\Shipping\ShippingMethod;

class FulfillmentShippingMethod extends ShippingMethod
{
    public function handle(Cart $cart): void
    {
        $subtotal = $cart->subtotal();
        $deliveryPrice = $subtotal !== null && (int) $subtotal->amount() < 2500
            ? Price::of(300)
            : Price::of(0);

        $this->register('delivery', 'Delivery', $deliveryPrice);
        $this->register('pickup', 'Pickup', Price::of(0), requiresAddress: false);
    }
}
