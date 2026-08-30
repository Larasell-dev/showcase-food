<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Larasell\Larasell\Models\Payment;

class StripeCheckoutSuccessController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string', 'max:255'],
        ]);

        $payment = Payment::query()
            ->where('provider', 'stripe')
            ->where('reference', $validated['session_id'])
            ->firstOrFail();

        return to_route('order.confirmation', $payment->order);
    }
}
