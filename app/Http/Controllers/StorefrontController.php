<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;
use Larasell\Larasell\Models\Category;
use Larasell\Larasell\Models\Product;
use Larasell\Larasell\Models\ProductImage;
use Larasell\Larasell\Price;

class StorefrontController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $categories = Category::query()
            ->root()
            ->orderBy('name')
            ->get(['id', 'slug', 'name']);

        $selectedCategory = $categories->first(
            fn (Category $category): bool => $category->slug->get() === $request->string('category')->toString(),
        );
        $products = Product::query()
            ->visible()
            ->when(
                $selectedCategory,
                fn ($query, Category $category) => $query->inCategory($category),
            )
            ->with(['categories:id,slug', 'images'])
            ->orderBy('id')
            ->get(['id', 'slug', 'name', 'description', 'price']);

        return Inertia::render('storefront', [
            'categories' => $categories->map(fn (Category $category): array => [
                'id' => $category->id,
                'slug' => $category->slug->get(),
                'name' => $category->name->get(),
            ])->values(),
            'selectedCategory' => $selectedCategory?->slug->get(),
            'products' => $this->productProps($products),
        ]);
    }

    /**
     * @param  Collection<int, Product>  $products
     * @return array<int, array{
     *     id: int,
     *     slug: string,
     *     name: string,
     *     description: string|null,
     *     price: string,
     *     priceAmount: int,
     *     imageUrl: string|null,
     *     imageAlt: string,
     *     fallbackCategory: string|null
     * }>
     */
    private function productProps(Collection $products): array
    {
        return $products->map(function (Product $product): array {
            /** @var ProductImage|null $image */
            $image = $product->images->first();

            return [
                'id' => $product->id,
                'slug' => $product->slug->get(),
                'name' => $product->name->get(),
                'description' => $product->description?->get(),
                'price' => Price::format($product->price, 'EUR', App::currentLocale()),
                'priceAmount' => (int) $product->price->amount(),
                'imageUrl' => $image?->url(),
                'imageAlt' => $image === null ? $product->name->get() : ($image->alt ?? $product->name->get()),
                'fallbackCategory' => $product->categories->first()?->slug->get(),
            ];
        })->values()->all();
    }
}
