<?php

namespace App\Providers;

use App\Models\Order;
use App\Shipping\FulfillmentShippingMethod;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Larasell\Larasell\Shipping\ShippingManager;
use Larasell\Stripe\StripePaymentProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        config([
            'larasell.models.order' => Order::class,
            'larasell.payments.methods.stripe' => [
                'driver' => 'stripe',
                'provider' => StripePaymentProvider::class,
                'inventory_reservation_minutes' => 30,
            ],
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        app(ShippingManager::class)->register(FulfillmentShippingMethod::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
