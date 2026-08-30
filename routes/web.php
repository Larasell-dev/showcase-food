<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\OrderConfirmationController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\StripeCheckoutSuccessController;
use Illuminate\Support\Facades\Route;

Route::get('/', StorefrontController::class)->name('home');
Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/stripe/success', StripeCheckoutSuccessController::class)->name('checkout.stripe.success');
Route::get('/order-confirmation/{order}', OrderConfirmationController::class)->name('order.confirmation');
Route::post('/locale', LocaleController::class)->name('locale.store');
