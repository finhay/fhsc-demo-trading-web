export const auth = {
    login: {
        title: 'Đăng nhập Finhay',

        login_ok: 'Đăng nhập thành công!',

        acct_individual: 'Cá nhân',
        acct_business: 'Doanh nghiệp',

        phone_lbl: 'Số điện thoại',
        custody_lbl: 'Số lưu ký',
        pass_lbl: 'Mật khẩu',

        input_phone: 'Nhập số điện thoại của bạn',
        input_custody: 'Nhập số lưu ký của bạn',
        input_acct_pass: 'Mật khẩu tài khoản',

        btn_login: 'Đăng nhập',

        forgot_pass_link: 'Bạn không nhớ mật khẩu?',
        or_sep: 'Hoặc',
        signup_prompt: 'Bạn chưa có tài khoản',

        qr_scan_steps:
            'Mở ứng dụng Finhay trên thiết bị của bạn\nvà quét mã QR để đăng nhập Finhay.',
        qr_login_heading: 'Đăng nhập bằng mã QR',
        err_pass_required: 'Vui lòng nhập mật khẩu',

        auth_sidebar_headline: 'Chỉ trong 1 phút',
        auth_sidebar_image_alt: 'Hình minh họa đăng ký',
        auth_sidebar_body:
            'Tài sản của bạn đã được bảo vệ tuyệt đối và\ntiếp cận các cơ hội sinh lời tối đa',
    },

    register: {
        title: 'Tạo tài khoản',
        meta_description:
            'Nhập số điện thoại của bạn làm tài khoản đăng nhập. Mã OTP sẽ được gửi để xác thực',

        hdr_create_acct: 'Tạo tài khoản',
        phone_lbl: 'Số điện thoại',
        input_phone: 'Nhập số điện thoại của bạn',
        err_phone_in_use: 'Số điện thoại đã được sử dụng',
        btn_continue: 'Tiếp tục',
        or_sep: 'Hoặc',
        has_acct_prompt: 'Bạn đã có tài khoản?',
        terms_agree_prefix: 'Bằng việc “Tiếp tục”, bạn đồng ý với',
        terms_link: 'Điều khoản và điều kiện sử dụng sản phẩm FHSC',
        terms_dialog_title: 'Điều khoản và điều kiện sử dụng sản phẩm FHSC',

        back: 'Quay lại',
        resend: 'Gửi lại',

        create_pass_title: 'Tạo mật khẩu',
        pass_lbl: 'Mật khẩu',
        input_pass_secure: 'Nhập mật khẩu theo yêu cầu bảo mật',
        confirm_pass_lbl: 'Nhập lại mật khẩu',
        input_confirm_pass: 'Nhập lại mật khẩu của bạn',
        pass_rules_title: 'Yêu cầu mật khẩu',
        btn_done: 'Xong',

        open_acct_ok: 'Mở tài khoản thành công',
        download_app_prompt:
            'Tải ứng dụng, xác thực tài khoản để sử dụng đầy đủ\nsản phẩm đầu tư hấp dẫn trên Finhay',
        btn_download_app: 'Tải ứng dụng',
        btn_later: 'Lúc khác',
        qr_download_prompt: 'Quét mã QR để tải xuống ứng dụng\nFinhay trên điện thoại',
    },

    sso: {
        consent_title: 'Tạo tài khoản giao dịch hàng hoá',
        consent_desc:
            'Chia sẻ thông tin cá nhân của bạn tại FHSC để mở tài khoản giao dịch hàng hoá (FHCom)',
        consent_shared_label: 'Các thông tin được chia sẻ:',
        consent_shared_account: 'Thông tin tài khoản',
        consent_shared_personal: 'Thông tin cá nhân',
        consent_shared_bank: 'Thông tin Ngân hàng',
        consent_terms_prefix: 'Chọn "Tiếp tục" bạn đồng ý với',
        consent_terms_link: 'Điều khoản',
        consent_btn: 'Tiếp tục',
        consent_reject: 'Từ chối',
        error: 'Có lỗi xảy ra, vui lòng thử lại',
        invalid_request: 'Yêu cầu đăng nhập không hợp lệ. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
        chooser_title: 'Chọn tài khoản',
        chooser_desc: 'Bạn đang đăng nhập bằng tài khoản FHSC',
        chooser_continue: 'Tiếp tục với tài khoản này',
        chooser_other_account: 'Dùng tài khoản khác',
    },

    reset: {
        title: 'Đặt lại mật khẩu',

        msg_pass_updated: 'Mật khẩu đã được cập nhật thành công',

        acct_info_title: 'Thông tin tài khoản',
        phone_lbl: 'Số điện thoại',
        email: 'Email',
        input_phone: 'Nhập số điện thoại của bạn',
        input_email: 'Nhập email của bạn',
        btn_continue: 'Tiếp tục',
        or_sep: 'Hoặc',
        back_login: 'Quay lại đăng nhập',

        back: 'Quay lại',
        resend: 'Gửi lại',

        new_pass_title: 'Tạo mật khẩu mới',
        new_pass_lbl: 'Mật khẩu mới',
        confirm_new_pass_lbl: 'Xác nhận mật khẩu mới',
        input_new_pass: 'Nhập mật khẩu mới',
        input_confirm_new_pass: 'Nhập lại mật khẩu mới',
        pass_rules_title: 'Yêu cầu mật khẩu',
        btn_update: 'Cập nhật',
    },

    change: {
        title: 'Đổi mật khẩu',
        description: 'Cập nhật mật khẩu mới ngay để giữ an toàn cho tài khoản của bạn',

        old_pass_lbl: 'Mật khẩu cũ',
        new_pass_lbl: 'Mật khẩu mới',
        confirm_pass_lbl: 'Xác nhận mật khẩu',

        input_old_pass: 'Nhập mật khẩu cũ',
        input_new_pass: 'Nhập mật khẩu mới',
        input_confirm_pass: 'Nhập lại mật khẩu',

        pass_rules_title: 'Yêu cầu mật khẩu',
        req_min_len: 'Có tối thiểu 08 ký tự',
        req_upper: 'Có ký tự viết hoa',
        req_lower: 'Có ký tự viết thường',
        req_special: 'Có ký tự đặc biệt (@#$%...)',
        req_match: 'Trùng với mật khẩu đã tạo',

        btn_update_pass: 'Cập nhật mật khẩu',

        msg_pass_updated: 'Mật khẩu đã được cập nhật thành công',
        err_old_pass_required: 'Vui lòng nhập mật khẩu cũ',
    },

    validate: {
        phone_required: 'Vui lòng nhập số điện thoại',
        phone_digits_only: 'Số điện thoại chỉ được nhập số',
        phone_invalid: 'Số điện thoại không hợp lệ',
        email_invalid: 'Email không hợp lệ',
        password_required: 'Vui lòng nhập mật khẩu',
        password_min_8: 'Mật khẩu phải có tối thiểu 8 ký tự',
        password_need_upper: 'Mật khẩu phải có ký tự viết hoa',
        password_need_lower: 'Mật khẩu phải có ký tự viết thường',
        password_need_special: 'Mật khẩu phải có ký tự đặc biệt',
        confirm_password_required: 'Vui lòng nhập lại mật khẩu',
        confirm_password_mismatch: 'Mật khẩu không khớp',
        custody_required: 'Vui lòng nhập số lưu ký',
        reset_account_required: 'Vui lòng nhập thông tin tài khoản',
    },
};
