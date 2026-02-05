<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'category',
        'description',
        'is_public',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $config = static::where('key', $key)->first();
        
        if (!$config) {
            return $default;
        }

        return match ($config->type) {
            'boolean' => (bool) $config->value,
            'integer' => (int) $config->value,
            'float', 'decimal' => (float) $config->value,
            'array', 'json' => json_decode($config->value, true),
            default => $config->value,
        };
    }

    public static function setValue(string $key, mixed $value, string $type = 'string', ?string $category = null): self
    {
        $configValue = match ($type) {
            'array', 'json' => json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $configValue,
                'type' => $type,
                'category' => $category ?? 'general',
            ]
        );
    }
}
