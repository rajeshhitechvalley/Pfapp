import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { useState } from 'react';
import { X, CheckCircle, Lock } from 'lucide-react';

export default function Register() {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [registrationData, setRegistrationData] = useState({});

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation', 'phone', 'address', 'pan_number']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Mobile Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    tabIndex={3}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="Enter 10-digit mobile number"
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        e.target.value = value;
                                    }}
                                />
                                <InputError
                                    message={errors.phone}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Min 8 characters with uppercase, lowercase, number"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password *
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm your password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address *</Label>
                                <textarea
                                    id="address"
                                    required
                                    tabIndex={6}
                                    autoComplete="street-address"
                                    name="address"
                                    placeholder="Enter your complete address"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <InputError
                                    message={errors.address}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pan_number">PAN Number (Optional)</Label>
                                <Input
                                    id="pan_number"
                                    type="text"
                                    tabIndex={7}
                                    autoComplete="off"
                                    name="pan_number"
                                    placeholder="Enter PAN number (e.g., ABCDE1234F)"
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                        e.target.value = value;
                                    }}
                                />
                                <InputError
                                    message={errors.pan_number}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8}>
                                Log in
                            </TextLink>
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={9}
                            data-test="register-user-button"
                            onClick={() => {
                                // Show payment modal before submission
                                setShowPaymentModal(true);
                            }}
                        >
                            {processing && <Spinner />}
                            Create Account
                        </Button>
                    </>
                )}
            </Form>

            {/* Registration Fee Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-lg">💳</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Registration Fee</h3>
                                    <p className="text-sm text-gray-500">Complete your registration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Payment Amount */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="text-center">
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    ₹500
                                </div>
                                <p className="text-sm text-gray-600">One-time registration fee</p>
                                <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Secure payment powered by Razorpay</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Choose Payment Method</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex flex-col items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 transform hover:scale-105">
                                        <div className="text-2xl mb-2">📱</div>
                                        <span className="text-sm font-medium text-blue-700">UPI</span>
                                        <span className="text-xs text-blue-600 mt-1">GPay, PhonePe</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105">
                                        <div className="text-2xl mb-2">🏦</div>
                                        <span className="text-sm font-medium text-gray-700">Net Banking</span>
                                        <span className="text-xs text-gray-500 mt-1">All banks</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105">
                                        <div className="text-2xl mb-2">💳</div>
                                        <span className="text-sm font-medium text-gray-700">Card</span>
                                        <span className="text-xs text-gray-500 mt-1">Credit/Debit</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 transform hover:scale-105">
                                        <div className="text-2xl mb-2">👛</div>
                                        <span className="text-sm font-medium text-gray-700">Wallet</span>
                                        <span className="text-xs text-gray-500 mt-1">Paytm, etc.</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Process payment logic here
                                        console.log('Processing registration fee payment...');
                                        setShowPaymentModal(false);
                                        // Submit form after payment
                                        formik.handleSubmit();
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium transform hover:scale-105 shadow-lg"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Lock className="h-4 w-4" />
                                        <span>Pay ₹500</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
