import { Head } from '@inertiajs/react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { User, Camera, Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Profile() {
    const [activeTab, setActiveTab] = useState<'personal' | 'kyc' | 'security'>('personal');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        pan_number: '',
        aadhar_number: '',
        occupation: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        photo: null as File | null,
    });

    const { data: kycData, setData: setKycData, post: postKyc, processing: kycProcessing, errors: kycErrors } = useForm({
        document_type: '',
        document_file: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/update', {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    const uploadKyc = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kyc/upload', {
            onSuccess: () => {
                router.reload();
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Profile" />
            
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Profile Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                {photoPreview ? (
                                    <img 
                                        src={photoPreview} 
                                        alt="Profile" 
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-10 w-10 text-gray-400" />
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
                                    <Camera className="h-4 w-4 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600">Manage your personal information and documents</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'personal'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Personal Information
                            </button>
                            <button
                                onClick={() => setActiveTab('kyc')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'kyc'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                KYC Documents
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'security'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Security
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'personal' && (
                            <form onSubmit={updateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter your full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter your email"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Mobile Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter 10-digit mobile number"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div>
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                        />
                                        <InputError message={errors.date_of_birth} />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <textarea
                                            id="address"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Enter your complete address"
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    <div>
                                        <Label htmlFor="pan_number">PAN Number</Label>
                                        <Input
                                            id="pan_number"
                                            type="text"
                                            value={data.pan_number}
                                            onChange={(e) => setData('pan_number', e.target.value)}
                                            placeholder="Enter PAN number"
                                        />
                                        <InputError message={errors.pan_number} />
                                    </div>

                                    <div>
                                        <Label htmlFor="aadhar_number">Aadhar Number</Label>
                                        <Input
                                            id="aadhar_number"
                                            type="text"
                                            value={data.aadhar_number}
                                            onChange={(e) => setData('aadhar_number', e.target.value)}
                                            placeholder="Enter Aadhar number"
                                        />
                                        <InputError message={errors.aadhar_number} />
                                    </div>

                                    <div>
                                        <Label htmlFor="occupation">Occupation</Label>
                                        <Input
                                            id="occupation"
                                            type="text"
                                            value={data.occupation}
                                            onChange={(e) => setData('occupation', e.target.value)}
                                            placeholder="Enter your occupation"
                                        />
                                        <InputError message={errors.occupation} />
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_name">Bank Name</Label>
                                        <Input
                                            id="bank_name"
                                            type="text"
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            placeholder="Enter bank name"
                                        />
                                        <InputError message={errors.bank_name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_account_number">Account Number</Label>
                                        <Input
                                            id="bank_account_number"
                                            type="text"
                                            value={data.bank_account_number}
                                            onChange={(e) => setData('bank_account_number', e.target.value)}
                                            placeholder="Enter account number"
                                        />
                                        <InputError message={errors.bank_account_number} />
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_ifsc">IFSC Code</Label>
                                        <Input
                                            id="bank_ifsc"
                                            type="text"
                                            value={data.bank_ifsc}
                                            onChange={(e) => setData('bank_ifsc', e.target.value)}
                                            placeholder="Enter IFSC code"
                                        />
                                        <InputError message={errors.bank_ifsc} />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Update Profile
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'kyc' && (
                            <div className="space-y-6">
                                <form onSubmit={uploadKyc} className="space-y-4">
                                    <div>
                                        <Label htmlFor="document_type">Document Type</Label>
                                        <select
                                            id="document_type"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={kycData.document_type}
                                            onChange={(e) => setKycData('document_type', e.target.value)}
                                        >
                                            <option value="">Select document type</option>
                                            <option value="aadhar">Aadhar Card</option>
                                            <option value="pan">PAN Card</option>
                                            <option value="driving_license">Driving License</option>
                                            <option value="passport">Passport</option>
                                        </select>
                                        <InputError message={kycErrors.document_type} />
                                    </div>

                                    <div>
                                        <Label htmlFor="document_file">Upload Document</Label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Click to upload or drag and drop
                                                    </span>
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        PNG, JPG, PDF up to 10MB
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) => setKycData('document_file', e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <InputError message={kycErrors.document_file} />
                                    </div>

                                    <Button type="submit" disabled={kycProcessing}>
                                        {kycProcessing && <Spinner />}
                                        Upload Document
                                    </Button>
                                </form>

                                {/* KYC Status */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">KYC Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Aadhar Card</p>
                                                    <p className="text-sm text-gray-500">Under verification</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                PENDING
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                    <form className="space-y-4">
                                        <div>
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="new_password">New Password</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <Button type="submit">
                                            Change Password
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
