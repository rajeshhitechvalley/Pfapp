<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

// User Dashboard Routes
Route::prefix('user-dashboard')->name('dashboard.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('index');
    Route::get('/stats', [DashboardController::class, 'getStats'])->name('stats');
    Route::get('/projects', [DashboardController::class, 'getProjects'])->name('projects');
    Route::get('/plots', [DashboardController::class, 'getPlots'])->name('plots');
    Route::post('/compare-plots', [DashboardController::class, 'comparePlots'])->name('compare-plots');
    Route::post('/preferences', [DashboardController::class, 'updatePreferences'])->name('preferences.update');
});

// Admin Routes - Admin only access
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/users/{id}', [AdminController::class, 'showUser'])->name('users.show');
    Route::get('/users/{id}/edit', [AdminController::class, 'editUser'])->name('users.edit');
    Route::post('/users/store', [AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{id}/update', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{id}', [AdminController::class, 'destroyUser'])->name('users.destroy');
    Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
    Route::patch('/users/{id}/verify', [AdminController::class, 'verifyUser'])->name('users.verify');
    Route::get('/users/search', [AdminController::class, 'searchUsers'])->name('users.search');
    Route::get('/teams', [AdminController::class, 'teams'])->name('teams');
    Route::get('/teams/create', [AdminController::class, 'createTeam'])->name('teams.create');
    Route::get('/teams/{id}', [AdminController::class, 'showTeam'])->name('teams.show');
    Route::get('/teams/{id}/edit', [AdminController::class, 'editTeam'])->name('teams.edit');
    Route::post('/teams/store', [AdminController::class, 'storeTeam'])->name('teams.store');
    Route::put('/teams/{id}/update', [AdminController::class, 'updateTeam'])->name('teams.update');
    Route::post('/teams/{id}/add-member', [AdminController::class, 'addTeamMember'])->name('teams.add-member');
    Route::get('/teams/{id}/add-members', [AdminController::class, 'addTeamMembers'])->name('teams.add-members');
    Route::post('/teams/{id}/add-members', [AdminController::class, 'addTeamMembers'])->name('teams.add-members.post');
    Route::post('/teams/{id}/remove-member', [AdminController::class, 'removeTeamMember'])->name('teams.remove-member');
    Route::post('/teams/{id}/toggle-member-status', [AdminController::class, 'toggleMemberStatus'])->name('teams.toggle-member-status');
    Route::delete('/teams/{id}', [AdminController::class, 'destroyTeam'])->name('teams.destroy');
    Route::get('/investments', [AdminController::class, 'investments'])->name('investments');
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions');
    Route::get('/transactions/create', [AdminController::class, 'createTransaction'])->name('transactions.create');
    Route::post('/transactions/store', [AdminController::class, 'storeTransaction'])->name('transactions.store');
    Route::get('/transactions/{id}', [AdminController::class, 'showTransaction'])->name('transactions.show');
    Route::get('/transactions/{id}/edit', [AdminController::class, 'editTransaction'])->name('transactions.edit');
    Route::put('/transactions/{id}/update', [AdminController::class, 'updateTransaction'])->name('transactions.update');
    Route::delete('/transactions/{id}', [AdminController::class, 'destroyTransaction'])->name('transactions.destroy');
    Route::get('/sales', [AdminController::class, 'sales'])->name('sales');
    Route::get('/profits', [AdminController::class, 'profits'])->name('profits');
    Route::get('/properties', [AdminController::class, 'properties'])->name('properties');
    Route::get('/properties/create', [AdminController::class, 'createProperty'])->name('properties.create');
    Route::post('/properties/store', [AdminController::class, 'storeProperty'])->name('properties.store');
    Route::get('/properties/{id}', [AdminController::class, 'showProperty'])->name('properties.show');
    Route::get('/properties/{id}/edit', [AdminController::class, 'editProperty'])->name('properties.edit');
    Route::put('/properties/{id}/update', [AdminController::class, 'updateProperty'])->name('properties.update');
    Route::delete('/properties/{id}', [AdminController::class, 'destroyProperty'])->name('properties.destroy');
    Route::get('/plots', [AdminController::class, 'plots'])->name('plots');
    Route::get('/reports', [AdminController::class, 'reports'])->name('reports');
    Route::get('/audit', [AdminController::class, 'audit'])->name('audit');
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::get('/security', [AdminController::class, 'security'])->name('security');
    Route::get('/wallets', [AdminController::class, 'wallets'])->name('wallets');
    Route::get('/wallets/create', [AdminController::class, 'createWallet'])->name('wallets.create');
    Route::post('/wallets/store', [AdminController::class, 'storeWallet'])->name('wallets.store');
    Route::get('/wallets/{id}', [AdminController::class, 'showWallet'])->name('wallets.show');
    Route::get('/wallets/{id}/edit', [AdminController::class, 'editWallet'])->name('wallets.edit');
    Route::put('/wallets/{id}/update', [AdminController::class, 'updateWallet'])->name('wallets.update');
    Route::delete('/wallets/{id}', [AdminController::class, 'destroyWallet'])->name('wallets.destroy');
});

// User Management Routes
Route::prefix('users')->name('users.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{id}', [UserController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [UserController::class, 'edit'])->name('edit');
    Route::put('/{id}', [UserController::class, 'update'])->name('update');
    Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/activate', [UserController::class, 'activateUser'])->name('activate');
    Route::put('/{id}/kyc', [UserController::class, 'updateKyc'])->name('kyc.update');
    Route::post('/{id}/kyc-documents', [UserController::class, 'uploadKycDocument'])->name('kyc.upload');
    Route::put('/kyc-documents/{documentId}', [UserController::class, 'verifyKycDocument'])->name('kyc.verify');
    Route::delete('/kyc-documents/{documentId}', [UserController::class, 'deleteKycDocument'])->name('kyc.delete');
    Route::post('/{id}/pay-registration-fee', [UserController::class, 'payRegistrationFee'])->name('payment.registration_fee');
});

// Team Management Routes
Route::prefix('teams')->name('teams.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [TeamController::class, 'index'])->name('index');
    Route::get('/create', [TeamController::class, 'create'])->name('create');
    Route::post('/', [TeamController::class, 'store'])->name('store');
    Route::get('/{id}', [TeamController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [TeamController::class, 'edit'])->name('edit');
    Route::put('/{id}', [TeamController::class, 'update'])->name('update');
    Route::delete('/{id}', [TeamController::class, 'destroy'])->name('destroy');
    Route::post('/{teamId}/members', [TeamController::class, 'addMember'])->name('members.add');
    Route::delete('/{teamId}/members/{userId}', [TeamController::class, 'removeMember'])->name('members.remove');
    Route::post('/{id}/activate', [TeamController::class, 'activateTeam'])->name('activate');
});

// Wallet & Payment Management Routes
Route::prefix('wallet')->name('wallet.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [WalletController::class, 'index'])->name('index');
    Route::get('/summary', [WalletController::class, 'getWalletSummary'])->name('summary');
    Route::get('/history', [WalletController::class, 'getTransactionHistory'])->name('history');
    Route::get('/export', [WalletController::class, 'exportTransactions'])->name('export');
    Route::get('/{id}', [WalletController::class, 'show'])->name('show');
    Route::post('/deposit', [WalletController::class, 'deposit'])->name('deposit');
    Route::post('/withdraw', [WalletController::class, 'withdraw'])->name('withdraw');
    Route::post('/registration-fee', [WalletController::class, 'payRegistrationFee'])->name('registration-fee');
    Route::post('/invest', [WalletController::class, 'investFromWallet'])->name('invest');
    Route::post('/credit-profit', [WalletController::class, 'creditProfit'])->name('credit-profit');
    Route::post('/auto-deposit', [WalletController::class, 'setAutoDeposit'])->name('auto-deposit');
    Route::get('/payment-methods', [WalletController::class, 'getPaymentMethods'])->name('payment-methods');
    Route::put('/transactions/{id}/approve', [WalletController::class, 'approveTransaction'])->name('transactions.approve');
    Route::put('/transactions/{id}/reject', [WalletController::class, 'rejectTransaction'])->name('transactions.reject');
});

// Payment Gateway Routes
Route::prefix('payment')->name('payment.')->middleware(['auth', 'verified'])->group(function () {
    Route::post('/order', [WalletController::class, 'createPaymentOrder'])->name('order');
    Route::post('/verify', [WalletController::class, 'verifyPayment'])->name('verify');
    Route::post('/webhook/{gateway}', [WalletController::class, 'processWebhook'])->name('webhook');
});

// Investment Management Routes
Route::prefix('investment')->name('investment.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [InvestmentController::class, 'index'])->name('index');
    Route::get('/create', [InvestmentController::class, 'create'])->name('create');
    Route::post('/', [InvestmentController::class, 'store'])->name('store');
    Route::get('/portfolio', [InvestmentController::class, 'portfolio'])->name('portfolio');
    Route::get('/{id}', [InvestmentController::class, 'show'])->name('show');
    Route::post('/{id}/reinvest', [InvestmentController::class, 'reinvest'])->name('reinvest');
    Route::put('/{id}/modify', [InvestmentController::class, 'modify'])->name('modify');
    Route::put('/{id}/cancel', [InvestmentController::class, 'cancel'])->name('cancel');
    Route::put('/{id}/approve', [InvestmentController::class, 'approveInvestment'])->name('approve');
    Route::get('/{id}/receipt', [InvestmentController::class, 'downloadReceipt'])->name('receipt');
    Route::get('/team/{teamId}', [InvestmentController::class, 'getTeamInvestments'])->name('team');
});

// User Investment Dashboard
Route::get('/investment/dashboard', function () {
    return Inertia::render('Investment/Dashboard');
})->middleware(['auth', 'verified'])->name('investment.dashboard');

// User Wallet Dashboard
Route::get('/wallet/dashboard', function () {
    return Inertia::render('Wallet/Dashboard');
})->middleware(['auth', 'verified'])->name('wallet.dashboard');

// Enhanced Authentication Routes
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');
});

// Password Reset Routes
Route::prefix('password-reset')->name('password-reset.')->group(function () {
    Route::post('/send-otp', [AuthController::class, 'sendPasswordResetOTP'])->name('send-otp');
    Route::post('/verify-otp', [AuthController::class, 'verifyPasswordResetOTP'])->name('verify-otp');
    Route::post('/reset', [AuthController::class, 'resetPassword'])->name('reset');
    Route::get('/form', function () {
        return Inertia::render('auth/password-reset');
    })->name('form');
});

// Profile Management Routes
Route::prefix('profile')->name('profile.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('profile');
    })->name('index');
    Route::post('/update', [AuthController::class, 'updateProfile'])->name('update');
    Route::post('/kyc/upload', [AuthController::class, 'uploadKycDocument'])->name('kyc.upload');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
});

// Team Management Routes
Route::prefix('teams')->name('teams.')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [TeamController::class, 'index'])->name('index');
    Route::post('/store', [TeamController::class, 'store'])->name('store');
    Route::get('/create', function () {
        return Inertia::render('Teams/Create');
    })->name('create');
    Route::get('/{id}', [TeamController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [TeamController::class, 'edit'])->name('edit');
    Route::put('/{id}/update', [TeamController::class, 'update'])->name('update');
    Route::delete('/{id}', [TeamController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/activate', [TeamController::class, 'activateTeam'])->name('activate');
    Route::post('/{id}/add-member', [TeamController::class, 'addMember'])->name('add-member');
    Route::delete('/{id}/remove-member/{userId}', [TeamController::class, 'removeMember'])->name('remove-member');
    Route::post('/invite', [TeamController::class, 'inviteMembers'])->name('invite');
    Route::get('/{id}/hierarchy', [TeamController::class, 'getTeamHierarchy'])->name('hierarchy');
    Route::get('/{id}/performance', [TeamController::class, 'getTeamPerformance'])->name('performance');
});

// User Team Dashboard
Route::get('/team/dashboard', function () {
    return Inertia::render('Teams/Dashboard');
})->middleware(['auth', 'verified'])->name('team.dashboard');

// API Routes for Team Management
Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/user/team', function () {
        $user = auth()->user();
        $team = $user->ledTeam ?? $user->team;
        
        if (!$team) {
            return response()->json(['success' => false, 'message' => 'No team found']);
        }
        
        $team->load(['teamLeader', 'teamMembers.user']);
        
        $stats = [
            'total_members' => $team->member_count,
            'active_members' => $team->teamMembers()->whereHas('user', function($query) {
                $query->where('status', 'active');
            })->count(),
            'inactive_members' => $team->teamMembers()->whereHas('user', function($query) {
                $query->where('status', 'inactive');
            })->count(),
            'total_investments' => $team->investments()->sum('amount'),
            'average_investment' => $team->investments()->avg('amount') ?? 0,
            'growth_rate' => 0, // Calculate based on last month
            'activation_progress' => ($team->member_count / 20) * 100,
        ];
        
        return response()->json(['success' => true, 'data' => ['team' => $team, 'stats' => $stats]]);
    })->name('api.user.team');
});

require __DIR__.'/settings.php';
