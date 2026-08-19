import { Checkbox } from '@/components/common/ui/Checkbox';
import { PASSWORD_REQUIREMENTS } from '@/constants/auth';
import type { ValidationType } from '@/types/auth/otp';

type Props = {
    focusedField: string | null;
    requirements: ValidationType;
    translations: Record<string, string>;
    legendText: string;
};

export const PasswordRequirements = ({
    focusedField,
    requirements,
    translations,
    legendText,
}: Props) => {
    if (!focusedField) return null;

    return (
        <fieldset id="password-requirements" className="flex w-full flex-col gap-2 rounded-xl py-2">
            <legend className="font-body-3 text-tertiary">{legendText}</legend>
            <div className={focusedField === 'password' ? 'grid w-full grid-cols-2 gap-2' : ''}>
                {PASSWORD_REQUIREMENTS.filter((req) => req.focusField === focusedField).map(
                    ({ key, translateKey }) => (
                        <Checkbox
                            key={key}
                            label={translations[translateKey] || ''}
                            checked={requirements[key as keyof ValidationType]}
                            readOnly
                        />
                    ),
                )}
            </div>
        </fieldset>
    );
};
