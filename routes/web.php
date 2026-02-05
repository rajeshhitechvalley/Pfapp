<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Admin Routes - Admin only access
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::post('/users/store', [AdminController::class, 'storeUser'])->name('users.store');
    Route::put('/users/{id}/update', [AdminController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{id}', [AdminController::class, 'destroyUser'])->name('users.destroy');
    Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('users.toggle-status');
    Route::patch('/users/{id}/verify', [AdminController::class, 'verifyUser'])->name('users.verify');
    Route::get('/users/search', [AdminController::class, 'searchUsers'])->name('users.search');
    Route::get('/teams', [AdminController::class, 'teams'])->name('teams');
    Route::post('/teams/store', [AdminController::class, 'storeTeam'])->name('teams.store');
    Route::put('/teams/{id}/update', [AdminController::class, 'updateTeam'])->name('teams.update');
    Route::post('/teams/{id}/add-member', [AdminController::class, 'addTeamMember'])->name('teams.add-member');
    Route::post('/teams/{id}/add-members', [AdminController::class, 'addTeamMembers'])->name('teams.add-members');
    Route::delete('/teams/{id}', [AdminController::class, 'destroyTeam'])->name('teams.destroy');
    Route::get('/investments', [AdminController::class, 'investments'])->name('investments');
    Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions');
    Route::get('/sales', [AdminController::class, 'sales'])->name('sales');
    Route::get('/profits', [AdminController::class, 'profits'])->name('profits');
    Route::get('/properties', [AdminController::class, 'properties'])->name('properties');
    Route::get('/plots', [AdminController::class, 'plots'])->name('plots');
    Route::get('/reports', [AdminController::class, 'reports'])->name('reports');
    Route::get('/audit', [AdminController::class, 'audit'])->name('audit');
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::get('/security', [AdminController::class, 'security'])->name('security');
    Route::get('/wallets', [AdminController::class, 'wallets'])->name('wallets');
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
    Route::get('/{id}', [WalletController::class, 'show'])->name('show');
    Route::post('/deposit', [WalletController::class, 'deposit'])->name('deposit');
    Route::post('/withdraw', [WalletController::class, 'withdraw'])->name('withdraw');
    Route::put('/transactions/{transactionId}/approve', [WalletController::class, 'approveTransaction'])->name('transactions.approve');
    Route::put('/transactions/{transactionId}/reject', [WalletController::class, 'rejectTransaction'])->name('transactions.reject');
});

require __DIR__.'/settings.php';
