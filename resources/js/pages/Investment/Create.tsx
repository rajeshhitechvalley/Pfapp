import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { 
    Building, 
    DollarSign, 
    Target, 
    Calendar,
    AlertCircle,
    Plus,
    Minus,
    Info
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    location: string;
    type: string;
    expected_roi: number;
    total_plots: number;
    available_plots: number;
    price_per_plot: number;
    status: string;
}

interface Plot {
    id: number;
    property_id: number;
    plot_number: string;
    area: number;
    area_unit: string;
    price: number;
    price_per_sqft: number;
    status: string;
    property?: Project;
}

interface CreateInvestmentProps {
    projects: Project[];
    plots: Plot[];
    user_wallet_balance: number;
    team_value: number;
    min_investment: number;
}

export default function CreateInvestment({ 
    projects, 
    plots, 
    user_wallet_balance, 
    team_value, 
    min_investment 
}: CreateInvestmentProps) {
    const [formData, setFormData] = useState({
        amount: min_investment,
        investment_type: 'project',
        property_project_id: '',
        plot_ids: [] as number[],
        plot_allocations: {} as Record<number, number>,
        notes: '',
        auto_reinvest: false,
        reinvest_percentage: 100
    });

    const [selectedPlots, setSelectedPlots] = useState<Plot[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/investment', formData);
    };

    const handlePlotSelection = (plot: Plot) => {
        const isSelected = selectedPlots.find(p => p.id === plot.id);
        
        if (isSelected) {
            setSelectedPlots(selectedPlots.filter(p => p.id !== plot.id));
            const newAllocations = { ...formData.plot_allocations };
            delete newAllocations[plot.id];
            setFormData({
                ...formData,
                plot_ids: formData.plot_ids.filter(id => id !== plot.id),
                plot_allocations: newAllocations
            });
        } else {
            setSelectedPlots([...selectedPlots, plot]);
            setFormData({
                ...formData,
                plot_ids: [...formData.plot_ids, plot.id],
                plot_allocations: {
                    ...formData.plot_allocations,
                    [plot.id]: 0
                }
            });
        }
    };

    const updatePlotAllocation = (plotId: number, amount: number) => {
        setFormData({
            ...formData,
            plot_allocations: {
                ...formData.plot_allocations,
                [plotId]: amount
            }
        });
    };

    const getTotalPlotAllocations = () => {
        return Object.values(formData.plot_allocations).reduce((sum, amount) => sum + amount, 0);
    };

    return (
        <AppLayout>
            <Head title="Create Investment" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Create Investment</h1>
                                    <p className="mt-2 text-gray-600">Start your investment journey</p>
                                </div>
                                <Link 
                                    href="/investment"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Wallet Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Available Balance</p>
                                        <p className="text-lg font-bold text-blue-900">${user_wallet_balance.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Investment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Investment Type
                                    </label>
                                    <select
                                        value={formData.investment_type}
                                        onChange={(e) => setFormData({...formData, investment_type: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="project">Property Project</option>
                                        <option value="plot">Plot Investment</option>
                                        <option value="mixed">Mixed Investment</option>
                                    </select>
                                </div>

                                {/* Investment Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Investment Amount (Min: ${min_investment})
                                    </label>
                                    <input
                                        type="number"
                                        min={min_investment}
                                        max={user_wallet_balance}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Project Selection */}
                                {(formData.investment_type === 'project' || formData.investment_type === 'mixed') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Project
                                        </label>
                                        <select
                                            value={formData.property_project_id}
                                            onChange={(e) => setFormData({...formData, property_project_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Choose a project</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name} - {project.location} ({project.expected_roi}% return)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Plot Selection */}
                                {(formData.investment_type === 'plot' || formData.investment_type === 'mixed') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Plots
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {plots.map(plot => (
                                                <div
                                                    key={plot.id}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                        selectedPlots.find(p => p.id === plot.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                    onClick={() => handlePlotSelection(plot)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{plot.plot_number}</p>
                                                            <p className="text-sm text-gray-600">{plot.area} {plot.area_unit}</p>
                                                            <p className="text-sm font-medium">${plot.price.toLocaleString()}</p>
                                                        </div>
                                                        <Target className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Plot Allocations */}
                                        {selectedPlots.length > 0 && (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Plot Allocations (Total: ${getTotalPlotAllocations().toLocaleString()})
                                                </label>
                                                {selectedPlots.map(plot => (
                                                    <div key={plot.id} className="flex items-center space-x-3">
                                                        <span className="text-sm font-medium w-24">{plot.plot_number}</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={formData.amount}
                                                            value={formData.plot_allocations[plot.id] || 0}
                                                            onChange={(e) => updatePlotAllocation(plot.id, Number(e.target.value))}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                                {getTotalPlotAllocations() !== formData.amount && (
                                                    <p className="text-sm text-red-600">
                                                        Allocations must sum to ${formData.amount.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Any additional notes about your investment..."
                                    />
                                </div>

                                {/* Auto Reinvest */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="auto_reinvest"
                                        checked={formData.auto_reinvest}
                                        onChange={(e) => setFormData({...formData, auto_reinvest: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="auto_reinvest" className="ml-2 block text-sm text-gray-900">
                                        Auto-reinvest returns
                                    </label>
                                </div>

                                {formData.auto_reinvest && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reinvest Percentage
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.reinvest_percentage}
                                            onChange={(e) => setFormData({...formData, reinvest_percentage: Number(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Investment
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
