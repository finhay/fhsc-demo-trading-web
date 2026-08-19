export type Loans = {
    loan_id: number;
    loan_type: string;
    principal_loan: number;
    principal_paid: number;
    interest_paid: number;
    release_date: string;
    overdue_date: string;
    status: string;
    interest_rate: number;
    principal_remaining: number;
    overdue_fee: number;
    overdue_day: number;
    interest_loan: number;
};

export type LoansResponse = {
    error_code: string;
    message: string;
    data: Loans[];
};
