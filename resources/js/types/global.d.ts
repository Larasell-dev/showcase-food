import type { SupportedLocale } from '@/lib/storefront-localization';
import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            localization: {
                locale: SupportedLocale;
                supportedLocales: Record<string, string>;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
