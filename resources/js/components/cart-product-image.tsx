import type { CartProduct } from '@/lib/cart';

const fallbackPositions: Record<string, string> = {
    'doner-wraps': 'bg-left',
    'grill-plates': 'bg-center',
    'sides-drinks': 'bg-right',
};

export default function CartProductImage({
    product,
    compact = false,
}: {
    product: CartProduct;
    compact?: boolean;
}) {
    if (product.imageUrl) {
        return (
            <img
                src={product.imageUrl}
                alt={product.imageAlt}
                className={
                    compact
                        ? 'size-full object-cover'
                        : 'aspect-[4/3] w-full object-cover'
                }
            />
        );
    }

    const position =
        fallbackPositions[product.fallbackCategory ?? ''] ?? 'bg-left';

    return (
        <div
            role="img"
            aria-label={product.imageAlt}
            className={`${compact ? 'size-full' : 'aspect-[4/3] w-full'} bg-[url('/images/storefront/kebab-menu-fallback.webp')] bg-[length:300%_100%] bg-no-repeat ${position}`}
        />
    );
}
