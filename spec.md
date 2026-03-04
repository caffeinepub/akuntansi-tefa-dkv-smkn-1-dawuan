# Akuntansi TeFa DKV SMKN 1 Dawuan

## Current State

Full-stack accounting app with:
- Motoko backend: accounts, periods, journal entries, reports, logo, user roles (admin/bendahara/manager/user/guest)
- Authentication via Internet Identity (wallet/principal-based)
- Role management: Admin assigns roles to principal IDs
- Frontend: dashboard, daftar akun, jurnal, buku besar, neraca saldo, laba rugi, neraca, periode, pengaturan (logo + user management)
- User access controlled by custom role stored on-chain against caller's Principal

## Requested Changes (Diff)

### Add
- Username/password login system stored in backend
  - Each user record: username (Text), password hash (Text, SHA256-like using simple Motoko hashing), role (UserRole), isActive (Bool)
  - Backend functions: registerUser, loginWithCredentials (returns session token), validateSession, changePassword, deleteUser, listLocalUsers
  - Session token: random-ish token stored in backend map with expiry (24h), returned to frontend on successful login
  - Pre-seed a default admin account: username="admin", password="admin123"
- Frontend: LoginPage with username + password form (shown before main app)
- Frontend: LocalAuthContext to manage session token stored in localStorage, replacing Internet Identity as primary auth gate
- Frontend: In Settings > Manajemen User, add tab/section to create/delete/manage local username+password users

### Modify
- App.tsx: Show LoginPage if no valid local session exists (check localStorage token)
- useActor.ts: When local session is active, pass session token as identity signal (anonymous actor + session token header approach) -- since backend uses caller principal for auth, we need to continue using Internet Identity BUT add a local "username+password layer" on top as a secondary login screen that gates the UI
- AppSidebar: Show logged-in username (from local session) instead of principal
- Settings > Manajemen User: Add "Buat Akun Login" section to create username+password credentials linked to a role

### Remove
- Nothing removed; Internet Identity login button hidden when local session is active (users log in with username/password, II is used transparently in background)

## Implementation Plan

1. **Backend**: Add `LocalUser` type with fields: username, passwordHash, role, isActive, createdAt. Add stable Map for localUsers. Add functions:
   - `createLocalUser(username, passwordHash, role)` - admin only
   - `loginLocal(username, passwordHash)` returns `?Text` (session token)
   - `validateSessionToken(token)` returns `?UserRole`
   - `listLocalUsers()` returns list (admin only)
   - `deleteLocalUser(username)` - admin only
   - `changeLocalPassword(username, newHash)` - admin or self
   - Auto-seed default admin user on first call
   - Session tokens stored in Map<Text, {role, expiry}>

2. **Frontend LoginPage**: New page `src/pages/LoginPage.tsx` with username + password inputs. On submit, call `actor.loginLocal(username, sha256hash(password))`. On success, store token in localStorage. Show error on failure.

3. **LocalAuthContext**: New context/hook `useLocalAuth.ts` that reads/writes session token from localStorage. Provides: `localToken`, `localRole`, `localUsername`, `localLogin(username, password)`, `localLogout()`.

4. **App.tsx**: Wrap with LocalAuthProvider. If no valid token, render LoginPage. If valid token, render main layout.

5. **AppSidebar**: Replace principal display with username. Show logout button that calls localLogout (clears token + also clears II identity).

6. **Settings > Users tab**: Add sub-section "Akun Login" to create/delete local username+password accounts. Show list of existing local users with roles.

7. **Password hashing**: Use a simple deterministic hash on the frontend (Web Crypto API SHA-256 encoded as hex) before sending to backend. Backend stores and compares hashes only.
