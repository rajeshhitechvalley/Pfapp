import { Head } from '@inertiajs/react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { useState } from 'react';

export default function Login() {
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [attempts, setAttempts] = useState(0);
    
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (attempts >= 4) {
            alert('Account locked due to too many failed attempts. Please try again later.');
            return;
        }
        
        post('/login', {
            onSuccess: () => {
                setAttempts(0);
            },
            onError: () => {
                setAttempts(attempts + 1);
            }
        });
    };

    return (
        <AuthLayout 
            title="Sign in to your account" 
            description="Enter your credentials to access your account"
        >
            <Head title="Login" />
            
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="login">Email or Mobile Number</Label>
                        <Input
                            id="login"
                            type="text"
                            required
                            autoFocus
                            autoComplete="username"
                            value={data.login}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="Enter email or mobile number"
                        />
                        <InputError message={errors.login} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                        <InputError message={errors.password} />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Forgot password?
                    </button>
                </div>

                {attempts > 0 && (
                    <div className="text-sm text-red-600">
                        Failed attempts: {attempts}/5
                    </div>
                )}

                <Button type="submit" className="mt-4 w-full" disabled={processing}>
                    {processing && <Spinner />}
                    Sign in
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={register()}>
                        Register
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
