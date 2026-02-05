<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;
use App\Models\AdminConfiguration;
use Carbon\Carbon;

class SecurityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if system is in maintenance mode
        if ($this->isSystemInMaintenance()) {
            return $this->maintenanceResponse($request);
        }

        // Check if new registrations are allowed
        if ($this->isRegistrationRequest($request) && !$this->areNewRegistrationsAllowed()) {
            return $this->registrationDisabledResponse($request);
        }

        // Check if new investments are allowed
        if ($this->isInvestmentRequest($request) && !$this->areNewInvestmentsAllowed()) {
            return $this->investmentDisabledResponse($request);
        }

        // Check if new teams are allowed
        if ($this->isTeamRequest($request) && !$this->areNewTeamsAllowed()) {
            return $this->teamDisabledResponse($request);
        }

        // Validate user session
        if ($this->shouldValidateSession($request) && !$this->isValidSession($request)) {
            return $this->invalidSessionResponse($request);
        }

        // Log security event
        $this->logSecurityEvent($request);

        // Rate limiting check
        if ($this->shouldApplyRateLimiting($request) && $this->isRateLimited($request)) {
            return $this->rateLimitResponse($request);
        }

        // Validate request integrity
        if (!$this->validateRequestIntegrity($request)) {
            return $this->invalidRequestResponse($request);
        }

        return $next($request);
    }

    /**
     * Check if system is in maintenance mode
     */
    private function isSystemInMaintenance(): bool
    {
        return AdminConfiguration::getValue('system_maintenance_mode', false);
    }

    /**
     * Check if this is a registration request
     */
    private function isRegistrationRequest(Request $request): bool
    {
        return $request->is('register') || 
               $request->is('api/*') && 
               $request->method() === 'POST' && 
               str_contains($request->path(), 'register');
    }

    /**
     * Check if new registrations are allowed
     */
    private function areNewRegistrationsAllowed(): bool
    {
        return AdminConfiguration::getValue('allow_new_registrations', true);
    }

    /**
     * Check if this is an investment request
     */
    private function isInvestmentRequest(Request $request): bool
    {
        return $request->is('investments/*') || 
               $request->is('api/investments') ||
               str_contains($request->path(), 'investment');
    }

    /**
     * Check if new investments are allowed
     */
    private function areNewInvestmentsAllowed(): bool
    {
        return AdminConfiguration::getValue('allow_new_investments', true);
    }

    /**
     * Check if this is a team request
     */
    private function isTeamRequest(Request $request): bool
    {
        return $request->is('teams/*') || 
               $request->is('api/teams') ||
               str_contains($request->path(), 'team');
    }

    /**
     * Check if new teams are allowed
     */
    private function areNewTeamsAllowed(): bool
    {
        return AdminConfiguration::getValue('allow_new_teams', true);
    }

    /**
     * Check if session should be validated
     */
    private function shouldValidateSession(Request $request): bool
    {
        return Auth::check() && 
               !in_array($request->path(), ['login', 'logout', 'password/reset']) &&
               !$request->is('api/*');
    }

    /**
     * Check if session is valid
     */
    private function isValidSession(Request $request): bool
    {
        $sessionTimeout = AdminConfiguration::getValue('session_timeout_minutes', 120);
        $lastActivity = session('last_activity');
        
        if (!$lastActivity) {
            session(['last_activity' => now()]);
            return true;
        }

        $lastActivity = Carbon::parse($lastActivity);
        
        if ($lastActivity->diffInMinutes(now()) > $sessionTimeout) {
            Auth::logout();
            session()->flush();
            return false;
        }

        session(['last_activity' => now()]);
        return true;
    }

    /**
     * Check if rate limiting should be applied
     */
    private function shouldApplyRateLimiting(Request $request): bool
    {
        return in_array($request->method(), ['POST', 'PUT', 'DELETE']) ||
               $request->is('login') ||
               $request->is('register') ||
               $request->is('password/reset');
    }

    /**
     * Check if request is rate limited
     */
    private function isRateLimited(Request $request): bool
    {
        $key = 'rate_limit:' . $request->ip() . ':' . $request->path();
        $maxAttempts = $this->getMaxAttempts($request);
        $decayMinutes = $this->getDecayMinutes($request);

        $attempts = cache()->get($key, 0);
        
        if ($attempts >= $maxAttempts) {
            return true;
        }

        cache()->put($key, $attempts + 1, $decayMinutes * 60);
        return false;
    }

    /**
     * Get maximum attempts for rate limiting
     */
    private function getMaxAttempts(Request $request): int
    {
        if ($request->is('login')) {
            return AdminConfiguration::getValue('max_login_attempts', 5);
        }
        
        return 10; // Default for other requests
    }

    /**
     * Get decay minutes for rate limiting
     */
    private function getDecayMinutes(Request $request): int
    {
        if ($request->is('login')) {
            return 15; // 15 minutes for login attempts
        }
        
        return 1; // 1 minute for other requests
    }

    /**
     * Validate request integrity
     */
    private function validateRequestIntegrity(Request $request): bool
    {
        // Check for suspicious patterns
        $suspiciousPatterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/javascript:/i',
            '/on\w+\s*=/i',
        ];

        $input = $request->all();
        
        foreach ($suspiciousPatterns as $pattern) {
            if ($this->arrayContainsPattern($input, $pattern)) {
                return false;
            }
        }

        // Validate content length
        if ($request->header('content-length') > 10485760) { // 10MB
            return false;
        }

        // Validate user agent
        if (!$request->userAgent() || strlen($request->userAgent()) < 10) {
            return false;
        }

        return true;
    }

    /**
     * Check if array contains pattern
     */
    private function arrayContainsPattern($array, $pattern): bool
    {
        foreach ($array as $value) {
            if (is_array($value)) {
                if ($this->arrayContainsPattern($value, $pattern)) {
                    return true;
                }
            } elseif (is_string($value) && preg_match($pattern, $value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Log security event
     */
    private function logSecurityEvent(Request $request): void
    {
        $events = [
            'login_attempt' => $request->is('login'),
            'registration_attempt' => $request->is('register'),
            'investment_request' => $this->isInvestmentRequest($request),
            'team_request' => $this->isTeamRequest($request),
            'admin_access' => $request->is('admin/*'),
            'api_access' => $request->is('api/*'),
        ];

        foreach ($events as $event => $condition) {
            if ($condition) {
                AuditLog::log($event, [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);
                break;
            }
        }
    }

    /**
     * Maintenance response
     */
    private function maintenanceResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'System is currently under maintenance. Please try again later.',
                'status' => 'maintenance'
            ], 503);
        }

        return response()->view('errors.maintenance', [], 503);
    }

    /**
     * Registration disabled response
     */
    private function registrationDisabledResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'New registrations are currently disabled.',
                'status' => 'registration_disabled'
            ], 403);
        }

        return redirect()->back()
            ->with('error', 'New registrations are currently disabled.');
    }

    /**
     * Investment disabled response
     */
    private function investmentDisabledResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'New investments are currently disabled.',
                'status' => 'investment_disabled'
            ], 403);
        }

        return redirect()->back()
            ->with('error', 'New investments are currently disabled.');
    }

    /**
     * Team disabled response
     */
    private function teamDisabledResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'New teams are currently disabled.',
                'status' => 'team_disabled'
            ], 403);
        }

        return redirect()->back()
            ->with('error', 'New teams are currently disabled.');
    }

    /**
     * Invalid session response
     */
    private function invalidSessionResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your session has expired. Please login again.',
                'status' => 'session_expired'
            ], 401);
        }

        return redirect()->route('login')
            ->with('error', 'Your session has expired. Please login again.');
    }

    /**
     * Rate limit response
     */
    private function rateLimitResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Too many requests. Please try again later.',
                'status' => 'rate_limited'
            ], 429);
        }

        return redirect()->back()
            ->with('error', 'Too many requests. Please try again later.');
    }

    /**
     * Invalid request response
     */
    private function invalidRequestResponse(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Invalid request detected.',
                'status' => 'invalid_request'
            ], 400);
        }

        return redirect()->back()
            ->with('error', 'Invalid request detected.');
    }
}
