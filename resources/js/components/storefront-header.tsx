import { router, usePage } from '@inertiajs/react';

import LocaleController from '@/actions/App/Http/Controllers/LocaleController';
import { storefrontCopy } from '@/lib/storefront-localization';

export default function StorefrontHeader({
    itemCount,
    onCartOpen,
}: {
    itemCount: number;
    onCartOpen: () => void;
}) {
    const { localization } = usePage().props;
    const text = storefrontCopy[localization.locale];

    return (
        <header className="border-b border-[#d9d8d1] bg-[#f7f6f2]">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-[#b9352b] text-lg font-semibold text-white">
                        K
                    </span>
                    <div>
                        <p className="text-base font-semibold">Köz Kebab</p>
                        <p className="text-xs text-[#6c716d]">{text.tagline}</p>
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
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                    },
                                )
                            }
                            className="h-9 appearance-none rounded-md border border-[#c9c9c1] bg-white pr-7 pl-2 text-sm font-medium text-[#4f5651] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                        >
                            {Object.entries(localization.supportedLocales).map(
                                ([locale, name]) => (
                                    <option key={locale} value={locale}>
                                        {name}
                                    </option>
                                ),
                            )}
                        </select>
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 right-2.5 size-2 -translate-y-2/3 rotate-45 border-r border-b border-[#6c716d]"
                        />
                    </span>
                    <button
                        type="button"
                        onClick={onCartOpen}
                        className="flex h-10 items-center gap-2 rounded-md px-2 transition-colors hover:bg-[#dfe7e1] hover:text-[#1f5c45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f5c45]"
                    >
                        <span className="hidden sm:inline">{text.order}</span>
                        <span className="flex size-9 items-center justify-center rounded-full border border-[#c9c9c1] bg-white">
                            {itemCount}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
