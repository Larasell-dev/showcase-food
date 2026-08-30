import { Head, Link, router, usePage } from '@inertiajs/react';

import LocaleController from '@/actions/App/Http/Controllers/LocaleController';
import { storefrontCopy } from '@/lib/storefront-localization';
import { home } from '@/routes';

type Category = {
    id: number;
    slug: string;
    name: string;
};

type Product = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    imageAlt: string;
    fallbackCategory: string | null;
};

type StorefrontProps = {
    categories: Category[];
    selectedCategory: string | null;
    products: Product[];
};

const fallbackPositions: Record<string, string> = {
    'doner-wraps': 'bg-left',
    'grill-plates': 'bg-center',
    'sides-drinks': 'bg-right',
};

export default function Storefront({
    categories,
    selectedCategory,
    products,
}: StorefrontProps) {
    const { localization } = usePage().props;
    const text = storefrontCopy[localization.locale];

    return (
        <>
            <Head title={text.pageTitle} />

            <main className="min-h-screen bg-[#f7f6f2] text-[#1c211d]">
                <header className="border-b border-[#d9d8d1] bg-[#f7f6f2]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-full bg-[#b9352b] text-lg font-semibold text-white">
                                K
                            </span>
                            <div>
                                <p className="text-base font-semibold">
                                    Köz Kebab
                                </p>
                                <p className="text-xs text-[#6c716d]">
                                    {text.tagline}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-medium text-[#4f5651]">
                            <label className="sr-only" htmlFor="locale">
                                {text.language}
                            </label>
                            <span className="relative">
                                <select
                                    id="locale"
                                    value={localization.locale}
                                    onChange={(event) =>
                                        router.post(
                                            LocaleController.url(),
                                            { locale: event.target.value },
                                            { preserveScroll: true },
                                        )
                                    }
                                    className="h-9 appearance-none rounded-md border border-[#c9c9c1] bg-white pr-7 pl-2 text-sm font-medium text-[#4f5651] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                                >
                                    {Object.entries(
                                        localization.supportedLocales,
                                    ).map(([locale, name]) => (
                                        <option key={locale} value={locale}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 right-2.5 size-2 -translate-y-2/3 rotate-45 border-r border-b border-[#6c716d]"
                                />
                            </span>
                            <span className="hidden sm:inline">
                                {text.order}
                            </span>
                            <span className="flex size-9 items-center justify-center rounded-full border border-[#c9c9c1] bg-white">
                                0
                            </span>
                        </div>
                    </div>
                </header>

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
                                    <ProductImage product={product} />

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
        </>
    );
}

function ProductImage({ product }: { product: Product }) {
    if (product.imageUrl) {
        return (
            <img
                src={product.imageUrl}
                alt={product.imageAlt}
                className="aspect-[4/3] w-full object-cover"
            />
        );
    }

    const position =
        fallbackPositions[product.fallbackCategory ?? ''] ?? 'bg-left';

    return (
        <div
            role="img"
            aria-label={product.imageAlt}
            className={`aspect-[4/3] w-full bg-[url('/images/storefront/kebab-menu-fallback.webp')] bg-[length:300%_100%] bg-no-repeat ${position}`}
        />
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
