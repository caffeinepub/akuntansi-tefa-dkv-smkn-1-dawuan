import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";

actor {
  // Types
  public type AccountType = {
    #Aset;
    #Kewajiban;
    #Modal;
    #Pendapatan;
    #Beban;
  };

  public type NormalBalance = {
    #Debit;
    #Kredit;
  };

  public type PeriodStatus = {
    #Open;
    #Closed;
  };

  public type Account = {
    id : Nat;
    code : Text;
    name : Text;
    accountType : AccountType;
    normalBalance : NormalBalance;
    isActive : Bool;
    createdAt : Int;
  };

  public type Period = {
    id : Nat;
    name : Text;
    month : Nat;
    year : Nat;
    status : PeriodStatus;
    createdAt : Int;
  };

  public type JournalLine = {
    accountId : Nat;
    description : Text;
    debit : Nat;
    kredit : Nat;
  };

  public type JournalEntry = {
    id : Nat;
    date : Text;
    description : Text;
    reference : Text;
    periodId : Nat;
    lines : [JournalLine];
    createdBy : Principal;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type UserRole = {
    #admin;
    #bendahara;
    #manager;
    #user;
    #guest;
  };

  public type UserEntry = {
    principal : Principal;
    role : UserRole;
  };

  public type LedgerEntry = {
    date : Text;
    description : Text;
    reference : Text;
    debit : Nat;
    kredit : Nat;
    balance : Int;
  };

  public type GeneralLedger = {
    account : Account;
    entries : [LedgerEntry];
  };

  public type TrialBalanceEntry = {
    account : Account;
    totalDebit : Nat;
    totalKredit : Nat;
  };

  public type IncomeStatementDetail = {
    account : Account;
    amount : Nat;
  };

  public type IncomeStatement = {
    totalPendapatan : Nat;
    totalBeban : Nat;
    labaRugi : Int;
    details : [IncomeStatementDetail];
  };

  public type BalanceSheetDetail = {
    account : Account;
    amount : Nat;
  };

  public type BalanceSheet = {
    totalAset : Nat;
    totalKewajiban : Nat;
    totalModal : Nat;
    details : [BalanceSheetDetail];
  };

  public type LocalUser = {
    username : Text;
    passwordHash : Text;
    role : UserRole;
    isActive : Bool;
    createdAt : Int;
  };

  public type Session = {
    username : Text;
    role : UserRole;
    expiresAt : Int;
  };

  public type Result = {
    #ok;
    #err : Text;
  };

  // Compare modules
  module Account {
    public func compare(a : Account, b : Account) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Period {
    public func compare(a : Period, b : Period) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module JournalEntry {
    public func compare(a : JournalEntry, b : JournalEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // State
  let accounts = Map.empty<Nat, Account>();
  let periods = Map.empty<Nat, Period>();
  let journalEntries = Map.empty<Nat, JournalEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userRoles = Map.empty<Principal, UserRole>();
  let localUsers = Map.empty<Text, LocalUser>();
  let sessions = Map.empty<Text, Session>();

  var logoUrl : ?Text = null;
  var nextAccountId = 1;
  var nextPeriodId = 1;
  var nextJournalEntryId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role management functions
  private func getCustomUserRole(caller : Principal) : UserRole {
    switch (userRoles.get(caller)) {
      case (null) { #guest };
      case (?role) { role };
    };
  };

  private func isCustomAdmin(caller : Principal) : Bool {
    switch (userRoles.get(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  private func canReadData(caller : Principal) : Bool {
    switch (getCustomUserRole(caller)) {
      case (#admin) { true };
      case (#bendahara) { true };
      case (#manager) { true };
      case (#user) { true };
      case (#guest) { false };
    };
  };

  private func canManageJournalEntries(caller : Principal) : Bool {
    switch (getCustomUserRole(caller)) {
      case (#admin) { true };
      case (#bendahara) { true };
      case (_) { false };
    };
  };

  private func canManageAccounts(caller : Principal) : Bool {
    switch (getCustomUserRole(caller)) {
      case (#admin) { true };
      case (_) { false };
    };
  };

  private func canManagePeriods(caller : Principal) : Bool {
    switch (getCustomUserRole(caller)) {
      case (#admin) { true };
      case (_) { false };
    };
  };

  // Initialize default admin if localUsers is empty
  private func ensureDefaultAdmin() {
    if (localUsers.size() == 0) {
      let defaultAdmin : LocalUser = {
        username = "admin";
        passwordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831d06d56";
        role = #admin;
        isActive = true;
        createdAt = Time.now();
      };
      localUsers.add("admin", defaultAdmin);
    };
  };

  // Assign custom role (admin only)
  public shared ({ caller }) func assignCustomRole(user : Principal, role : UserRole) : async () {
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    userRoles.add(user, role);
  };

  // Logo functions
  public query ({ caller }) func getLogoUrl() : async ?Text {
    logoUrl;
  };

  public shared ({ caller }) func setLogoUrl(url : Text) : async () {
    if (not canManageAccounts(caller)) {
      Runtime.trap("Unauthorized: Only admins can set logo");
    };
    logoUrl := ?url;
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUsersList() : async [UserEntry] {
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view user list");
    };
    var result : [UserEntry] = [];
    for ((principal, role) in userRoles.entries()) {
      result := result.concat([{ principal = principal; role = role }]);
    };
    result;
  };

  // Account Functions
  public shared ({ caller }) func addAccount(code : Text, name : Text, accountType : AccountType, normalBalance : NormalBalance) : async Account {
    if (not canManageAccounts(caller)) {
      Runtime.trap("Unauthorized: Only admins can add accounts");
    };
    let account : Account = {
      id = nextAccountId;
      code;
      name;
      accountType;
      normalBalance;
      isActive = true;
      createdAt = Time.now();
    };
    accounts.add(nextAccountId, account);
    nextAccountId += 1;
    account;
  };

  public shared ({ caller }) func updateAccount(id : Nat, code : Text, name : Text, isActive : Bool) : async Account {
    if (not canManageAccounts(caller)) {
      Runtime.trap("Unauthorized: Only admins can update accounts");
    };
    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let updatedAccount = {
          account with
          code;
          name;
          isActive;
        };
        accounts.add(id, updatedAccount);
        updatedAccount;
      };
    };
  };

  public query ({ caller }) func getAccounts() : async [Account] {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view accounts");
    };
    accounts.values().toArray().sort();
  };

  public query ({ caller }) func getAccountById(id : Nat) : async ?Account {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view accounts");
    };
    accounts.get(id);
  };

  // Period Functions
  public shared ({ caller }) func addPeriod(name : Text, month : Nat, year : Nat) : async Period {
    if (not canManagePeriods(caller)) {
      Runtime.trap("Unauthorized: Only admins can add periods");
    };
    let period : Period = {
      id = nextPeriodId;
      name;
      month;
      year;
      status = #Open;
      createdAt = Time.now();
    };
    periods.add(nextPeriodId, period);
    nextPeriodId += 1;
    period;
  };

  public shared ({ caller }) func closePeriod(id : Nat) : async Period {
    if (not canManagePeriods(caller)) {
      Runtime.trap("Unauthorized: Only admins can close periods");
    };
    switch (periods.get(id)) {
      case (null) { Runtime.trap("Period not found") };
      case (?period) {
        if (period.status == #Closed) {
          Runtime.trap("Period already closed");
        };
        let updatedPeriod = {
          period with status = #Closed;
        };
        periods.add(id, updatedPeriod);
        updatedPeriod;
      };
    };
  };

  public query ({ caller }) func getPeriods() : async [Period] {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view periods");
    };
    periods.values().toArray().sort();
  };

  // Journal Entry Functions
  public shared ({ caller }) func addJournalEntry(date : Text, description : Text, reference : Text, periodId : Nat, lines : [JournalLine]) : async JournalEntry {
    if (not canManageJournalEntries(caller)) {
      Runtime.trap("Unauthorized: Only admins and bendaharas can add journal entries");
    };

    switch (periods.get(periodId)) {
      case (null) { Runtime.trap("Period not found") };
      case (?period) {
        if (period.status == #Closed) {
          Runtime.trap("Cannot add entries to a closed period");
        };

        var totalDebit = 0;
        var totalKredit = 0;
        for (line in lines.values()) {
          totalDebit += line.debit;
          totalKredit += line.kredit;
        };
        if (totalDebit != totalKredit) {
          Runtime.trap("Total debit must equal total kredit");
        };

        let entry : JournalEntry = {
          id = nextJournalEntryId;
          date;
          description;
          reference;
          periodId;
          lines;
          createdBy = caller;
          createdAt = Time.now();
        };

        journalEntries.add(nextJournalEntryId, entry);
        nextJournalEntryId += 1;
        entry;
      };
    };
  };

  public shared ({ caller }) func updateJournalEntry(id : Nat, date : Text, description : Text, reference : Text, lines : [JournalLine]) : async JournalEntry {
    if (not canManageJournalEntries(caller)) {
      Runtime.trap("Unauthorized: Only admins and bendaharas can update journal entries");
    };

    switch (journalEntries.get(id)) {
      case (null) { Runtime.trap("Journal entry not found") };
      case (?entry) {
        switch (periods.get(entry.periodId)) {
          case (null) { Runtime.trap("Period not found") };
          case (?period) {
            if (period.status == #Closed) {
              Runtime.trap("Cannot update entries in a closed period");
            };

            var totalDebit = 0;
            var totalKredit = 0;
            for (line in lines.values()) {
              totalDebit += line.debit;
              totalKredit += line.kredit;
            };
            if (totalDebit != totalKredit) {
              Runtime.trap("Total debit must equal total kredit");
            };

            let updatedEntry = {
              entry with
              date;
              description;
              reference;
              lines;
            };
            journalEntries.add(id, updatedEntry);
            updatedEntry;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteJournalEntry(id : Nat) : async Bool {
    if (not canManageJournalEntries(caller)) {
      Runtime.trap("Unauthorized: Only admins and bendaharas can delete journal entries");
    };

    switch (journalEntries.get(id)) {
      case (null) { Runtime.trap("Journal entry not found") };
      case (?entry) {
        switch (periods.get(entry.periodId)) {
          case (null) { Runtime.trap("Period not found") };
          case (?period) {
            if (period.status == #Closed) {
              Runtime.trap("Cannot delete entries from a closed period");
            };
            journalEntries.remove(id);
            true;
          };
        };
      };
    };
  };

  public query ({ caller }) func getJournalEntries(periodId : ?Nat) : async [JournalEntry] {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view journal entries");
    };
    let entries = journalEntries.values().toArray();
    switch (periodId) {
      case (null) { entries.sort() };
      case (?pid) {
        entries.filter(func(entry) { entry.periodId == pid }).sort();
      };
    };
  };

  public query ({ caller }) func getJournalEntryById(id : Nat) : async ?JournalEntry {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view journal entries");
    };
    journalEntries.get(id);
  };

  // Report Functions
  public query ({ caller }) func getGeneralLedger(accountId : Nat, periodId : ?Nat) : async GeneralLedger {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };

    switch (accounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let entries = journalEntries.values().toArray();
        let filteredEntries = switch (periodId) {
          case (null) { entries };
          case (?pid) { entries.filter(func(e) { e.periodId == pid }) };
        };

        var ledgerEntries : [LedgerEntry] = [];
        var balance : Int = 0;

        for (entry in filteredEntries.vals()) {
          for (line in entry.lines.vals()) {
            if (line.accountId == accountId) {
              let debitAmount = line.debit;
              let kreditAmount = line.kredit;

              balance += (debitAmount : Int) - (kreditAmount : Int);

              ledgerEntries := ledgerEntries.concat(
                [{
                  date = entry.date;
                  description = line.description;
                  reference = entry.reference;
                  debit = debitAmount;
                  kredit = kreditAmount;
                  balance = balance;
                }],
              );
            };
          };
        };

        {
          account = account;
          entries = ledgerEntries;
        };
      };
    };
  };

  public query ({ caller }) func getTrialBalance(periodId : ?Nat) : async [TrialBalanceEntry] {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };

    let entries = journalEntries.values().toArray();
    let filteredEntries = switch (periodId) {
      case (null) { entries };
      case (?pid) { entries.filter(func(e) { e.periodId == pid }) };
    };

    let balances = Map.empty<Nat, { debit : Nat; kredit : Nat }>();

    for (entry in filteredEntries.vals()) {
      for (line in entry.lines.vals()) {
        let current = switch (balances.get(line.accountId)) {
          case (null) { { debit = 0; kredit = 0 } };
          case (?b) { b };
        };
        balances.add(
          line.accountId,
          {
            debit = current.debit + line.debit;
            kredit = current.kredit + line.kredit;
          },
        );
      };
    };

    var result : [TrialBalanceEntry] = [];
    for ((accountId, balance) in balances.entries()) {
      switch (accounts.get(accountId)) {
        case (null) {};
        case (?account) {
          result := result.concat(
            [{
              account = account;
              totalDebit = balance.debit;
              totalKredit = balance.kredit;
            }],
          );
        };
      };
    };

    result;
  };

  public query ({ caller }) func getIncomeStatement(periodId : ?Nat) : async IncomeStatement {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };

    let entries = journalEntries.values().toArray();
    let filteredEntries = switch (periodId) {
      case (null) { entries };
      case (?pid) { entries.filter(func(e) { e.periodId == pid }) };
    };

    let balances = Map.empty<Nat, Nat>();

    for (entry in filteredEntries.vals()) {
      for (line in entry.lines.vals()) {
        switch (accounts.get(line.accountId)) {
          case (null) {};
          case (?account) {
            if (account.accountType == #Pendapatan or account.accountType == #Beban) {
              let current = switch (balances.get(line.accountId)) {
                case (null) { 0 };
                case (?b) { b };
              };
              let amount = if (account.accountType == #Pendapatan) {
                line.kredit
              } else {
                line.debit
              };
              balances.add(line.accountId, current + amount);
            };
          };
        };
      };
    };

    var totalPendapatan : Nat = 0;
    var totalBeban : Nat = 0;
    var details : [IncomeStatementDetail] = [];

    for ((accountId, amount) in balances.entries()) {
      switch (accounts.get(accountId)) {
        case (null) {};
        case (?account) {
          if (account.accountType == #Pendapatan) {
            totalPendapatan += amount;
          } else if (account.accountType == #Beban) {
            totalBeban += amount;
          };
          details := details.concat(
            [{ account = account; amount = amount }],
          );
        };
      };
    };

    {
      totalPendapatan = totalPendapatan;
      totalBeban = totalBeban;
      labaRugi = (totalPendapatan : Int) - (totalBeban : Int);
      details = details;
    };
  };

  public query ({ caller }) func getBalanceSheet(periodId : ?Nat) : async BalanceSheet {
    if (not canReadData(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };

    let entries = journalEntries.values().toArray();
    let filteredEntries = switch (periodId) {
      case (null) { entries };
      case (?pid) { entries.filter(func(e) { e.periodId == pid }) };
    };

    let balances = Map.empty<Nat, Int>();

    for (entry in filteredEntries.vals()) {
      for (line in entry.lines.vals()) {
        switch (accounts.get(line.accountId)) {
          case (null) {};
          case (?account) {
            if (account.accountType == #Aset or account.accountType == #Kewajiban or account.accountType == #Modal) {
              let current = switch (balances.get(line.accountId)) {
                case (null) { 0 };
                case (?b) { b };
              };
              balances.add(line.accountId, current + (line.debit : Int) - (line.kredit : Int));
            };
          };
        };
      };
    };

    var totalAset : Nat = 0;
    var totalKewajiban : Nat = 0;
    var totalModal : Nat = 0;
    var details : [BalanceSheetDetail] = [];

    for ((accountId, balance) in balances.entries()) {
      switch (accounts.get(accountId)) {
        case (null) {};
        case (?account) {
          let absBalance = if (balance >= 0) {
            balance.toNat();
          } else {
            0;
          };

          if (account.accountType == #Aset) {
            totalAset += absBalance;
          } else if (account.accountType == #Kewajiban) {
            totalKewajiban += absBalance;
          } else if (account.accountType == #Modal) {
            totalModal += absBalance;
          };

          details := details.concat(
            [{ account = account; amount = absBalance }],
          );
        };
      };
    };

    {
      totalAset = totalAset;
      totalKewajiban = totalKewajiban;
      totalModal = totalModal;
      details = details;
    };
  };

  // Seed Data
  public shared ({ caller }) func seedData() : async () {
    if (not canManageAccounts(caller)) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    // Seed accounts
    ignore await addAccount("1-001", "Kas", #Aset, #Debit);
    ignore await addAccount("1-002", "Bank BRI", #Aset, #Debit);
    ignore await addAccount("1-003", "Piutang Usaha", #Aset, #Debit);
    ignore await addAccount("1-004", "Perlengkapan Desain", #Aset, #Debit);
    ignore await addAccount("1-005", "Peralatan Komputer", #Aset, #Debit);
    ignore await addAccount("2-001", "Hutang Usaha", #Kewajiban, #Kredit);
    ignore await addAccount("2-002", "Hutang Bank", #Kewajiban, #Kredit);
    ignore await addAccount("3-001", "Modal Awal", #Modal, #Kredit);
    ignore await addAccount("3-002", "Laba Ditahan", #Modal, #Kredit);
    ignore await addAccount("4-001", "Pendapatan Jasa Desain", #Pendapatan, #Kredit);
    ignore await addAccount("4-002", "Pendapatan Jasa Cetak", #Pendapatan, #Kredit);
    ignore await addAccount("4-003", "Pendapatan Jasa Branding", #Pendapatan, #Kredit);
    ignore await addAccount("5-001", "Beban Bahan Baku", #Beban, #Debit);
    ignore await addAccount("5-002", "Beban Gaji", #Beban, #Debit);
    ignore await addAccount("5-003", "Beban Listrik", #Beban, #Debit);
    ignore await addAccount("5-004", "Beban Internet", #Beban, #Debit);
    ignore await addAccount("5-005", "Beban Pemasaran", #Beban, #Debit);

    // Seed period
    ignore await addPeriod("Maret 2026", 3, 2026);

    // Seed sample journal entries
    let lines1 : [JournalLine] = [
      { accountId = 1; description = "Setoran modal awal"; debit = 100_000_000; kredit = 0 },
      { accountId = 8; description = "Setoran modal awal"; debit = 0; kredit = 100_000_000 },
    ];
    ignore await addJournalEntry("2026-03-01", "Setoran modal awal", "INV-001", 1, lines1);

    let lines2 : [JournalLine] = [
      { accountId = 12; description = "Jasa branding logo"; debit = 0; kredit = 3_500_000 },
      { accountId = 1; description = "Jasa branding logo"; debit = 3_500_000; kredit = 0 },
    ];
    ignore await addJournalEntry("2026-03-05", "Pendapatan jasa branding logo Canny Nails", "INV-002", 1, lines2);

    let lines3 : [JournalLine] = [
      { accountId = 5; description = "Pengeluaran komputer desain"; debit = 17_500_000; kredit = 0 },
      { accountId = 1; description = "Pengeluaran komputer desain"; debit = 0; kredit = 17_500_000 },
    ];
    ignore await addJournalEntry("2026-03-04", "Pembelian komputer desain", "INV-003", 1, lines3);
  };

  // ========== LOCAL USER (PASSWORD-BASED) LOGIN SYSTEM ==========

  // Admin-only: Create a new local user
  public shared ({ caller }) func createLocalUser(username : Text, passwordHash : Text, role : UserRole) : async Result {
    // AUTHORIZATION: Admin only
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create local users");
    };

    // Auto-initialize default admin if needed
    ensureDefaultAdmin();

    // Check if user already exists
    switch (localUsers.get(username)) {
      case (?existingUser) {
        if (existingUser.isActive) {
          return #err("User already exists and is active");
        } else {
          // Reactivate inactive user with new credentials
          let updatedUser : LocalUser = {
            username;
            passwordHash;
            role;
            isActive = true;
            createdAt = existingUser.createdAt;
          };
          localUsers.add(username, updatedUser);
          return #ok;
        };
      };
      case (null) {
        // Create new user
        let newUser : LocalUser = {
          username;
          passwordHash;
          role;
          isActive = true;
          createdAt = Time.now();
        };
        localUsers.add(username, newUser);
        return #ok;
      };
    };
  };

  // Public: Login with username and password
  public shared func loginLocal(username : Text, passwordHash : Text) : async ?Text {
    // NO AUTHORIZATION CHECK - public login endpoint

    // Auto-initialize default admin if needed
    ensureDefaultAdmin();

    // Check if local user exists and is active
    switch (localUsers.get(username)) {
      case (null) { return null };
      case (?user) {
        if (not user.isActive) { return null };

        // Validate password hash
        if (user.passwordHash != passwordHash) { return null };

        // Create session with 24-hour expiry
        let expiresAt = Time.now() + (24 * 3600 * 1_000_000_000);
        let session : Session = {
          username;
          role = user.role;
          expiresAt;
        };

        // Generate token: username + "_" + timestamp
        let token = username # "_" # Time.now().toText();
        sessions.add(token, session);

        ?token;
      };
    };
  };

  // Public: Validate a session token
  public query func validateSessionToken(token : Text) : async ?Text {
    // NO AUTHORIZATION CHECK - public validation endpoint
    switch (sessions.get(token)) {
      case (null) { null };
      case (?session) {
        if (Time.now() > session.expiresAt) {
          null;
        } else {
          ?session.username;
        };
      };
    };
  };

  // Public: Get role for a valid session
  public query func getSessionRole(token : Text) : async ?UserRole {
    // NO AUTHORIZATION CHECK - public role lookup endpoint
    switch (sessions.get(token)) {
      case (null) { null };
      case (?session) {
        if (Time.now() > session.expiresAt) {
          null;
        } else {
          ?session.role;
        };
      };
    };
  };

  // Admin-only: List all local users (without password hashes)
  public query ({ caller }) func listLocalUsers() : async [LocalUser] {
    // AUTHORIZATION: Admin only
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can list local users");
    };

    // Return all users with empty passwordHash field
    localUsers.entries().toArray().map(
      func((username, user) : (Text, LocalUser)) : LocalUser {
        { user with passwordHash = "" };
      }
    );
  };

  // Admin-only: Delete (deactivate) a local user
  public shared ({ caller }) func deleteLocalUser(username : Text) : async Bool {
    // AUTHORIZATION: Admin only
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete local users");
    };

    switch (localUsers.get(username)) {
      case (null) { false };
      case (?user) {
        let updatedUser = {
          user with
          isActive = false;
        };
        localUsers.add(username, updatedUser);
        true;
      };
    };
  };

  // Admin-only: Change a local user's password
  public shared ({ caller }) func changeLocalPassword(username : Text, newPasswordHash : Text) : async Bool {
    // AUTHORIZATION: Admin only
    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can change local user passwords");
    };

    switch (localUsers.get(username)) {
      case (null) { false };
      case (?user) {
        let updatedUser = {
          user with
          passwordHash = newPasswordHash;
        };
        localUsers.add(username, updatedUser);
        true;
      };
    };
  };
};
