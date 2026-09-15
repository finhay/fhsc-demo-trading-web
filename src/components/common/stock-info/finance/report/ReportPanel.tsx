'use client';

import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/common/feature/EmptyState';
import { Spinner } from '@/components/common/ui/Spinner';
import {
    BILLION,
    FINANCIAL_REPORT_TABS,
    FINANCIAL_STATEMENT_TYPE,
    TRADE_REPORT_DIVIDER_CLASS_MAP,
    TRADE_REPORT_METRIC_STYLE_CLASS_MAP,
} from '@/constants/stock-info';
import { useStockInfoStore } from '@/stores/common/useStockInfoStore';
import type { FinancialStatementData, ReportTab } from '@/types/pages/stock-info';
import { formatNumberVN, formatPeriod } from '@/utils/format';
import { getTradeReportSchema } from '@/utils/stock-info';

const STOCK_INFO_FINANCE_REPORT = {
    section_aria: 'Báo cáo tài chính',
    tab_aria: 'Chọn loại báo cáo tài chính',
    tab_income: 'Kết quả KD',
    tab_balance: 'Cân đối KT',
    tab_cashflow: 'LC tiền tệ',
    empty: 'Chưa có dữ liệu',
    metric_labels: {
        doanhthubanhangvacungcapdichvu: 'Tổng doanh thu',
        cackhoangiamtrudoanhthu: 'Khoản giảm trừ',
        doanhthuthuanvebanhangvacungcapdichvu: 'Doanh thu thuần',
        giavonhangban: 'Giá vốn hàng bán',
        loinhuangopvebanhangvacungcapdichvu: 'Lợi nhuận gộp',
        doanhthuhoatdongtaichinh: 'DT hoạt động tài chính',
        chiphitaichinh: 'CP tài chính',
        trongdochiphilaivay: 'Trong đó: CP lãi vay',
        phanlailohoaclotrongcongtyliendoanhlienket: 'Lãi/lỗ công ty LD, LK',
        chiphibanhang: 'CP bán hàng',
        chiphiquanlydoanhnghiep: 'CP quản lý DN',
        loinhuanthuantuhoatdongkinhdoanh: 'Lợi nhuận thuần từ HĐKD',
        thunhapkhac: 'Thu nhập khác',
        chiphikhac: 'Chi phí khác',
        loinhuankhac: 'Lợi nhuận khác',
        tongloinhuanketoantruocthue: 'Tổng LN KT trước thuế',
        chiphithuetndnhienhanh: 'CP thuế TNDN HH',
        chiphithuetndnhoanlai: 'CP thuế TNDN HL',
        loinhuansauthuethunhapdoanhnghiep: 'Lợi nhuận sau thuế',
        loiichcuacodongthieuso_bctn: 'LNST cổ đông thiểu số',
        loinhuansauthuecuacongtyme: 'LNST công ty mẹ',
        laicobantrencophieu: 'Lãi cơ bản trên CP',
        laisuygiamtrencophieu: 'Lãi suy giảm trên CP',
        taisannganhan: 'Tài sản ngắn hạn',
        tienvacackhoantuongduongtien: 'Tiền và các khoản tương đương tiền',
        cackhoandaututaichinhnganhan: 'Đầu tư TC ngắn hạn',
        cackhoanphaithunganhan: 'Phải thu ngắn hạn',
        hangtonkho_tong: 'Hàng tồn kho',
        taisannganhankhac_tong: 'TS ngắn hạn khác',
        taisandaihan: 'Tài sản dài hạn',
        cackhoanphaithudaihan: 'Phải thu dài hạn',
        taisancodinh: 'Tài sản cố định',
        batdongsandautu: 'Bất động sản đầu tư',
        taisandodangdaihan: 'TS dở dang dài hạn',
        daututaichinhdaihan: 'Đầu tư TC dài hạn',
        taisandaihankhac_tong: 'TS dài hạn khác',
        tongcongtaisan: 'Tổng tài sản',
        nophaitra: 'Nợ phải trả',
        nonganhan: 'Nợ ngắn hạn',
        nodaihan: 'Nợ dài hạn',
        vonchusohuu_tong: 'Vốn chủ sở hữu',
        vonchusohuu: 'Vốn chủ sở hữu',
        nguonkinhphivacacquykhac: 'Kinh phí & quỹ khác',
        tongcongnguonvon: 'Tổng nguồn vốn',
        loinhuanlotruocthue: 'Lợi nhuận trước thuế',
        khauhaotaisancodinh: 'Khấu hao TSCĐ, BĐSĐT',
        cackhoanduphong: 'Các khoản dự phòng',
        lailotudautuvaocongtylienket: 'Lãi/lỗ từ HĐ đầu tư',
        lailochenhlechtygiahoidoaichuathuchien: 'Lãi/lỗ CL tỷ giá hối đoái',
        lailotuhoatdongdaututhanhlytaisancodinh: 'Lãi/lỗ thanh lý/xoá sổ TSCĐ',
        chiphilaivay: 'Chi phí lãi vay',
        cackhoangiamtrukhac: 'Các khoản điều chỉnh khác',
        thunhaptulaitiengui: 'Thu nhập từ lãi CT',
        phanboloithethuongmai: 'Phân bổ lợi thế TM',
        lailothanhlytaisancodinh: 'Lãi/lỗ từ thanh lý TSCĐ',
        loinhuanlotuhoatdongkinhdoanhtruocthaydoivonluudong: 'Lợi nhuận HĐKD trước TĐ VLĐ',
        tanggiamcackhoanphaithu: 'Tăng giảm phải thu',
        tanggiamchungkhoantudoanh: 'Tăng giảm CK tự doanh',
        tanggiamhangtonkho: 'Tăng giảm hàng tồn kho',
        tanggiamcackhoanphaitrakhonggomlaivaythuetndnphaitra: 'Tăng giảm phải trả',
        tanggiamchiphitratruoc: 'Tăng/giảm chi phí trả trước',
        tienlaivaydatra: 'Tiền lãi vay đã trả',
        thuethunhapdoanhnghiepdanop: 'Thuế TNDN đã nộp',
        tienthukhactuhoatdongkinhdoanh: 'Tiền thu khác từ HĐKD',
        tienchikhacchohoatdongkinhdoanh: 'Tiền chi khác cho HĐKD',
        luuchuyentienthuantuhoatdongkinhdoanh: 'LC thuần từ HĐKD',
        tienchidemuasamxaydungtaisancodinh: 'Mua sắm TSCĐ',
        tienthudothanhlynhuongbantscdvacactaisandaihankhac: 'Thu thanh lý TSCĐ',
        tienchichovaymuacaccongcunocuadonvikhac: 'Cho vay, mua các công cụ nợ',
        tienthuhoichovaybanlaicongcunocuadonvikhac: 'Thu hồi cho vay, bán lại CK nợ',
        tienchidautugopvonvaodonvikhac: 'Tiền ĐT góp vốn',
        tienthudobancackhoandautugopvonvaodonvikhac: 'Tiền thu hồi ĐT góp vốn',
        tienthulaichovaycotucvaloinhuanduocchia: 'Lãi cho vay, CTC và LN được chia',
        tienthu_chikhactuhddt: 'Tiền thu chi khác từ hoạt động đầu tư',
        luuchuyentienthuantuhoatdongdautu: 'LC thuần từ HĐĐT',
        tienthutuphathanhcophieunhangopvoncuachusohuu: 'Tiền thu từ phát hành CP, nhận vốn góp',
        tienchitravongopchocshmualaicp: 'Tiền chi trả vốn góp cho CSH, mua lại cổ phiếu',
        tienvaynganhandaihannhanduoc: 'Tiền thu từ đi vay ngắn hạn và dài hạn',
        tienchitranogocvay: 'Chi trả nợ gốc vay',
        tienchitranothuetaichinh: 'Chi trả nợ gốc thuê TC',
        cotucloinhuandatrachochusohuu: 'Cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        tienthu_chikhactuhdtc: 'Thu chi khác từ HĐTC',
        luuchuyentienthuantusudungvaohoatdongtaichinh: 'LC thuần từ HĐTC',
        luuchuyentienthuantrongnam: 'LC thuần trong kỳ',
        tienvatuongduongtiendaunam: 'Tiền & TĐT đầu kỳ',
        anhhuongcuathaydoitygiahoidoaiquydoingoaite: 'Ảnh hưởng của thay đổi tỷ giá hối đoái',
        tienvatuongduongtiencuoinam: 'Tiền & TĐT cuối kỳ',
        anhhuongcuachenhlechtygia: 'Ảnh hưởng của chênh lệch tỷ giá',
        anhhuongcuathaydoitygiahoidoai: 'Ảnh hưởng của thay đổi tỷ giá hối đoái',
        caccongcutaichinhphaisinhvacackhoannotaichinhkhac: 'Các công cụ TC phái sinh và nợ TC khác',
        caccongcutaichinhphaisinhvacactaisantaichinhkhac:
            'Các công cụ TC phái sinh & các tài sản TC khác',
        cackhoandaututaichinhdaihan: 'Các khoản đầu tư tài chính dài hạn',
        cackhoanduphongruirochocactaisanconoibangkhac:
            'Các khoản dự phòng rủi ro cho các tài sản có nội bảng khác',
        cackhoanlaiphiphaithu: 'Các khoản lãi, phí phải thu',
        cackhoannochinhphuvanhnn: 'Các khoản nợ chính phủ và NHNN',
        cackhoannokhac: 'Các khoản nợ khác',
        cackhoanphaithu: 'Các khoản phải thu',
        chenhlechdanhgialaitaisan: 'Chênh lệch đánh giá lại tài sản',
        chenhlechdgltaisantheogiahoply: 'Chênh lệch đánh giá lại tài sản theo giá hợp lý',
        chenhlechtygiahoidoai: 'Chênh lệch tỷ giá hối đoái',
        chiphilaivacackhoantuongduong: 'Chi phí lãi và các khoản tương tự',
        chovaycactctdkhac: 'Cho vay các TCTD khác',
        chovaykhachhang: 'Cho vay khách hàng',
        chovaykhachhangrong: 'Cho vay KH ròng',
        chungkhoandautu: 'Chứng khoán ĐT',
        chungkhoandautugiudenngaydaohan: 'Chứng khoán ĐT giữ đến ngày đáo hạn',
        chungkhoandautusansangdeban: 'Chứng khoán ĐT sẵn sàng để bán',
        chungkhoankinhdoanh: 'Chứng khoán KD',
        chungkhoankinhdoanhrong: 'Chứng khoán KD ròng',
        cotucdatra: 'Cổ tức đã trả cổ đông và lợi nhuận đã chia',
        cotuclndatrachochusohuu: 'Cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        cotucvatienlainhanduoc: 'Tiền thu từ cổ tức và lợi nhuận được chia',
        dautudaihankhac: 'Đầu tư dài hạn khác',
        dautuvaocacdoanhnghiepkhac: 'Tiền chi đầu tư, góp vốn vào đơn vị khác',
        dautuvaocongtycon: 'Đầu tư vào công ty con',
        dautuvaocongtyliendoanhlienket: 'Đầu tư vào công ty LDLK',
        dieuchinhchocackhoan: 'Các khoản điều chỉnh',
        duphonggiamgiachungkhoandautu: 'Dự phòng giảm giá chứng khoán ĐT',
        duphonggiamgiachungkhoankinhdoanh: 'Dự phòng giảm giá chứng khoán KD',
        duphonggiamgiadautudaihan: 'Dự phòng giảm giá đầu tư dài hạn',
        duphongruirochovaycactctdkhac: 'Dự phòng rủi ro cho vay các TCTD khác',
        duphongruirochovaykhachhang: 'Dự phòng rủi ro CV KH',
        giamcacdoanhthuphitiente: 'Giảm các DT phi tiền tệ',
        gopvondautudaihan: 'Góp vốn, đầu tư dài hạn',
        hangtonkhorong: 'Hàng tồn kho ròng',
        lnchuathuchien_bs: 'Lợi nhuận chưa thực hiện',
        lndathuchien_bs: 'Lợi nhuận đã thực hiện',
        lnsauthuechuaphanphoi: 'LNST chưa phân phối',
        lntruocthue: 'Lợi nhuận trước thuế',
        lntuhdkdtruocthaydoivld: 'Lợi nhuận từ HĐKD trước thay đổi vốn lưu động',
        lntuhoatdongkdtruocthaydoivonluudong: 'LN từ HĐKD trước thay đổi vốn lưu động',
        loiichcodongkhongkiemsoat: 'Lợi ích cổ đông không kiểm soát',
        loiichcuacodongthieuso_bs: 'Lợi ích của cổ đông thiểu số',
        loinhuanchuaphanphoi: 'LN chưa phân phối',
        luuchuyenthuantuhoatdongkd: 'LC thuần từ HĐKD',
        luuchuyenthuantuhoatdongtc: 'LC thuần từ HĐTC',
        luuchuyentienthuantrongky: 'LC thuần trong kỳ',
        luuchuyentienthuantucachoatdongsxkd: 'LC thuần từ HĐKD',
        luuchuyentienthuantuhddautu: 'LC thuần từ HĐĐT',
        luuchuyentienthuantuhdkd: 'LC thuần từ HĐKD',
        luuchuyentienthuantuhdtaichinh: 'LC thuần từ HĐTC',
        luuchuyentientuhoatdongtaichinh: 'LC thuần từ HĐTC',
        luuchuyentuhoatdongdautu: 'LC thuần từ HĐĐT',
        muasambatdongsandautu: 'Mua sắm BĐS đầu tư',
        nguonkinhphivaquykhac: 'Kinh phí & quỹ khác',
        nguonvondautuxdcb: 'Nguồn vốn đầu tư xây dựng cơ bản',
        nophaitravavonchusohuu: 'Tổng nguồn vốn',
        phathanhgiaytocogia: 'Phát hành giấy tờ có giá',
        quycuatochuctindung: 'Quỹ của TCTD',
        quydautuphattrien: 'Quỹ đầu tư phát triển',
        quydptcvaruironghiepvu: 'Quỹ dự phòng tài chính và rủi ro nghiệp vụ',
        quydutrubosungvondieule: 'Quỹ dự trữ bổ sung vốn điều lệ',
        quyhotrosapxepdoanhnghiep: 'Quỹ hỗ trợ sắp xếp doanh nghiệp',
        quykhacthuocvonchusohuu: 'Quỹ khác thuộc VCSH',
        taisancodinhhuuhinh: 'Tài sản cố định hữu hình',
        taisancodinhthuetaichinh: 'Tài sản cố định thuê TC',
        taisancodinhvohinh: 'Tài sản cố định vô hình',
        taisancokhac: 'Tài sản có khác',
        taisandaihankhac: 'TS dài hạn khác',
        taisankhac: 'TS khác',
        taisannganhankhac: 'TS ngắn hạn khác',
        taisantaibaohiem: 'TS tái bảo hiểm',
        taisantcdaihan: 'Tài sản TC dài hạn',
        taisantcnganhan: 'Tài sản TC ngắn hạn',
        taisanthuetndnhoanlai: 'TS thuế TNDN hoãn lại',
        tangcaccptiente: 'Tăng các chi phí tiền tệ',
        tanggiamcaccongcutaichinhphaisinhvacackhoannotckhac:
            'Tăng giảm CCTC phái sinh và nợ TC khác',
        tanggiamcaccongcutaichinhphaisinhvacactstckhac: 'Tăng giảm CCTC phái sinh và TSTC khác',
        tanggiamcackhoanchovaykhachhang: 'Tăng giảm các khoản cho vay khách hàng',
        tanggiamcackhoanvekinhdoanhchungkhoan: 'Tăng giảm về kinh doanh CK',
        tanggiamcakkhoannochinhphuvanhnn: 'Tăng/giảm các khoản nợ Chính phủ và NHNN',
        tanggiamcakkhoantienguivachovaycactctdkhac:
            'Tăng/giảm các khoản tiền gửi và cho vay các TCTD khác',
        tanggiamcakkhoantienguivavaycactctdkhac:
            'Tăng/giảm các khoản tiền gửi và vay các TCTD khác',
        tanggiamchitucacquycuatctd: 'Tăng giảm chi từ các quỹ của TCTD',
        tanggiamkhacvecongnohoatdong: 'Tăng giảm khác về công nợ hoạt động',
        tanggiamkhacvetaisanhoatdong: 'Tăng giảm khác về tài sản hoạt động',
        tanggiamlaiphiphaithu: 'Tăng giảm phải thu',
        tanggiamlaiphiphaitra: 'Tăng giảm phải trả',
        tanggiamnguonduphongdebudaptonthatcackhoan:
            'Tăng/giảm nguồn dự phòng để bù đắp tổn thất các khoản',
        tanggiamphathanhgiaytocogia: 'Tăng giảm phát hành giấy tờ có giá',
        tanggiamtienguicuakhachhang: 'Tăng giảm tiền gửi của khách hàng',
        tanggiamvontaitrouythacdautucuachinhphuvacactctdkhac:
            'Tăng giảm vốn uỷ thác của CP và TCTD khác',
        thaydoitaisanvanophaitrahoatdong: 'Thay đổi TS và nợ phải trả hoạt động',
        thunhaplaivacackhoantuongduong: 'Thu nhập lãi và các khoản tương tự',
        thunhaptuhoatdongdichvunhanduoc: 'Thu nhập từ HĐ dịch vụ nhận được',
        thunhaptuhoatdongkinhdoanhchungkhoan: 'Thu nhập từ HĐ kinh doanh chứng khoán',
        thunhaptuhoatdongkinhdoanhngoaitevang: 'Thu nhập từ HĐ kinh doanh ngoại tệ, vàng',
        tienchichovaymuacaccongcuno: 'Tiền chi cho vay, mua các công cụ nợ',
        tienchimuasamxaydungtscdtaisandaihankhac: 'Tiền mua TSCĐ và các TSDH khác',
        tienchinopthuethunhapdoanhnghiep: 'Tiền thuế doanh nghiệp thực nộp trong năm',
        tienchiradobanthanhlybatdongsandautu: 'Tiền chi cho việc bán, thanh lý BĐS đầu tư',
        tienchiramuacophieuquy: 'Tiền chi ra mua CP quỹ',
        tienchiramualaicophieu: 'Tiền chi trả vốn góp, mua lại CP đã phát hành',
        tienchithanhtoangiaytocogiadaihan: 'Tiền chi thanh toán giấy tờ có giá dài hạn',
        tienchitranothuetc: 'Chi trả nợ gốc thuê TC',
        tienchitravongopchocacchusohuu: 'Tiền chi trả vốn góp, mua lại CP đã phát hành',
        tienchituthanhlynhuongbantscd: 'Tiền chi từ thanh lý, nhượng bán TSCĐ',
        tiendatranovay: 'Chi trả nợ gốc vay',
        tiendautuvaocacdonvikhac: 'Tiền ĐT góp vốn',
        tienguicuakhachhang: 'Tiền gửi của khách hàng',
        tienguitainganhangnhanuoc: 'Tiền gửi tại NHNN',
        tienguivachovaycactctdkhac: 'Tiền gửi & cho vay các TCTD khác',
        tienguivavaycactochuctindungkhac: 'Tiền gửi và vay các TCTD khác',
        tienmatvangbacdaquy: 'Tiền mặt, vàng bạc, đá quý',
        tienmuataisancodinh: 'Tiền mua TSCĐ',
        tienmuataisancodinhvacactaisandaihankhac: 'Tiền mua TSCĐ và các TSDH khác',
        tienthucackhoannodaduocxulyxoabudap: 'Tiền thu từ các khoản nợ đã được xử lý',
        tienthuchikhactuhoatdongdautu: 'Tiền thu chi khác từ hoạt động đầu tư',
        tienthuchikhactuhoatdongtaichinh: 'Thu chi khác từ HĐTC',
        tienthuchikhactuhoatdongtc: 'Thu chi khác từ HĐTC',
        tienthudobantaisancodinh: 'Tiền thu do bán TSCĐ',
        tienthuduocdobancophieuquy: 'Tiền thu từ bán CP quỹ',
        tienthuduoctuthanhlytaisancodinh: 'Tiền thu được từ thanh lý tài sản cố định',
        tienthuhoichovaybanlaicaccongcuno: 'Tiền thu hồi cho vay, bán lại công cụ nợ',
        tienthuhoichovaybanlaicongcuno: 'Tiền thu hồi cho vay, bán lại công cụ nợ',
        tienthuhoivongopvaodonvikhac: 'Tiền thu hồi ĐT góp vốn',
        tienthulaichovaycotucvalnduocchia: 'Lãi cho vay, cổ tức và LN được chia',
        tienthulaichovayvalnduocchia: 'Lãi cho vay, cổ tức và LN được chia',
        tienthutubanthanhlybatdongsandautu: 'Tiền thu từ bán, thanh lý BĐS đầu tư',
        tienthutudivay: 'Tiền vay nhận được',
        tienthutuphathanhcophieunhanvongop: 'Tiền thu từ phát hành CP nhận vốn góp',
        tienthutuphathanhcophieuvavongop: 'Tiền thu từ phát hành CP nhận vốn góp',
        tienthutuphathanhgiaytocogiadaihan: 'Tiền thu từ phát hành giấy tờ có giá dài hạn',
        tienthututhanhlytscdtsdaihankhac: 'Tiền thu được từ thanh lý, nhượng bán TSCĐ',
        tienthutuviecbancackhoandautuvaodoanhnghiepkhac:
            'Tiền thu từ việc bán các khoản đầu tư vào doanh nghiệp khác',
        tientrachonhanvienvanhacungcap: 'Tiền trả cho nhân viên và nhà cung cấp',
        tientracotuclndatrachochusohuu: 'Tiền trả cổ tức, lợi nhuận đã trả cho chủ sở hữu',
        tienvacackhoantuongduongtiencuoiky: 'Tiền & TĐT cuối kỳ',
        tienvacackhoantuongduongtiendauky: 'Tiền & TĐT đầu kỳ',
        tienvangguitaitctdkhac: 'Tiền, vàng gửi tại TCTD khác',
        tienvatuongduongtiencuoiky: 'Tiền & TĐT cuối kỳ',
        tienvatuongduongtiendauky: 'Tiền & TĐT đầu kỳ',
        tienvaykhac: 'Tiền vay khác',
        tienvaynhanduoc: 'Tiền vay nhận được',
        tienvayquyhotrothanhtoan: 'Tiền vay quỹ hỗ trợ thanh toán',
        tonglnketoantruocthue_cf: 'Lợi nhuận trước thuế',
        tongnguonvon: 'Tổng nguồn vốn',
        tongnophaitra: 'Nợ phải trả',
        tongtaisan: 'Tổng tài sản',
        voncuatochuctindung: 'Vốn của TCTD',
        vondautucuachusohuu: 'Vốn ĐT của chủ sở hữu',
        vontaitrouythacdautucuachinhphuvacactochuctindungkhac:
            'Vốn tài trợ, uỷ thác ĐT của CP và các TCTD khác',
        thunhaplaivacackhoanthunhaptuongtu: 'Thu nhập lãi & các khoản thu nhập tương tự',
        chiphilaivacacchiphituongtu: 'CP lãi & các CP tương tự',
        thunhaplaithuan: 'Thu nhập lãi thuần',
        thunhaptuhoatdongdichvu: 'Thu nhập từ HĐ dịch vụ',
        chiphihoatdongdichvu: 'CP HĐ dịch vụ',
        laithuantuhoatdongdichvu: 'Lãi thuần từ HĐ dịch vụ',
        lailothuantuhoatdongkinhdoanhngoaihoivavang: 'Lãi/lỗ thuần từ ngoại hối và vàng',
        lailothuantumuabanchungkhoankinhdoanh: 'Lãi/lỗ thuần từ mua bán CK kinh doanh',
        lailothuantumuabanchungkhoandautu: 'Lãi/lỗ thuần từ mua bán CK đầu tư',
        thunhaptuhoatdongkhac: 'Thu nhập từ HĐ khác',
        chiphihoatdongkhac: 'CP HĐ khác',
        lailothuantuhoatdongkhac: 'Lãi/lỗ thuần từ HĐ khác',
        thunhaptugopvonmuacophan: 'Thu nhập từ góp vốn, mua cổ phần',
        tongthunhaphoatdong: 'Tổng thu nhập hoạt động',
        chiphihoatdong: 'CP hoạt động',
        loinhuanthuantuhdkdtruocchiphiduphongruirotindung: 'LN thuần từ HĐKD trước chi phí DPRRTD',
        chiphiduphongruirotindung: 'CP dự phòng rủi ro TD',
        tongloinhuantruocthue: 'Tổng lợi nhuận trước thuế',
        chiphithuethunhapdoanhnghiep: 'Chi phí thuế TNDN',
        loinhuansauthue: 'Lợi nhuận sau thuế',
        loiichcuacodongthieuso_pl: 'Lợi ích cổ đông thiểu số',
        codongcuacongtyme: 'LNST Ngân hàng mẹ',
        laitucactaisantcfvtpl: 'Lãi từ các tài sản TC ghi nhận thông qua lãi/lỗ (FVTPL)',
        laitucackhoandautunamgiudenngaydaohanhtm:
            'Lãi từ các khoản ĐT nắm giữ đến ngày đáo hạn (HTM)',
        laitucackhoanchovayvaphaithu: 'Lãi từ các khoản cho vay và phải thu',
        laitutaisantcsansangdebanafs: 'Lãi từ tài sản TC sẵn sàng để bán (AFS)',
        laitucaccongcuphatsinhphongnguaruiro: 'Lãi từ các công cụ phái sinh phòng ngừa rủi ro',
        doanhthuhoatdongmoigioick: 'Doanh thu hoạt động môi giới CK',
        doanhthubaolanhdailyphathanhck: 'Doanh thu bảo lãnh, đại lý phát hành CK',
        doanhthutuvandautuck: 'Doanh thu tư vấn ĐT CK',
        doanhthuhoatdonguythacdaugia: 'Doanh thu hoạt động ủy thác đấu giá',
        doanhthuhoatdongluukyck: 'Doanh thu hoạt động lưu ký chứng khoán',
        doanhthuhoatdongtuvantc: 'Doanh thu hoạt động tư vấn tài chính',
        doanhthuhoatdongkhac: 'Doanh thu HĐ khác',
        doanhthuhoatdong: 'Tổng doanh thu HĐ',
        lotucactaisantcfvtpl: 'Lỗ từ các tài sản TC ghi nhận thông qua lãi lỗ (FVTPL)',
        locackhoandautunamgiudenngaydaohanhtm: 'Lỗ các khoản ĐT nắm giữ đến ngày đáo hạn (HTM)',
        cplaivaylotucackhoanchovayvaphaithu: 'CP lãi vay, lỗ từ cho vay và phải thu',
        lovachenhlechdgltaisanafskhiphanloailai:
            'Lỗ và chênh lệch đánh giá lại tài sản AFS khi phân loại lại',
        cpdphoannhaptstc: 'CP dự phòng/hoàn nhập TSTC, xử lý tổn thất phải thu khó đòi...',
        lotucactaisantcphaisinhphongnguaruiro: 'Lỗ từ các tài sản TC phái sinh phòng ngừa rủi ro',
        cphoatdongmoigioick: 'CP hoạt động môi giới chứng khoán',
        cphoatdongtudoanh: 'CP hoạt động tự doanh',
        cphoatdongbaolanhdailyphathanhck: 'CP hoạt động bảo lãnh, đại lý phát hành CK',
        cphoatdongtuvandautuck: 'CP hoạt động tư vấn đầu tư chứng khoán',
        cphoatdongdaugiauythac: 'CP hoạt động đấu giá, ủy thác',
        cpnghiepvuluukyck: 'CP nghiệp vụ lưu ký CK',
        cphoatdongtuvantc: 'CP hoạt động tư vấn TC',
        cphoatdongkhac: 'CP hoạt động khác',
        cphoatdong: 'Tổng chi phí HĐ',
        lngop: 'Lợi nhuận gộp',
        chenhlechlaitygiahoidoaidavachuathuchien:
            'Chênh lệch lãi tỷ giá hối đoái đã & chưa thực hiện',
        doanhthuduthucotuclaitienguikhongcodinh: 'DT, dự thu cổ tức, lãi tiền gửi không cố định',
        laibanthanhlycackhoandautulkld: 'Lãi bán, thanh lý các khoản ĐT vào CT con, liên kết...',
        doanhthukhacvedautu: 'Doanh thu khác về ĐT',
        doanhthuhoatdongtc: 'Tổng doanh thu HĐ TC',
        chenhlechlotygiahoidoaidavachuathuchien:
            'Chênh lệch lỗ tỷ giá hối đoái đã & chưa thực hiện',
        cplaivay_pl: 'CP lãi vay',
        cpdpcackhoandaututcdaihan: 'CP dự phòng các khoản ĐT TC dài hạn',
        cptckhac: 'CP tài chính khác',
        cptc: 'Tổng chi phí TC',
        lailotucongtyliendoanhlienket: 'Lãi/lỗ từ công ty liên doanh liên kết',
        cpbanhang: 'Chi phí bán hàng',
        cpql: 'Chi phí quản lý',
        ketquahoatdongkd: 'Kết quả hoạt động KD',
        lnkhac: 'Lợi nhuận khác',
        cpkhac: 'Chi phí khác',
        tonglnketoantruocthue: 'Tổng lợi nhuận kế toán trước thuế',
        lndathuchien_pl: 'LN đã thực hiện',
        lnchuathuchien_pl: 'LN chưa thực hiện',
        cpthuetndn: 'Chi phí thuế TNDN',
        cpthuetndnhienhanh: 'CP thuế TNDN HH',
        cpthuetndnhoanlai: 'CP thuế TNDN HL',
        lnsauthue: 'Lợi nhuận sau thuế',
        lnsauthuecuachusohuu: 'LNST của chủ sở hữu',
        loiichcuacodongthieuso: 'Lợi ích của cổ đông thiểu số',
        lnsauthuephanbokhac: 'LNST phân bổ khác',
        thunhaptoandienkhacsauthuetndn: 'Thu nhập toàn diện khác sau thuế TNDN',
        tongthunhaptoandien: 'Tổng thu nhập toàn diện',
        tongthunhaptoandienphanbochocodongthieuso: 'Tổng TN toàn diện phân bổ cho cổ đông thiểu số',
        tongthunhaptoandienphanbochovonchusohuu: 'Tổng TN toàn diện phân bổ cho VCSH',
        thunhapphaloangtrencophieu: 'TN pha loãng trên CP',
        doanhthuphibaohiem: 'Doanh thu phí BH',
        phibaohiemgoc: 'Phí bảo hiểm gốc',
        phinhantaibaohiem: 'Phí nhận tái bảo hiểm',
        tgduphongphibaohiemgoc: 'Tăng/giảm dự phòng phí BH gốc và nhận tái BH',
        phinhuongtaibaohiem: 'Phí nhượng tái BH',
        tongphinhuongtaibaohiem: 'Tổng phí nhượng tái BH',
        tgduphongphinhuongtaibaohiem: 'Tăng/giảm dự phòng phí nhượng tái BH',
        doanhthuphibaohiemthuan: 'Doanh thu phí BH thuần',
        hoahongnhuongtaibaohiem: 'Hoa hồng nhượng tái BH & doanh thu khác từ KDCH',
        thuhoahongnhuongtaibaohiem: 'Thu hoa hồng nhượng tái bảo hiểm',
        thukhachdkdbaohiem: 'Thu khác hoạt động kinh doanh bảo hiểm',
        doanhthuthuan: 'Doanh thu thuần',
        chiboithuong: 'Chi bồi thường',
        tongchiboithuong: 'Tổng chi bồi thường',
        cackhoangiamtru: 'Các khoản giảm trừ CP',
        thuboithuongnhuongtaibaohiem: 'Thu bồi thường nhượng tái bảo hiểm',
        tangduphongnghiepvubaohiemgoc: 'Tăng dự phòng nghiệp vụ bảo hiểm gốc',
        tgduphongtoanhoc: 'Tăng/giảm dự phòng toán học',
        tanggiamduphongcamketdaututoithieu: 'Tăng/giảm dự phòng cam kết ĐT tối thiểu',
        tanggiamduphongchialai: 'Tăng/giảm dự phòng chia lãi',
        tanggiamduphongdambaocandoi: 'Tăng/giảm dự phòng đảm bảo cân đối',
        tanggiamduphongnghiepvubaohiemgockhac: 'Tăng/giảm dự phòng nghiệp vụ BH gốc khác',
        tgduphongboithuongbaohiemgoc: 'Tăng/giảm dự phòng bồi thường BH gốc và nhận tái BH',
        tgduphongboithuongnhuongtaibaohiem: 'Tăng/giảm dự phòng bồi thường nhượng tái BH',
        tongchiboithuongvatratienbaohiem: 'Tổng chi bồi thường và trả tiền bảo hiểm',
        trichduphongdaodonglon: 'Trích dự phòng dao động lớn',
        chikhachdkdbaohiemgoc: 'Chi khác hoạt động kinh doanh BH gốc',
        tongchitructiephdkdbaohiem: 'Tổng chi trực tiếp hoạt động kinh doanh BH',
        lntuhdkdkhac: 'Lợi nhuận từ HĐKD khác',
        doanhthuhdkdkhac: 'Doanh thu hoạt động kinh doanh khác',
        cphdkdkhac: 'Chi phí HĐKD khác',
        lnhdtaichinh: 'Lợi nhuận HĐTC',
        doanhthuhdtaichinh: 'Doanh thu hoạt động tài chính',
        chiphiquanlydn: 'CP quản lý doanh nghiệp',
        lnthuantuhdkd: 'Lợi nhuận thuần từ HĐKD',
        tonglnketoantruocthue_bs: 'LN kế toán trước thuế',
        lnstthunhapdn: 'Lợi nhuận sau thuế',
        lnstcuacongtyme: 'LNST công ty mẹ',
        net_sale: 'Doanh thu thuần',
        gross_profit: 'Lợi nhuận gộp',
        operating_profit: 'Lợi nhuận từ hoạt động kinh doanh',
        profit_before_tax: 'Lợi nhuận trước thuế',
        profit_after_tax: 'Lợi nhuận sau thuế',
        parent_company_profit: 'Lợi nhuận sau thuế của công ty mẹ',
        eps: 'Lãi cơ bản trên cổ phiếu (EPS)',
        total_assets: 'Tổng tài sản',
        total_current_assets: 'Tài sản ngắn hạn',
        cash_and_cash_equivalents: 'Tiền và tương đương tiền',
        short_term_investments: 'Đầu tư tài chính ngắn hạn',
        short_term_receivables: 'Các khoản phải thu ngắn hạn',
        inventories: 'Hàng tồn kho',
        total_liabilities: 'Tổng nợ phải trả',
        short_term_debt: 'Nợ vay ngắn hạn',
        long_term_debt: 'Nợ vay dài hạn',
        owner_equity: 'Vốn chủ sở hữu',
        charter_capital: 'Vốn điều lệ',
        operating_cash_flow: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
        investing_cash_flow: 'Lưu chuyển tiền thuần từ hoạt động đầu tư',
        financing_cash_flow: 'Lưu chuyển tiền thuần từ hoạt động tài chính',
        net_cash_flow: 'Lưu chuyển tiền thuần trong kỳ',
        depreciation_and_amortization: 'Khấu hao và phân bổ',
        selling_expense: 'Chi phí bán hàng',
        admin_expense: 'Chi phí quản lý doanh nghiệp',
        interest_expense: 'Chi phí lãi vay',
    },
};

type Props = {
    isLoading: boolean;
    financialData: FinancialStatementData;
};

export const ReportPanel = ({ isLoading, financialData }: Props) => {
    const { selectedStock } = useStockInfoStore();
    const [activeTab, setActiveTab] = useState<ReportTab>(
        FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT,
    );
    const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; colIndex: number } | null>(
        null,
    );

    useEffect(() => {
        setActiveTab(FINANCIAL_STATEMENT_TYPE.INCOME_STATEMENT);
        setHoveredCell(null);
    }, [selectedStock?.symbol]);

    useEffect(() => {
        setHoveredCell(null);
    }, [activeTab]);

    const activeRows = financialData[activeTab];

    const reportSchema = useMemo(
        () => getTradeReportSchema(selectedStock?.companyType, activeTab),
        [selectedStock?.companyType, activeTab],
    );

    const isCellHighlighted = (rowIndex: number | null, colIndex: number | null) => {
        if (!hoveredCell) return false;
        return (
            (rowIndex !== null && hoveredCell.rowIndex === rowIndex) ||
            (colIndex !== null && hoveredCell.colIndex === colIndex)
        );
    };

    const cellBgClass = (highlighted: boolean) => (highlighted ? 'base-tertiary' : 'base-secondary');

    return (
        <section
            className="flex h-full min-h-0 flex-col gap-2 p-3 overflow-hidden base-secondary rounded-2xl border border-tertiary"
            aria-label={'Báo cáo tài chính'}
        >
            <nav
                className="flex shrink-0 items-start gap-4"
                role="tablist"
                aria-label={'Chọn loại báo cáo tài chính'}
            >
                {FINANCIAL_REPORT_TABS.map(({ key, labelKey }) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        id={`trade-report-${key}-tab`}
                        aria-selected={activeTab === key}
                        aria-controls="trade-report-panel"
                        onClick={() => setActiveTab(key)}
                        className={`body-4-highlight whitespace-nowrap transition-colors ${
                            activeTab === key ? 'text-primary' : 'text-secondary'
                        }`}
                    >
                        {STOCK_INFO_FINANCE_REPORT[labelKey]}
                    </button>
                ))}
            </nav>
            {isLoading ? (
                <div className="flex h-full min-h-0 items-center justify-center" role="status">
                    <Spinner isLoading isOverlay={false} />
                </div>
            ) : activeRows.length > 0 ? (
                <>
                    <div
                        id="trade-report-panel"
                        role="tabpanel"
                        aria-labelledby={`trade-report-${activeTab}-tab`}
                        className="scrollbar min-h-0 flex-1 overflow-auto base-secondary"
                    >
                        <table
                            className="w-full min-w-full border-separate border-spacing-0 base-secondary"
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            <thead className="base-secondary">
                                <tr className="base-secondary">
                                    <th className="base-secondary text-primary sticky top-0 left-0 z-20 w-48 whitespace-normal break-words py-2 text-left body-5-highlight">
                                        QoQ
                                    </th>
                                    {activeRows.map((row, colIndex) => (
                                        <th
                                            key={`${row.year}-${row.quarter}`}
                                            className={`${cellBgClass(isCellHighlighted(null, colIndex))} sticky top-0 z-10 p-2 text-right body-5-highlight ${
                                                colIndex === 0 ? 'text-primary' : 'text-secondary'
                                            }`}
                                        >
                                            {formatPeriod(row)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="base-secondary">
                                {reportSchema.map((schemaRow, rowIndex) => {
                                    if (schemaRow.kind === 'divider') {
                                        return (
                                            <tr key={`divider-${rowIndex}`}>
                                                <td
                                                    colSpan={activeRows.length + 1}
                                                    className={
                                                        TRADE_REPORT_DIVIDER_CLASS_MAP[
                                                            schemaRow.variant
                                                        ]
                                                    }
                                                />
                                            </tr>
                                        );
                                    }

                                    if (schemaRow.kind === 'section') {
                                        return (
                                            <tr
                                                key={`section-${schemaRow.label}-${rowIndex}`}
                                                className="base-secondary"
                                            >
                                                <td
                                                    className={`base-secondary sticky left-0 z-10 w-48 whitespace-normal break-words p-2 ${TRADE_REPORT_METRIC_STYLE_CLASS_MAP.sectionTitle}`}
                                                >
                                                    {schemaRow.label}
                                                </td>
                                                {activeRows.map((row, colIndex) => (
                                                    <td
                                                        key={`section-empty-${schemaRow.label}-${row.year}-${row.quarter}`}
                                                        className={`${cellBgClass(isCellHighlighted(null, colIndex))} p-2`}
                                                    />
                                                ))}
                                            </tr>
                                        );
                                    }

                                    const isRowHighlighted = isCellHighlighted(rowIndex, null);

                                    return (
                                        <tr key={schemaRow.metricKey} className="base-secondary">
                                            <td
                                                className={`${cellBgClass(isRowHighlighted)} sticky left-0 z-10 w-48 whitespace-normal break-words p-2 ${TRADE_REPORT_METRIC_STYLE_CLASS_MAP[schemaRow.style]}`}
                                            >
                                                {schemaRow.uiLabel ?? '—'}
                                            </td>
                                            {activeRows.map((row, colIndex) => {
                                                const value = (row as Record<string, unknown>)[
                                                    schemaRow.metricKey
                                                ];
                                                const normalizedValue =
                                                    typeof value === 'number' ? value : 0;
                                                const billionValue = normalizedValue / BILLION;
                                                const isWholeBillion = Math.abs(billionValue) >= 1;
                                                const formattedValue = formatNumberVN(
                                                    isWholeBillion
                                                        ? Math.trunc(billionValue)
                                                        : billionValue,
                                                    {
                                                        decimals: isWholeBillion ? 0 : 2,
                                                        trimTrailingZeros: true,
                                                    },
                                                );
                                                const displayValue =
                                                    formattedValue === '-0' ? '0' : formattedValue;
                                                return (
                                                    <td
                                                        key={`${schemaRow.metricKey}-${row.year}-${row.quarter}`}
                                                        className={`${cellBgClass(isCellHighlighted(rowIndex, colIndex))} p-2 text-right body-5 ${
                                                            normalizedValue < 0
                                                                ? 'text-red'
                                                                : 'text-primary'
                                                        }`}
                                                        onMouseEnter={() =>
                                                            setHoveredCell({ rowIndex, colIndex })
                                                        }
                                                    >
                                                        {displayValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="ml-auto body-5 text-secondary">Đơn vị: tỷ đồng</div>
                </>
            ) : (
                <EmptyState />
            )}
        </section>
    );
};
