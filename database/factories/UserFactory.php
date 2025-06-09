<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    static $cidCounter = 17126; // Starting value

    
    public function definition(): array
    {
        
        $fname = $this->faker->firstName();
        $lname = $this->faker->lastName();
        return [
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'), // Default password
            'cid' => str_pad(self::$cidCounter++, 6, '0', STR_PAD_LEFT),
            'first_name' => $fname,
            'last_name' => $lname,
            'bithdate' => $this->faker->date('Y-m-d', '2005-01-01'),
            'phone_number' => $this->faker->phoneNumber(),
            'birth_place' => $this->faker->city(),
            'current_address' => $this->faker->address(),
            'permanent_address' => $this->faker->address(),
            'is_admin' => 0,
            'name' => $fname.' '.$lname,
            'otp' => $this->faker->numberBetween(100000, 999999),
            'is_active' => 3,
            'status' => 1,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
