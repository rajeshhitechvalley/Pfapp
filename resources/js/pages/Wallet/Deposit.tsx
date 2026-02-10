import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    CreditCard, 
    Wallet,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface DepositProps {
    wallet?: {
        balance: number;
        total_deposits: number;
        total_withdrawals: number;
    };
    paymentMethods?: any[];
}

export default function Deposit({ wallet, paymentMethods }: DepositProps) {
    const [formData, setFormData] = useState({
        amount: '',
        payment_method_id: '',
        notes: ''
    });
    const [errors, setErrors] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        
        router.post('/wallet/deposit', formData, {
            onSuccess: () => {
                router.visit('/wallet');
            },
            onError: (errors) => {
                setErrors(errors);
                setIsProcessing(false);
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const { name, value } = target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <AppLayout>
            <Head title="Deposit Funds" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        {/* Header */}
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center">
                                <Link 
                                    href="/wallet"
                                    className="mr-4 text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Deposit Funds</h1>
                                    <p className="mt-2 text-gray-600">Add money to your wallet</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Current Balance */}
                            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                                <div className="flex items-center">
                                    <Wallet className="h-12 w-12 text-blue-600" />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Current Balance</h3>
                                        <p className="text-3xl font-bold text-blue-600">
                                            ${wallet?.balance?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Deposit Form */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deposit Amount ($) *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                                min="500"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        {errors.amount && (
                                            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <select
                                            name="payment_method_id"
                                            value={formData.payment_method_id}
                                            onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLSelectElement>)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select payment method</option>
                                            {paymentMethods?.map((method: any) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name} - {method.type}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.payment_method_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.payment_method_id}</p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Any additional information about this deposit..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-2 border-white mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Deposit Funds
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Information */}
                            <div className="mt-6 bg-gray-50 rounded-lg p-6">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-gray-900">Deposit Information</h4>
                                        <ul className="mt-2 text-sm text-gray-600 space-y-1">
                                            <li>• Minimum deposit amount: $500.00</li>
                                            <li>• Processing time: 1-3 business days</li>
                                            <li>• All deposits are subject to verification</li>
                                            <li>• Contact support for issues with deposits</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
