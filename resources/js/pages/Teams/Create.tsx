import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { 
    ArrowLeft,
    Save,
    X
} from 'lucide-react';

interface CreateTeamProps {
    availableUsers?: any[];
    currentUser?: any;
}

export default function CreateTeam({ availableUsers, currentUser }: CreateTeamProps) {
    const [formData, setFormData] = useState({
        team_name: '',
        description: ''
    });

    const [errors, setErrors] = useState<any>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/teams', formData, {
            onError: (errors) => setErrors(errors),
            onSuccess: () => {
                router.visit('/teams');
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const { name, value } = target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <AppLayout>
            <Head title="Create Team" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Link 
                                        href="/teams"
                                        className="mr-4 text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
                                        <p className="mt-2 text-gray-600">Build your investment team</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Team Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Team Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="team_name"
                                            value={formData.team_name}
                                            onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.team_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.team_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe your team's goals and objectives..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4">
                                    <Link 
                                        href="/teams"
                                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
