<?php

use Inertia\Testing\AssertableInertia as Assert;
use Larasell\Larasell\Enums\Visibility;
use Larasell\Larasell\Models\Category;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Price;

it('renders visible products and root category filters', function () {
    $wraps = createCategory('wraps', 'Wraps');
    $plates = createCategory('plates', 'Plates');
    createCategory('hidden', 'Hidden', Visibility::Hidden);

    $wrap = createProduct('chicken-wrap', 'Chicken Wrap');
    $plate = createProduct('mixed-plate', 'Mixed Plate');
    createProduct('hidden-product', 'Hidden Product', Visibility::Hidden);
    $wrap->categories()->attach($wraps);
    $plate->categories()->attach($plates);

    $response = $this->get(route('home'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('storefront')
        ->where('selectedCategory', null)
        ->has('categories', 2)
        ->where('categories.0.slug', 'plates')
        ->where('categories.1.slug', 'wraps')
        ->has('products', 2)
        ->where('products.0.name', 'Chicken Wrap')
        ->where('products.1.name', 'Mixed Plate')
        ->missing('products.2'));
});

it('filters products by the selected category', function () {
    $wraps = createCategory('wraps', 'Wraps');
    $plates = createCategory('plates', 'Plates');
    $wrap = createProduct('chicken-wrap', 'Chicken Wrap');
    $plate = createProduct('mixed-plate', 'Mixed Plate');
    $wrap->categories()->attach($wraps);
    $plate->categories()->attach($plates);

    $response = $this->get(route('home', ['category' => 'plates']));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('selectedCategory', 'plates')
        ->has('products', 1)
        ->where('products.0.slug', 'mixed-plate'));
});

it('shows all products when the category filter is unknown', function () {
    $category = createCategory('wraps', 'Wraps');
    $firstProduct = createProduct('chicken-wrap', 'Chicken Wrap');
    $secondProduct = createProduct('falafel-wrap', 'Falafel Wrap');
    $firstProduct->categories()->attach($category);
    $secondProduct->categories()->attach($category);

    $response = $this->get(route('home', ['category' => 'unknown']));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('selectedCategory', null)
        ->has('products', 2));
});

function createCategory(string $slug, string $name, Visibility $status = Visibility::Visible): Category
{
    return Category::query()->create([
        'slug' => $slug,
        'name' => $name,
        'status' => $status,
    ]);
}

function createProduct(string $slug, string $name, Visibility $status = Visibility::Visible): Product
{
    return Product::query()->create([
        'slug' => $slug,
        'name' => ['en' => $name],
        'description' => ['en' => "Freshly prepared {$name}."],
        'price' => Price::of(950),
        'status' => $status,
    ]);
}
