import { LoginForm } from '@/components/auth/login/LoginForm';
import { LoginQR } from '@/components/auth/login/LoginQR';
import { useAuthFlowStore } from '@/stores/auth/useAuthFlowStore';

export const LoginContent = () => {
    const { ssoContext } = useAuthFlowStore();

    return (
        <section className="flex w-full items-stretch justify-center gap-4">
            <LoginForm />
            {!ssoContext && <LoginQR />}
        </section>
    );
};
