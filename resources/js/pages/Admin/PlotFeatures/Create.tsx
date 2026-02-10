import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { 
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    MapPin,
    Home,
    DollarSign,
    Ruler,
    Compass,
    Zap,
    Droplet,
    Flame,
    Wifi,
    Car
} from 'lucide-react';

interface CreatePlotFeaturesProps {
    properties: Array<{
        id: number;
        name: string;
        type: string;
        location: string;
    }>;
    plotTypes: string[];
    areaUnits: string[];
    facingDirections: Record<string, string>;
    statuses: string[];
}

export default function CreatePlotFeatures({ 
    properties, 
    plotTypes, 
    areaUnits, 
    facingDirections, 
    statuses 
}: CreatePlotFeaturesProps) {
    const { data, setData, post, processing, errors } = useForm({
        property_id: '',
        plot_number: '',
        area: '',
        area_unit: 'sqft',
        price: '',
        price_per_sqft: '',
        plot_type: 'residential',
        road_facing: false,
        status: 'available',
        description: '',
        features: [] as string[],
        dimensions: '',
        length: '',
        width: '',
        location_details: '',
        facing_direction: '',
        road_width: '',
        corner_plot: false,
        double_road: false,
        location_coordinates: '',
        nearby_amenities: [] as string[],
        soil_type: '',
        topography: '',
        legal_clearance: '',
        development_charges: '',
        maintenance_charges: '',
        water_connection: false,
        electricity_connection: false,
        sewage_connection: false,
        gas_connection: false,
        internet_connection: false,
        road_access: '',
        tags: [] as string[],
        priority_level: 1,
        featured_plot: false,
        original_price: '',
        discount_percentage: '',
        special_offer: false,
        offer_expiry_date: '',
        negotiable: false,
    });

    // Convert string values to numbers for proper form handling
    const handleNumberChange = (field: any, value: string) => {
        const numValue = value === '' ? '' : parseFloat(value);
        setData(field, isNaN(numValue) ? '' : numValue);
    };

    const [newFeature, setNewFeature] = useState('');
    const [newAmenity, setNewAmenity] = useState('');
    const [newTag, setNewTag] = useState('');

    const addFeature = () => {
        if (newFeature.trim() && !data.features.includes(newFeature.trim())) {
            setData('features', [...data.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const addAmenity = () => {
        if (newAmenity.trim() && !data.nearby_amenities.includes(newAmenity.trim())) {
            setData('nearby_amenities', [...data.nearby_amenities, newAmenity.trim()]);
            setNewAmenity('');
        }
    };

    const removeAmenity = (index: number) => {
        setData('nearby_amenities', data.nearby_amenities.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (index: number) => {
        setData('tags', data.tags.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Debug: Log form data before submission
        console.log('Form data being submitted:', data);
        console.log('Property ID value:', data.property_id);
        
        // Ensure property_id is not empty
        if (!data.property_id) {
            alert('Please select a property');
            return;
        }
        
        // Ensure arrays are properly formatted for submission
        const submissionData = {
            ...data,
            features: data.features && data.features.length > 0 ? data.features : [],
            nearby_amenities: data.nearby_amenities && data.nearby_amenities.length > 0 ? data.nearby_amenities : [],
            tags: data.tags && data.tags.length > 0 ? data.tags : [],
        };
        
        console.log('Cleaned submission data:', submissionData);
        
        post('/admin/plots/features/store', submissionData);
    };

    return (
        <AdminLayout>
            <Head title="Create Plot Feature" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/plots/features"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plots
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Plot</h1>
                        <p className="text-gray-600">Add a new plot with detailed features</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Basic Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Property Project *
                                </label>
                                <select
                                    value={data.property_id}
                                    onChange={(e) => setData('property_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                >
                                    <option value="" className="text-gray-900">Select Property</option>
                                    {properties.map((property) => (
                                        <option key={property.id} value={property.id} className="text-gray-900">
                                            {property.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.property_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.property_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2"> 
                                    Plot Number *
                                </label>
                                <input
                                    type="text"
                                    value={data.plot_number}
                                    onChange={(e) => setData('plot_number', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="e.g., A-101"
                                />
                                {errors.plot_number && (
                                    <p className="mt-1 text-sm text-red-600">{errors.plot_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Area *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.area}
                                        onChange={(e) => handleNumberChange('area', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="1000"
                                    />
                                    <select
                                        value={data.area_unit}
                                        onChange={(e) => setData('area_unit', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        {areaUnits.map((unit) => (
                                            <option key={unit} value={unit} className="text-gray-900">
                                                {unit.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.area && (
                                    <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Price *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => handleNumberChange('price', e.target.value)}
                                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-gray-900"
                                        placeholder="1000000"
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Plot Type *
                                </label>
                                <select
                                    value={data.plot_type}
                                    onChange={(e) => setData('plot_type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                >
                                    {plotTypes.map((type) => (
                                        <option key={type} value={type} className="text-gray-900">
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.plot_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.plot_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status} className="text-gray-900">
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="Describe the plot features, location benefits, etc."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Location & Dimensions */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location & Dimensions
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Facing Direction
                                </label>
                                <select
                                    value={data.facing_direction}
                                    onChange={(e) => setData('facing_direction', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                >
                                    <option value="" className="text-gray-900">Select Direction</option>
                                    {Object.entries(facingDirections).map(([code, name]) => (
                                        <option key={code} value={code} className="text-gray-900">
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Road Width (feet)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.road_width}
                                    onChange={(e) => handleNumberChange('road_width', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Length
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.length}
                                    onChange={(e) => handleNumberChange('length', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Width
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.width}
                                    onChange={(e) => handleNumberChange('width', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="40"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.road_facing}
                                    onChange={(e) => setData('road_facing', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Road Facing</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.corner_plot}
                                    onChange={(e) => setData('corner_plot', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Corner Plot</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.double_road}
                                    onChange={(e) => setData('double_road', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Double Road</span>
                            </label>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Location Details
                            </label>
                            <textarea
                                value={data.location_details}
                                onChange={(e) => setData('location_details', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="Specific location details, landmarks, etc."
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                GPS Coordinates
                            </label>
                            <input
                                type="text"
                                value={data.location_coordinates}
                                onChange={(e) => setData('location_coordinates', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="28.6139, 77.2090"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Features & Amenities
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Plot Features
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Add feature (e.g., Garden, Parking, etc.)"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {feature}
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Nearby Amenities
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Add amenity (e.g., School, Hospital, etc.)"
                                    />
                                    <button
                                        type="button"
                                        onClick={addAmenity}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.nearby_amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {amenity}
                                            <button
                                                type="button"
                                                onClick={() => removeAmenity(index)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Utilities */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Utilities & Connections
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.water_connection}
                                    onChange={(e) => setData('water_connection', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Droplet className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-900">Water Connection</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.electricity_connection}
                                    onChange={(e) => setData('electricity_connection', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Zap className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-gray-900">Electricity</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.sewage_connection}
                                    onChange={(e) => setData('sewage_connection', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Sewage Connection</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.gas_connection}
                                    onChange={(e) => setData('gas_connection', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Flame className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-gray-900">Gas Connection</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.internet_connection}
                                    onChange={(e) => setData('internet_connection', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Wifi className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-gray-900">Internet</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.road_facing}
                                    onChange={(e) => setData('road_facing', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Car className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Road Access</span>
                            </label>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Pricing & Offers
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Original Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.original_price}
                                    onChange={(e) => handleNumberChange('original_price', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="1200000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Discount Percentage
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    max="100"
                                    value={data.discount_percentage}
                                    onChange={(e) => handleNumberChange('discount_percentage', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Development Charges
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.development_charges}
                                    onChange={(e) => handleNumberChange('development_charges', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="50000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Maintenance Charges
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.maintenance_charges}
                                    onChange={(e) => handleNumberChange('maintenance_charges', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.special_offer}
                                    onChange={(e) => setData('special_offer', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Special Offer</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.negotiable}
                                    onChange={(e) => setData('negotiable', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Negotiable</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.featured_plot}
                                    onChange={(e) => setData('featured_plot', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900">Featured Plot</span>
                            </label>
                        </div>

                        {data.special_offer && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Offer Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={data.offer_expiry_date}
                                    onChange={(e) => setData('offer_expiry_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href="/admin/plots/features"
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Creating...' : 'Create Plot'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
