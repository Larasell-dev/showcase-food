<?php

use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Price;

it('uses the browser preferred supported language by default', function () {
    localizedProduct();

    $this->withHeader('Accept-Language', 'de-DE,de;q=0.9,en;q=0.8')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('localization.locale', 'de')
            ->where('products.0.name', 'Hähnchen-Döner')
            ->where('products.0.price', "9,50\u{00A0}€"));
});

it('uses a saved language preference over the browser language', function () {
    localizedProduct();

    $this->withCookie('locale', 'tr')
        ->withHeader('Accept-Language', 'de-DE,de;q=0.9')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('localization.locale', 'tr')
            ->where('products.0.name', 'Tavuk Döner'));
});

it('stores an explicit language preference', function () {
    $storefrontUrl = route('home', ['category' => 'grill-plates']);

    $this->from($storefrontUrl)
        ->post(route('locale.store'), ['locale' => 'de'])
        ->assertRedirect($storefrontUrl)
        ->assertCookie('locale', 'de');
});

it('rejects an unsupported language preference', function () {
    $this->from(route('home'))
        ->post(route('locale.store'), ['locale' => 'fr'])
        ->assertRedirect(route('home'))
        ->assertSessionHasErrors('locale')
        ->assertCookieMissing('locale');
});

function localizedProduct(): Product
{
    return Product::query()->create([
        'slug' => 'chicken-doner',
        'name' => [
            'en' => 'Chicken Doner',
            'tr' => 'Tavuk Döner',
            'de' => 'Hähnchen-Döner',
        ],
        'description' => [
            'en' => 'Fresh chicken doner.',
            'tr' => 'Taze tavuk döner.',
            'de' => 'Frischer Hähnchen-Döner.',
        ],
        'price' => Price::of(950),
    ]);
}
