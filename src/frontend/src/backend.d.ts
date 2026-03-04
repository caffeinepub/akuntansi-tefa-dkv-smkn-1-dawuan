import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IncomeStatement {
    labaRugi: bigint;
    totalPendapatan: bigint;
    details: Array<IncomeStatementDetail>;
    totalBeban: bigint;
}
export interface GeneralLedger {
    entries: Array<LedgerEntry>;
    account: Account;
}
export interface Account {
    id: bigint;
    code: string;
    name: string;
    createdAt: bigint;
    isActive: boolean;
    accountType: AccountType;
    normalBalance: NormalBalance;
}
export interface JournalLine {
    accountId: bigint;
    description: string;
    kredit: bigint;
    debit: bigint;
}
export interface LedgerEntry {
    balance: bigint;
    date: string;
    reference: string;
    description: string;
    kredit: bigint;
    debit: bigint;
}
export interface BalanceSheetDetail {
    account: Account;
    amount: bigint;
}
export interface TrialBalanceEntry {
    totalKredit: bigint;
    account: Account;
    totalDebit: bigint;
}
export interface Period {
    id: bigint;
    status: PeriodStatus;
    month: bigint;
    name: string;
    createdAt: bigint;
    year: bigint;
}
export interface UserEntry {
    principal: Principal;
    role: UserRole;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface LocalUser {
    username: string;
    createdAt: bigint;
    role: UserRole;
    isActive: boolean;
    passwordHash: string;
}
export interface JournalEntry {
    id: bigint;
    date: string;
    createdAt: bigint;
    createdBy: Principal;
    reference: string;
    description: string;
    lines: Array<JournalLine>;
    periodId: bigint;
}
export interface IncomeStatementDetail {
    account: Account;
    amount: bigint;
}
export interface BalanceSheet {
    totalModal: bigint;
    totalAset: bigint;
    details: Array<BalanceSheetDetail>;
    totalKewajiban: bigint;
}
export interface UserProfile {
    name: string;
}
export enum AccountType {
    Aset = "Aset",
    Beban = "Beban",
    Modal = "Modal",
    Pendapatan = "Pendapatan",
    Kewajiban = "Kewajiban"
}
export enum NormalBalance {
    Debit = "Debit",
    Kredit = "Kredit"
}
export enum PeriodStatus {
    Open = "Open",
    Closed = "Closed"
}
export enum UserRole {
    manager = "manager",
    admin = "admin",
    bendahara = "bendahara",
    user = "user",
    guest = "guest"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAccount(code: string, name: string, accountType: AccountType, normalBalance: NormalBalance): Promise<Account>;
    addJournalEntry(date: string, description: string, reference: string, periodId: bigint, lines: Array<JournalLine>): Promise<JournalEntry>;
    addPeriod(name: string, month: bigint, year: bigint): Promise<Period>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignCustomRole(user: Principal, role: UserRole): Promise<void>;
    changeLocalPassword(username: string, newPasswordHash: string): Promise<boolean>;
    closePeriod(id: bigint): Promise<Period>;
    createLocalUser(username: string, passwordHash: string, role: UserRole): Promise<Result>;
    deleteJournalEntry(id: bigint): Promise<boolean>;
    deleteLocalUser(username: string): Promise<boolean>;
    getAccountById(id: bigint): Promise<Account | null>;
    getAccounts(): Promise<Array<Account>>;
    getBalanceSheet(periodId: bigint | null): Promise<BalanceSheet>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getGeneralLedger(accountId: bigint, periodId: bigint | null): Promise<GeneralLedger>;
    getIncomeStatement(periodId: bigint | null): Promise<IncomeStatement>;
    getJournalEntries(periodId: bigint | null): Promise<Array<JournalEntry>>;
    getJournalEntryById(id: bigint): Promise<JournalEntry | null>;
    getLogoUrl(): Promise<string | null>;
    getPeriods(): Promise<Array<Period>>;
    getSessionRole(token: string): Promise<UserRole | null>;
    getTrialBalance(periodId: bigint | null): Promise<Array<TrialBalanceEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsersList(): Promise<Array<UserEntry>>;
    isCallerAdmin(): Promise<boolean>;
    listLocalUsers(): Promise<Array<LocalUser>>;
    loginLocal(username: string, passwordHash: string): Promise<string | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
    setLogoUrl(url: string): Promise<void>;
    updateAccount(id: bigint, code: string, name: string, isActive: boolean): Promise<Account>;
    updateJournalEntry(id: bigint, date: string, description: string, reference: string, lines: Array<JournalLine>): Promise<JournalEntry>;
    validateSessionToken(token: string): Promise<string | null>;
}
