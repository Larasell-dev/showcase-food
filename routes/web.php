<?php

use App\Http\Controllers\LocaleController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

Route::get('/', StorefrontController::class)->name('home');
Route::post('/locale', LocaleController::class)->name('locale.store');
