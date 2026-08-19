export const auth = {
    login: {
        title: 'Sign in Finhay',

        login_ok: 'Signed in!',

        acct_individual: 'Individual',
        acct_business: 'Business',

        phone_lbl: 'Phone',
        custody_lbl: 'Custody #',
        pass_lbl: 'Password',

        input_phone: 'Your phone number',
        input_custody: 'Custody number',
        input_acct_pass: 'Password',

        btn_login: 'Sign in',

        forgot_pass_link: 'Forgot password?',
        or_sep: 'Or',
        signup_prompt: 'No account yet?',

        qr_scan_steps: 'Open Finhay on your phone\nand scan the QR to sign in.',
        qr_login_heading: 'QR sign-in',
        err_pass_required: 'Enter password',

        auth_sidebar_headline: 'Under a minute',
        auth_sidebar_image_alt: 'Sign-up art',
        auth_sidebar_body:
            'Your assets are fully protected—\naccess the best investment opportunities.',
    },

    register: {
        title: 'Open account',
        meta_description: 'Use your phone to log in. We will send an OTP to verify.',

        hdr_create_acct: 'Open account',
        phone_lbl: 'Phone',
        input_phone: 'Your phone number',
        err_phone_in_use: 'Phone already used',
        btn_continue: 'Next',
        or_sep: 'Or',
        has_acct_prompt: 'Have an account?',
        terms_agree_prefix: 'By tapping “Next”, you agree to the',
        terms_link: 'FHSC product terms and conditions of use',
        terms_dialog_title: 'FHSC product terms and conditions of use',

        back: 'Back',
        resend: 'Resend',

        create_pass_title: 'Set password',
        pass_lbl: 'Password',
        input_pass_secure: 'Meet the rules below',
        confirm_pass_lbl: 'Confirm',
        input_confirm_pass: 'Re-enter password',
        pass_rules_title: 'Rules',
        btn_done: 'Done',

        open_acct_ok: 'Account opened successfully',
        download_app_prompt:
            "Download the app & verify your account\nto access Finhay's full investment suite",
        btn_download_app: 'Download app',
        btn_later: 'Maybe later',
        qr_download_prompt: 'Scan the QR code to download\nthe Finhay app on your phone',
    },

    sso: {
        consent_title: 'Create commodities trading account',
        consent_desc:
            'Share your personal information at FHSC to open a commodities trading account (FHCom)',
        consent_shared_label: 'Information to be shared:',
        consent_shared_account: 'Account information',
        consent_shared_personal: 'Personal information',
        consent_shared_bank: 'Bank information',
        consent_terms_prefix: 'By clicking "Continue" you agree to the',
        consent_terms_link: 'Terms & Conditions',
        consent_btn: 'Continue',
        consent_reject: 'Decline',
        error: 'An error occurred, please try again',
        invalid_request: 'Invalid sign-in request. Please try again or contact support.',
        chooser_title: 'Choose an account',
        chooser_desc: 'You are signing in with your FHSC account',
        chooser_continue: 'Continue with this account',
        chooser_other_account: 'Use another account',
    },

    reset: {
        title: 'Reset password',

        msg_pass_updated: 'Password updated',

        acct_info_title: 'Account',
        phone_lbl: 'Phone',
        email: 'Email',
        input_phone: 'Your phone',
        input_email: 'Your email',
        btn_continue: 'Next',
        or_sep: 'Or',
        back_login: 'Back to sign-in',

        back: 'Back',
        resend: 'Resend',

        new_pass_title: 'New password',
        new_pass_lbl: 'New',
        confirm_new_pass_lbl: 'Confirm',
        input_new_pass: 'New password',
        input_confirm_new_pass: 'Re-enter new',
        pass_rules_title: 'Rules',
        btn_update: 'Update',
    },

    change: {
        title: 'Change password',
        description: 'Update password to secure your account',

        old_pass_lbl: 'Current',
        new_pass_lbl: 'New',
        confirm_pass_lbl: 'Confirm',

        input_old_pass: 'Current password',
        input_new_pass: 'New password',
        input_confirm_pass: 'Re-enter new',

        pass_rules_title: 'Rules',
        req_min_len: '≥ 8 chars',
        req_upper: 'Uppercase',
        req_lower: 'Lowercase',
        req_special: 'Special (@#$%...)',
        req_match: 'Matches new password',

        btn_update_pass: 'Save password',

        msg_pass_updated: 'Password updated',
        err_old_pass_required: 'Enter current password',
    },

    validate: {
        phone_required: 'Enter phone',
        phone_digits_only: 'Digits only',
        phone_invalid: 'Invalid phone',
        email_invalid: 'Invalid email',
        password_required: 'Enter password',
        password_min_8: 'Min. 8 characters',
        password_need_upper: 'Need uppercase',
        password_need_lower: 'Need lowercase',
        password_need_special: 'Need special char',
        confirm_password_required: 'Confirm password',
        confirm_password_mismatch: 'No match',
        custody_required: 'Enter custody #',
        reset_account_required: 'Enter account info',
    },
};
