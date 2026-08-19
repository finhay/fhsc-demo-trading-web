import { LoginForm } from '@/components/auth/login/LoginForm';
import { LoginQR } from '@/components/auth/login/LoginQR';

export const LoginContent = () => {
    return (
        <section className="flex w-full items-stretch justify-center gap-4">
            <LoginForm />
            <LoginQR />
        </section>
    );
};
