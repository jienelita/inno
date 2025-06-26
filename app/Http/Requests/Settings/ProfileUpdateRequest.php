<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
      
    public function rules(): array
    {
        return [
            'first_name'  => [
                'required',
                'string'
            ],
            'middle_name'  => [
                'required',
                'string'
            ],
            'last_name'  => [
                'required',
                'string'
            ],
            'prefix_name'  => [
                'required',
                'string'
            ],
            'bithdate'  => [
                'required',
                'string'
            ],
            'birth_place'  => [
                'required',
                'string'
            ],
            'current_address'  => [
                'required',
                'string'
            ],
            'permanent_address'  => [
                'required',
                'string'
            ],
            // 'email' => [
            //     'required',
            //     'string',
            //     'lowercase',
            //     'email',
            //     'max:255',
            //     Rule::unique(User::class)->ignore($this->user()->id),
            // ],
        ];
    }
}
