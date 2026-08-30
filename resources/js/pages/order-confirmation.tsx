import { Head, Link, usePage } from '@inertiajs/react';

import StorefrontHeader from '@/components/storefront-header';
import { useCart } from '@/lib/cart';
import { storefrontCopy } from '@/lib/storefront-localization';
import { home } from '@/routes';

type OrderItem = {
    id: number;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
};

type Order = {
    items: OrderItem[];
    subtotal: string;
    shipping: string | null;
    total: string;
};

export default function OrderConfirmation({ order }: { order: Order }) {
    const { localization } = usePage().props;
    const text = storefrontCopy[localization.locale];
    const { itemCount } = useCart();

    return (
        <>
            <Head title={text.confirmationPageTitle} />

            <main className="min-h-screen bg-[#f7f6f2] text-[#1c211d]">
                <StorefrontHeader
                    itemCount={itemCount}
                    onCartOpen={() => undefined}
                />

                <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
                    <span
                        aria-hidden="true"
                        className="flex size-14 items-center justify-center rounded-full bg-[#1f5c45] text-2xl font-semibold text-white"
                    >
                        ✓
                    </span>
                    <p className="mt-6 text-sm font-semibold text-[#b9352b]">
                        {text.confirmationEyebrow}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                        {text.confirmationHeading}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#5f6661]">
                        {text.confirmationText}
                    </p>
                    <section
                        aria-labelledby="confirmed-order-title"
                        className="mt-8 w-full max-w-xl overflow-hidden rounded-lg border border-[#deddd6] bg-white text-left shadow-[0_1px_2px_rgba(28,33,29,0.06)]"
                    >
                        <div className="border-b border-[#deddd6] px-5 py-4">
                            <h2
                                id="confirmed-order-title"
                                className="font-semibold"
                            >
                                {text.orderSummary}
                            </h2>
                        </div>
                        <div className="divide-y divide-[#deddd6] px-5">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">
                                            {item.name}
                                        </p>
                                        <p className="mt-1 text-xs text-[#6c716d]">
                                            {item.quantity} × {item.unitPrice}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold">
                                        {item.total}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-[#deddd6] bg-[#fafaf8] px-5 py-4">
                            <div className="flex justify-between gap-4 text-sm text-[#4f5651]">
                                <span>{text.subtotal}</span>
                                <span className="font-medium text-[#1c211d]">
                                    {order.subtotal}
                                </span>
                            </div>
                            {order.shipping !== null && (
                                <div className="mt-3 flex justify-between gap-4 text-sm text-[#4f5651]">
                                    <span>{text.shipping}</span>
                                    <span className="font-medium text-[#1c211d]">
                                        {order.shipping}
                                    </span>
                                </div>
                            )}
                            <div className="mt-4 flex justify-between gap-4 border-t border-[#deddd6] pt-4 font-semibold">
                                <span>{text.total}</span>
                                <span>{order.total}</span>
                            </div>
                        </div>
                    </section>

                    <Link
                        href={home()}
                        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#1f5c45] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#174936] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                    >
                        {text.returnToMenu}
                    </Link>
                </div>
            </main>
        </>
    );
}
