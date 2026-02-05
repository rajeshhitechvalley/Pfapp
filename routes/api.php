<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{id}', [UserController::class, 'show'])->name('show');
    Route::put('/{id}', [UserController::class, 'update'])->name('update');
    Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
    Route::post('/{id}/activate', [UserController::class, 'activateUser'])->name('activate');
    Route::put('/{id}/kyc', [UserController::class, 'updateKyc'])->name('kyc.update');
});

Route::prefix('teams')->name('teams.')->group(function () {
    Route::get('/', [TeamController::class, 'index'])->name('index');
    Route::post('/', [TeamController::class, 'store'])->name('store');
    Route::get('/{id}', [TeamController::class, 'show'])->name('show');
    Route::post('/{teamId}/members', [TeamController::class, 'addMember'])->name('members.add');
    Route::delete('/{teamId}/members/{userId}', [TeamController::class, 'removeMember'])->name('members.remove');
    Route::post('/{id}/activate', [TeamController::class, 'activateTeam'])->name('activate');
});
