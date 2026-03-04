import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  AccountType,
  JournalLine,
  NormalBalance,
  Period,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function useAccounts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      code,
      name,
      accountType,
      normalBalance,
    }: {
      code: string;
      name: string;
      accountType: AccountType;
      normalBalance: NormalBalance;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addAccount(code, name, accountType, normalBalance);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      code,
      name,
      isActive,
    }: {
      id: bigint;
      code: string;
      name: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateAccount(id, code, name, isActive);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// ─── Periods ──────────────────────────────────────────────────────────────────

export function usePeriods() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPeriods();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPeriod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      month,
      year,
    }: {
      name: string;
      month: bigint;
      year: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addPeriod(name, month, year);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
  });
}

export function useClosePeriod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.closePeriod(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["periods"] });
    },
  });
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

export function useJournalEntries(periodId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["journal-entries", periodId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalEntries(periodId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJournalEntryById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["journal-entry", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getJournalEntryById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      description,
      reference,
      periodId,
      lines,
    }: {
      date: string;
      description: string;
      reference: string;
      periodId: bigint;
      lines: JournalLine[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addJournalEntry(
        date,
        description,
        reference,
        periodId,
        lines,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      void queryClient.invalidateQueries({ queryKey: ["income-statement"] });
      void queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
      void queryClient.invalidateQueries({ queryKey: ["general-ledger"] });
    },
  });
}

export function useUpdateJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      date,
      description,
      reference,
      lines,
    }: {
      id: bigint;
      date: string;
      description: string;
      reference: string;
      lines: JournalLine[];
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateJournalEntry(id, date, description, reference, lines);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["journal-entry"] });
      void queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      void queryClient.invalidateQueries({ queryKey: ["income-statement"] });
      void queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
      void queryClient.invalidateQueries({ queryKey: ["general-ledger"] });
    },
  });
}

export function useDeleteJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteJournalEntry(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["trial-balance"] });
      void queryClient.invalidateQueries({ queryKey: ["income-statement"] });
      void queryClient.invalidateQueries({ queryKey: ["balance-sheet"] });
      void queryClient.invalidateQueries({ queryKey: ["general-ledger"] });
    },
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function useTrialBalance(periodId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trial-balance", periodId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrialBalance(periodId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncomeStatement(periodId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["income-statement", periodId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor)
        return {
          labaRugi: BigInt(0),
          totalPendapatan: BigInt(0),
          totalBeban: BigInt(0),
          details: [],
        };
      return actor.getIncomeStatement(periodId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBalanceSheet(periodId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["balance-sheet", periodId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor)
        return {
          totalModal: BigInt(0),
          totalAset: BigInt(0),
          totalKewajiban: BigInt(0),
          details: [],
        };
      return actor.getBalanceSheet(periodId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGeneralLedger(
  accountId: bigint | null,
  periodId: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: [
      "general-ledger",
      accountId?.toString() ?? "none",
      periodId?.toString() ?? "all",
    ],
    queryFn: async () => {
      if (!actor || accountId === null) return null;
      return actor.getGeneralLedger(accountId, periodId);
    },
    enabled: !!actor && !isFetching && accountId !== null,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["caller-role"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUsersList() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUsersList();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogoUrl() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["logo-url"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLogoUrl();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetLogoUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.setLogoUrl(url);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["logo-url"] });
    },
  });
}

export function useAssignCustomRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: import("../backend.d").UserEntry["principal"];
      role: import("../backend.d").UserRole;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.assignCustomRole(user, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.seedData();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}

// ─── Local Users ──────────────────────────────────────────────────────────────

export function useLocalUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["local-users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLocalUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLocalUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      passwordHash,
      role,
    }: {
      username: string;
      passwordHash: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createLocalUser(username, passwordHash, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["local-users"] });
    },
  });
}

export function useDeleteLocalUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteLocalUser(username);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["local-users"] });
    },
  });
}

export function useChangeLocalPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      newPasswordHash,
    }: {
      username: string;
      newPasswordHash: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.changeLocalPassword(username, newPasswordHash);
    },
  });
}

// ─── Helper: Active Periods ───────────────────────────────────────────────────

export function useActivePeriod(periods: Period[]): Period | null {
  return periods.find((p) => p.status === "Open") ?? periods[0] ?? null;
}
