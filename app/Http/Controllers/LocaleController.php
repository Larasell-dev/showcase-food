<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetLocaleRequest;
use Illuminate\Http\RedirectResponse;

class LocaleController extends Controller
{
    public function __invoke(SetLocaleRequest $request): RedirectResponse
    {
        return back()->withCookie(cookie()->forever('locale', $request->validated('locale')));
    }
}
