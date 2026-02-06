import { Head } from '@inertiajs/react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { useState } from 'react';

export default function PasswordReset() {
    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    const sendOTP = (e: React.FormEvent) => {
        e.preventDefault();
        post('/password-reset/send-otp', {
            onSuccess: () => {
                setEmail(data.email);
                setStep('otp');
                setOtpSent(true);
            }
        });
    };

    const verifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        post('/password-reset/verify-otp', {
            onSuccess: () => {
                setStep('reset');
            }
        });
    };

    const resetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        post('/password-reset/reset', {
            onSuccess: () => {
                router.visit(login());
            }
        });
    };

    return (
        <AuthLayout 
            title="Reset Password" 
            description="Reset your password using OTP verification"
        >
            <Head title="Password Reset" />
            
            {step === 'email' && (
                <form onSubmit={sendOTP} className="flex flex-col gap-6">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Forgot your password?</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Enter your email address"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <Spinner />}
                        Send OTP
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <TextLink href="/login">
                            Back to login
                        </TextLink>
                    </div>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={verifyOTP} className="flex flex-col gap-6">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Enter OTP</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            We've sent an OTP to {email}
                        </p>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="otp">One-Time Password</Label>
                        <Input
                            id="otp"
                            type="text"
                            required
                            autoFocus
                            maxLength={6}
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value)}
                            placeholder="Enter 6-digit OTP"
                        />
                        <InputError message={errors.otp} />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <Spinner />}
                        Verify OTP
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Change email address
                        </button>
                    </div>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={resetPassword} className="flex flex-col gap-6">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Set New Password</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Enter your new password below
                        </p>
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoFocus
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter new password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm new password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <Spinner />}
                        Reset Password
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        <TextLink href="/login">
                            Back to login
                        </TextLink>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
