import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import CartProductImage from '@/components/cart-product-image';
import StorefrontHeader from '@/components/storefront-header';
import { useCart } from '@/lib/cart';
import { storefrontCopy } from '@/lib/storefront-localization';
import { home } from '@/routes';
import { store as storeCheckout } from '@/routes/checkout';

type FulfillmentMethod = 'delivery' | 'pickup';
type PaymentMethod = 'cash' | 'stripe';

const inputClassName =
    'h-11 w-full rounded-md border border-[#c9c9c1] bg-white px-3 text-sm text-[#1c211d] placeholder:text-[#929790] focus-visible:border-[#1f5c45] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1f5c45]';

export default function Checkout() {
    const { localization } = usePage().props;
    const text = storefrontCopy[localization.locale];
    const { items, itemCount, totalAmount, clearCart } = useCart();
    const [fulfillmentMethod, setFulfillmentMethod] =
        useState<FulfillmentMethod>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const deliveryAmount =
        fulfillmentMethod === 'delivery' &&
        totalAmount > 0 &&
        totalAmount < 2500
            ? 300
            : 0;
    const orderTotalAmount = totalAmount + deliveryAmount;
    const formatPrice = (amount: number) =>
        new Intl.NumberFormat(localization.locale, {
            style: 'currency',
            currency: 'EUR',
        }).format(amount / 100);

    return (
        <>
            <Head title={text.checkout} />

            <main className="min-h-screen bg-[#f7f6f2] text-[#1c211d]">
                <StorefrontHeader
                    itemCount={itemCount}
                    onCartOpen={() =>
                        document
                            .getElementById('order-summary')
                            ?.scrollIntoView({ behavior: 'smooth' })
                    }
                />

                <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
                    <div className="mb-8 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold text-[#b9352b]">
                                {text.checkoutEyebrow}
                            </p>
                            <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
                                {text.checkoutHeading}
                            </h1>
                        </div>
                        <Link
                            href={home()}
                            className="hidden text-sm font-medium text-[#4f5651] underline underline-offset-4 hover:text-[#1f5c45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45] sm:inline"
                        >
                            {text.backToMenu}
                        </Link>
                    </div>

                    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:gap-14">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const formData = new FormData(
                                    event.currentTarget,
                                );

                                router.post(
                                    storeCheckout(),
                                    {
                                        fulfillment_method: fulfillmentMethod,
                                        name: formData.get('name'),
                                        email: formData.get('email'),
                                        phone: formData.get('phone'),
                                        street: formData.get('street'),
                                        postcode: formData.get('postcode'),
                                        city: formData.get('city'),
                                        notes: formData.get('notes'),
                                        payment_method: paymentMethod,
                                        items: items.map(
                                            ({ product, quantity }) => ({
                                                product_id: product.id,
                                                quantity,
                                            }),
                                        ),
                                    },
                                    {
                                        onStart: () => setIsSubmitting(true),
                                        onSuccess: clearCart,
                                        onFinish: () => setIsSubmitting(false),
                                    },
                                );
                            }}
                            className="min-w-0"
                        >
                            <CheckoutSection title={text.fulfillmentMethod}>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <FulfillmentOption
                                        name="fulfillment_method"
                                        value="delivery"
                                        title={text.delivery}
                                        description={text.deliveryDescription}
                                        checked={
                                            fulfillmentMethod === 'delivery'
                                        }
                                        onChange={setFulfillmentMethod}
                                    />
                                    <FulfillmentOption
                                        name="fulfillment_method"
                                        value="pickup"
                                        title={text.pickup}
                                        description={text.pickupDescription}
                                        checked={fulfillmentMethod === 'pickup'}
                                        onChange={setFulfillmentMethod}
                                    />
                                </div>
                            </CheckoutSection>

                            <CheckoutSection title={text.contactDetails}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        id="name"
                                        label={text.fullName}
                                        autoComplete="name"
                                        required
                                    />
                                    <Field
                                        id="email"
                                        label={text.email}
                                        type="email"
                                        autoComplete="email"
                                        required
                                    />
                                    <Field
                                        id="phone"
                                        label={text.phone}
                                        type="tel"
                                        autoComplete="tel"
                                    />
                                </div>
                            </CheckoutSection>

                            {fulfillmentMethod === 'delivery' && (
                                <CheckoutSection title={text.deliveryAddress}>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Field
                                                id="street"
                                                label={text.streetAddress}
                                                autoComplete="street-address"
                                                required
                                            />
                                        </div>
                                        <Field
                                            id="postcode"
                                            label={text.postcode}
                                            autoComplete="postal-code"
                                            required
                                        />
                                        <Field
                                            id="city"
                                            label={text.city}
                                            autoComplete="address-level2"
                                            required
                                        />
                                    </div>
                                </CheckoutSection>
                            )}

                            <CheckoutSection title={text.orderNotes}>
                                <label className="block" htmlFor="notes">
                                    <span className="sr-only">
                                        {text.orderNotes}
                                    </span>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        placeholder={text.orderNotesPlaceholder}
                                        className={`${inputClassName} h-auto resize-y py-3`}
                                    />
                                </label>
                            </CheckoutSection>

                            <CheckoutSection title={text.paymentMethod}>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <PaymentOption
                                        value="cash"
                                        title={text.cash}
                                        description={text.cashDescription}
                                        checked={paymentMethod === 'cash'}
                                        onChange={setPaymentMethod}
                                    />
                                    <PaymentOption
                                        value="stripe"
                                        title={text.stripe}
                                        description={text.stripeDescription}
                                        checked={paymentMethod === 'stripe'}
                                        onChange={setPaymentMethod}
                                    />
                                </div>
                            </CheckoutSection>

                            <button
                                type="submit"
                                disabled={items.length === 0 || isSubmitting}
                                className="mt-8 h-12 w-full rounded-md bg-[#1f5c45] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#174936] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45] disabled:cursor-not-allowed disabled:bg-[#9ca8a0] sm:w-auto"
                            >
                                {isSubmitting
                                    ? text.placingOrder
                                    : text.placeOrder}
                            </button>
                        </form>

                        <aside
                            id="order-summary"
                            aria-labelledby="order-summary-title"
                            className="overflow-hidden rounded-lg border border-[#deddd6] bg-white shadow-[0_1px_2px_rgba(28,33,29,0.06)] lg:sticky lg:top-6"
                        >
                            <div className="border-b border-[#deddd6] px-5 py-5 sm:px-6">
                                <h2
                                    id="order-summary-title"
                                    className="text-lg font-semibold"
                                >
                                    {text.orderSummary}
                                </h2>
                                <p className="mt-1 text-sm text-[#6c716d]">
                                    {itemCount}{' '}
                                    {itemCount === 1
                                        ? text.oneItem
                                        : text.manyItems}
                                </p>
                            </div>

                            {items.length > 0 ? (
                                <div className="divide-y divide-[#deddd6] px-5 sm:px-6">
                                    {items.map(({ product, quantity }) => (
                                        <div
                                            key={product.id}
                                            className="flex gap-3 py-4"
                                        >
                                            <div className="size-16 shrink-0 overflow-hidden rounded-md bg-[#e7e5dd]">
                                                <CartProductImage
                                                    product={product}
                                                    compact
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p className="text-sm leading-5 font-semibold">
                                                        {product.name}
                                                    </p>
                                                    <span className="shrink-0 text-sm font-semibold">
                                                        {formatPrice(
                                                            product.priceAmount *
                                                                quantity,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-[#6c716d]">
                                                    {quantity} × {product.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm font-semibold">
                                        {text.cartEmpty}
                                    </p>
                                    <Link
                                        href={home()}
                                        className="mt-2 inline-block text-sm font-medium text-[#1f5c45] underline underline-offset-4"
                                    >
                                        {text.backToMenu}
                                    </Link>
                                </div>
                            )}

                            <div className="border-t border-[#deddd6] bg-[#fafaf8] px-5 py-5 sm:px-6">
                                <div className="flex justify-between gap-4 text-sm text-[#4f5651]">
                                    <span>{text.subtotal}</span>
                                    <span className="font-medium text-[#1c211d]">
                                        {formatPrice(totalAmount)}
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between gap-4 text-sm text-[#4f5651]">
                                    <span>{text.shipping}</span>
                                    <span className="font-medium text-[#1c211d]">
                                        {deliveryAmount > 0
                                            ? formatPrice(deliveryAmount)
                                            : text.free}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#deddd6] pt-4">
                                    <span className="font-semibold">
                                        {text.total}
                                    </span>
                                    <span className="text-xl font-semibold">
                                        {formatPrice(orderTotalAmount)}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function CheckoutSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-b border-[#d9d8d1] py-7 first:pt-0">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {children}
        </section>
    );
}

function FulfillmentOption({
    name,
    value,
    title,
    description,
    checked,
    onChange,
}: {
    name: string;
    value: FulfillmentMethod;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: FulfillmentMethod) => void;
}) {
    return (
        <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${checked ? 'border-[#1f5c45] bg-[#edf2ee]' : 'border-[#c9c9c1] bg-white hover:border-[#769080]'}`}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="mt-0.5 size-4 accent-[#1f5c45]"
            />
            <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-[#656b66]">
                    {description}
                </span>
            </span>
        </label>
    );
}

function PaymentOption({
    value,
    title,
    description,
    checked,
    onChange,
}: {
    value: PaymentMethod;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: PaymentMethod) => void;
}) {
    return (
        <label
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${checked ? 'border-[#1f5c45] bg-[#edf2ee]' : 'border-[#c9c9c1] bg-white hover:border-[#769080]'}`}
        >
            <input
                type="radio"
                name="payment_method"
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="mt-0.5 size-4 accent-[#1f5c45]"
            />
            <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-[#656b66]">
                    {description}
                </span>
            </span>
        </label>
    );
}

function Field({
    id,
    label,
    type = 'text',
    autoComplete,
    required = false,
}: {
    id: string;
    label: string;
    type?: string;
    autoComplete: string;
    required?: boolean;
}) {
    return (
        <label className="block" htmlFor={id}>
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            <input
                id={id}
                name={id}
                type={type}
                autoComplete={autoComplete}
                required={required}
                className={inputClassName}
            />
        </label>
    );
}
