import { Dialog } from '@base-ui/react/dialog';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import CartProductImage from '@/components/cart-product-image';
import StorefrontHeader from '@/components/storefront-header';
import { useCart } from '@/lib/cart';
import type { CartItem, CartProduct } from '@/lib/cart';
import { storefrontCopy } from '@/lib/storefront-localization';
import { checkout, home } from '@/routes';

type Category = {
    id: number;
    slug: string;
    name: string;
};

type Product = CartProduct;

type StorefrontProps = {
    categories: Category[];
    selectedCategory: string | null;
    products: Product[];
};

export default function Storefront({
    categories,
    selectedCategory,
    products,
}: StorefrontProps) {
    const { localization } = usePage().props;
    const text = storefrontCopy[localization.locale];
    const [cartOpen, setCartOpen] = useState(false);
    const { items, itemCount, totalAmount, addItem, updateQuantity } =
        useCart();

    function addToCart(product: Product) {
        addItem(product);
        setCartOpen(true);
    }

    return (
        <>
            <Head title={text.pageTitle} />

            <main className="min-h-screen bg-[#f7f6f2] text-[#1c211d]">
                <StorefrontHeader
                    itemCount={itemCount}
                    onCartOpen={() => setCartOpen(true)}
                />

                <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#b9352b]">
                                {text.eyebrow}
                            </p>
                            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
                                {text.heading}
                            </h1>
                        </div>
                        <p className="text-sm text-[#6c716d]">
                            {products.length}{' '}
                            {products.length === 1
                                ? text.oneItem
                                : text.manyItems}
                        </p>
                    </div>

                    <nav
                        aria-label={text.categories}
                        className="mt-8 flex gap-2 overflow-x-auto pb-2"
                    >
                        <Link
                            href={home()}
                            preserveScroll
                            preserveState
                            className={pillClass(selectedCategory === null)}
                        >
                            {text.all}
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={home({
                                    query: { category: category.slug },
                                })}
                                preserveScroll
                                preserveState
                                className={pillClass(
                                    selectedCategory === category.slug,
                                )}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    {products.length > 0 ? (
                        <section
                            aria-label={text.products}
                            className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {products.map((product) => (
                                <article
                                    key={product.id}
                                    className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#deddd6] bg-white shadow-[0_1px_2px_rgba(28,33,29,0.06)]"
                                >
                                    <CartProductImage product={product} />

                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <h2 className="min-w-0 text-lg leading-6 font-semibold">
                                                {product.name}
                                            </h2>
                                            <span className="shrink-0 text-sm font-semibold text-[#b9352b]">
                                                {product.price}
                                            </span>
                                        </div>

                                        <p className="mt-2 mb-5 line-clamp-3 text-sm leading-6 text-[#656b66]">
                                            {product.description}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => addToCart(product)}
                                            className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1f5c45] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#174936] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="text-lg leading-none"
                                            >
                                                +
                                            </span>
                                            {text.addToCart}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>
                    ) : (
                        <div className="mt-7 border-y border-[#d9d8d1] py-16 text-center">
                            <h2 className="text-lg font-semibold">
                                {text.emptyTitle}
                            </h2>
                            <p className="mt-2 text-sm text-[#6c716d]">
                                {text.emptyText}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <CartDialog
                open={cartOpen}
                onOpenChange={setCartOpen}
                items={items}
                totalAmount={totalAmount}
                locale={localization.locale}
                text={text}
                onUpdateQuantity={updateQuantity}
            />
        </>
    );
}

function CartDialog({
    open,
    onOpenChange,
    items,
    totalAmount,
    locale,
    text,
    onUpdateQuantity,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CartItem[];
    totalAmount: number;
    locale: string;
    text: (typeof storefrontCopy)[keyof typeof storefrontCopy];
    onUpdateQuantity: (productId: number, quantity: number) => void;
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-40 bg-[#1c211d]/45 opacity-100 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md translate-x-0 flex-col bg-[#f7f6f2] shadow-[-12px_0_32px_rgba(28,33,29,0.18)] transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
                    <div className="flex items-start justify-between gap-6 border-b border-[#d9d8d1] px-5 py-5 sm:px-6">
                        <div className="min-w-0">
                            <Dialog.Title className="text-xl font-semibold text-[#1c211d]">
                                {text.cartTitle}
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-[#6c716d]">
                                {text.cartDescription}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close
                            aria-label={text.closeCart}
                            className="flex size-10 shrink-0 items-center justify-center rounded-md text-2xl leading-none text-[#4f5651] transition-colors hover:bg-[#dfe7e1] hover:text-[#1f5c45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                        >
                            <span aria-hidden="true">&times;</span>
                        </Dialog.Close>
                    </div>

                    {items.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-6">
                                {items.map(({ product, quantity }) => (
                                    <div
                                        key={product.id}
                                        className="flex gap-4 border-b border-[#deddd6] py-5"
                                    >
                                        <div className="size-20 shrink-0 overflow-hidden rounded-md bg-[#e7e5dd]">
                                            <CartProductImage
                                                product={product}
                                                compact
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="min-w-0 font-semibold text-[#1c211d]">
                                                    {product.name}
                                                </p>
                                                <span className="shrink-0 text-sm font-semibold text-[#b9352b]">
                                                    {product.price}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex h-9 items-center rounded-md border border-[#c9c9c1] bg-white">
                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            text.decreaseQuantity
                                                        }
                                                        onClick={() =>
                                                            onUpdateQuantity(
                                                                product.id,
                                                                quantity - 1,
                                                            )
                                                        }
                                                        className="flex size-9 items-center justify-center rounded-l-md text-lg text-[#4f5651] transition-colors hover:bg-[#dfe7e1] hover:text-[#1f5c45] focus-visible:outline-2 focus-visible:outline-[#1f5c45]"
                                                    >
                                                        <span aria-hidden="true">
                                                            −
                                                        </span>
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            text.increaseQuantity
                                                        }
                                                        onClick={() =>
                                                            onUpdateQuantity(
                                                                product.id,
                                                                quantity + 1,
                                                            )
                                                        }
                                                        className="flex size-9 items-center justify-center rounded-r-md text-lg text-[#4f5651] transition-colors hover:bg-[#dfe7e1] hover:text-[#1f5c45] focus-visible:outline-2 focus-visible:outline-[#1f5c45]"
                                                    >
                                                        <span aria-hidden="true">
                                                            +
                                                        </span>
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onUpdateQuantity(
                                                            product.id,
                                                            0,
                                                        )
                                                    }
                                                    className="text-sm font-medium text-[#6c716d] underline underline-offset-4 hover:text-[#b9352b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9352b]"
                                                >
                                                    {text.remove}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                            <p className="text-lg font-semibold text-[#1c211d]">
                                {text.cartEmpty}
                            </p>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-[#6c716d]">
                                {text.cartEmptyText}
                            </p>
                        </div>
                    )}
                    <div className="flex items-end justify-between gap-4 border-t border-[#d9d8d1] bg-white px-5 py-5 sm:px-6">
                        <Link
                            href={checkout()}
                            className="rounded-md bg-[#1f5c45] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#174936] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                        >
                            {text.checkout}
                        </Link>
                        <div className="text-right text-[#1c211d]">
                            <p className="text-sm font-medium text-[#6c716d]">
                                {text.total}
                            </p>
                            <p className="mt-0.5 text-lg font-semibold">
                                {new Intl.NumberFormat(locale, {
                                    style: 'currency',
                                    currency: 'EUR',
                                }).format(totalAmount / 100)}
                            </p>
                        </div>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function pillClass(isActive: boolean): string {
    return [
        'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        isActive
            ? 'border-[#1f5c45] bg-[#1f5c45] text-white'
            : 'border-[#c9c9c1] bg-white text-[#4f5651] hover:border-[#1f5c45] hover:text-[#1f5c45]',
    ].join(' ');
}
