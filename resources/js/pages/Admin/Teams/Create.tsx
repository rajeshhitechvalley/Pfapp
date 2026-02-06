import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft,
    Building,
    Save,
    Users,
    Shield,
    X
} from 'lucide-react';

interface AdminTeamCreateProps {
    availableUsers?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}

export default function AdminTeamCreate({ availableUsers = [] }: AdminTeamCreateProps) {
    // Static list of available users if not provided from server
    const users = availableUsers.length > 0 ? availableUsers : [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: 2, name: 'John Investor', email: 'john@example.com', role: 'investor' },
        { id: 3, name: 'Jane Investor', email: 'jane@example.com', role: 'investor' },
        { id: 4, name: 'Michael Investor', email: 'michael.investor@example.com', role: 'investor' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        team_name: '',
        description: '',
        team_leader_id: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/teams/store', {
            onSuccess: () => {
                router.visit('/admin/teams');
            },
            onError: (errors) => {
                console.error('Create failed:', errors);
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Create New Team" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/admin/teams"
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Teams
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
                            <p className="text-gray-600 mt-1">Create a new team and assign a team leader</p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    id="team_name"
                                    value={data.team_name}
                                    onChange={(e) => setData('team_name', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter team name"
                                    required
                                />
                                {errors.team_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.team_name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="team_leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Leader
                                </label>
                                <select
                                    id="team_leader_id"
                                    value={data.team_leader_id}
                                    onChange={(e) => setData('team_leader_id', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Team Leader</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.team_leader_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.team_leader_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter team description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Link
                                href="/admin/teams"
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Creating...' : 'Create Team'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <Shield className="h-6 w-6 text-blue-600 mt-1" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Team Creation Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Choose a unique and descriptive team name</li>
                                    <li>Select a team leader who will manage the team</li>
                                    <li>Set the appropriate status for the team</li>
                                    <li>Provide a clear description of the team's purpose</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
