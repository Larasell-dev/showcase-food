<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var array<string, string> $supportedLocales */
        $supportedLocales = config('app.supported_locales');
        $preferredLocale = $request->cookie('locale');

        if (! is_string($preferredLocale) || ! array_key_exists($preferredLocale, $supportedLocales)) {
            $preferredLocale = $request->getPreferredLanguage(array_keys($supportedLocales))
                ?? config('app.locale');
        }

        App::setLocale($preferredLocale);

        return $next($request);
    }
}
