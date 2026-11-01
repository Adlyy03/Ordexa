# Ordexa Partner Program — Implementation Specification

## 1. Objective

Build a new **Ordexa Partner Program** module inside the existing Ordexa platform.

The system allows registered users to become Ordexa sales partners, promote the platform to restaurants, track successful referrals, earn commissions, and request commission withdrawals.

**IMPORTANT:**
- Do not create a separate application or backend.
- Integrate with the existing Ordexa codebase.
- Reuse the existing authentication, authorization, database connection, payment gateway, and UI components.
- Inspect the current project architecture and database schema before implementing anything.
- Follow existing naming conventions, coding standards, and design patterns.

## 2. New Pages & Routes

Create new pages and route files following the existing routing architecture.

### A. Partner Dashboard

Route: `/partner`

Features:
- Total successful referrals.
- Total registered restaurants.
- Active referred subscriptions.
- Total earned commissions.
- Available commission balance.
- Pending withdrawal balance.
- Recent referral activity.
- Commission transaction history.

### B. Partner Registration

Route: `/partner/register`

Features:
- Register as an Ordexa Partner.
- Display partner program terms and conditions.
- Collect required registration information.
- Submit application for admin approval.
- Display application status:
  - Pending
  - Approved
  - Rejected

Use existing user authentication where possible. Avoid creating duplicate user accounts.

### C. Referral Management

Route: `/partner/referrals`

Features:
- Display unique referral code.
- Generate referral link.
- Copy referral link.
- List referred restaurants.
- Display restaurant name.
- Display registration date.
- Display subscription status.
- Display referral conversion status.

### D. Commission History

Route: `/partner/commissions`

Features:
- Display commission transactions.
- Display commission amount.
- Display source restaurant.
- Display commission type.
- Display transaction date.
- Display commission status.

Commission statuses:
- Pending
- Available
- Paid
- Reversed

### E. Withdrawal Page

Route: `/partner/withdrawals`

Features:
- Display available balance.
- Submit withdrawal request.
- Input bank account information or select saved payout information.
- Display withdrawal history.
- Display withdrawal status:
  - Pending
  - Approved
  - Rejected
  - Paid

Implement a configurable minimum withdrawal amount.

## 3. Admin Management Pages

Create new admin pages using the existing admin dashboard layout and authorization system.

### A. Partner Management

Route: `/admin/partners`

Features:
- Display all partner accounts.
- Search and filter partners.
- View partner details.
- Approve or reject applications.
- Suspend or reactivate partners.
- View referral performance.
- View commission balances.

### B. Commission Management

Route: `/admin/partner-commissions`

Features:
- View all commission transactions.
- Filter by partner, date, and status.
- Configure commission rules.
- Manually adjust commissions with an audit trail.
- Reverse commissions when eligible payments are refunded or disputed.

### C. Withdrawal Management

Route: `/admin/partner-withdrawals`

Features:
- View withdrawal requests.
- Approve or reject requests.
- Mark approved withdrawals as paid.
- Record payment references.
- View withdrawal history.

### D. Partner Settings

Route: `/admin/partner-settings`

Configurable settings:
- Default commission percentage.
- Fixed commission option.
- Recurring commission option.
- Commission duration.
- Minimum withdrawal amount.
- Referral attribution duration.
- Partner program activation status.

## 4. Database Integration

Before creating tables:

1. Inspect the existing database schema.
2. Identify existing users, restaurants, subscriptions, payment transactions, and roles tables.
3. Reuse existing relationships wherever possible.
4. Do not duplicate existing entities.
5. Create migrations following the existing migration framework.

Create only the additional tables needed for the Partner Program.

### Suggested New Tables

#### `partners`

Stores partner-specific information.

Fields:
- id
- user_id (foreign key to existing users table)
- referral_code (unique)
- status
- approved_at
- approved_by
- created_at
- updated_at

#### `partner_referrals`

Stores referral attribution records.

Fields:
- id
- partner_id
- restaurant_id (foreign key to existing restaurants table)
- referral_code
- attribution_source
- status
- registered_at
- converted_at
- created_at
- updated_at

Prevent duplicate referral attribution for the same restaurant.

#### `partner_commissions`

Stores commission transactions.

Fields:
- id
- partner_id
- referral_id
- restaurant_id
- subscription_id (reference existing subscriptions table)
- payment_transaction_id (reference existing payment transactions table)
- commission_type
- commission_rate
- commission_amount
- status
- available_at
- paid_at
- created_at
- updated_at

Use the actual existing table and column names after schema inspection.

#### `partner_withdrawals`

Stores withdrawal requests.

Fields:
- id
- partner_id
- amount
- payout_method
- payout_account_name
- payout_account_number
- payout_provider
- status
- admin_note
- payment_reference
- processed_by
- processed_at
- created_at
- updated_at

Protect payout account information and never expose it publicly.

#### `partner_commission_settings`

Stores configurable commission rules.

Fields:
- id
- commission_type
- commission_rate
- fixed_amount
- commission_duration
- minimum_withdrawal
- attribution_days
- is_active
- created_at
- updated_at

Use suitable decimal types for monetary values and appropriate foreign keys, indexes, and constraints.

## 5. Referral Tracking Logic

Implement the following workflow:

1. An approved partner receives a unique referral code.
2. The system generates a referral URL.
3. A restaurant owner opens the referral URL.
4. The system records the referral attribution.
5. The restaurant owner registers through the existing registration process.
6. The restaurant is associated with the referring partner.
7. The restaurant selects a subscription package.
8. The restaurant completes a successful payment.
9. The commission system calculates and records the partner commission.

Important rules:
- Only approved partners can generate valid referrals.
- Do not allow partners to refer their own restaurants or accounts.
- Prevent duplicate commissions for the same payment transaction.
- Prevent changing referral ownership after successful attribution without authorized admin action.
- Use a configurable attribution expiration period.
- Handle referral registration and payment attribution securely.

## 6. Commission Calculation

Support three commission models:

### A. Fixed Commission

Partner receives a predefined fixed amount after a qualifying successful payment.

### B. Percentage Commission

Partner receives a configurable percentage of the eligible subscription payment.

Formula:

Commission = Eligible Payment Amount × Commission Rate

### C. Recurring Commission

Partner receives commission from eligible recurring subscription payments.

Rules:
- Commission is generated only after confirmed successful payments.
- Failed payments must not generate commissions.
- Refunded or disputed payments must trigger appropriate commission reversal.
- Define whether taxes, discounts, and payment gateway fees are excluded from the eligible commission base.
- Do not calculate commissions from QRIS customer transactions unless explicitly configured.

Default recommendation: Start with percentage-based commission and make recurring commission configurable.

## 7. Commission Balance Logic

Calculate balances from commission transactions rather than allowing direct manual balance modification.

Balance categories:
- Pending: Commission awaiting eligibility.
- Available: Commission eligible for withdrawal.
- Paid: Commission already disbursed.
- Reversed: Commission cancelled or deducted due to refund or dispute.

Use database transactions and idempotency protection to prevent duplicate payouts or commission records.

## 8. Withdrawal Workflow

1. Partner submits a withdrawal request.
2. System validates available balance.
3. System validates minimum withdrawal amount.
4. Withdrawal enters Pending status.
5. Admin reviews the request.
6. Admin approves or rejects it.
7. Approved withdrawal is paid manually by the admin.
8. Admin records payment reference.
9. Withdrawal is marked Paid.
10. Commission ledger is updated consistently.

Do not allow withdrawal requests exceeding the available balance.

Use database transactions and appropriate locking to prevent concurrent withdrawal requests from spending the same balance.

## 9. Authentication & Authorization

Integrate with existing authentication and role-based access control.

Required access:
- Partner: Access only their own dashboard, referrals, commissions, and withdrawals.
- Admin: Access all partner management features.
- Restaurant owner: No access to partner management pages unless independently approved as a partner.

Never rely solely on frontend route protection. Enforce permissions on backend APIs and server-side operations.

## 10. UI/UX Design

Follow the existing Ordexa design system.

Design requirements:
- Consistent with the existing Neubrutalism + Glass design direction.
- Responsive mobile-first layouts.
- Clear dashboard statistics.
- Simple referral link copying.
- Readable commission tables.
- Clear transaction statuses.
- Loading, empty, success, and error states.
- Confirmation dialogs for sensitive operations.

Reuse existing components wherever possible.

## 11. API & Backend

Create new API endpoints or server actions following the existing backend architecture.

Required operations:
- Partner registration.
- Partner approval and rejection.
- Partner dashboard statistics.
- Referral code and link retrieval.
- Referral tracking.
- Referral list retrieval.
- Commission history retrieval.
- Commission calculation.
- Withdrawal request creation.
- Withdrawal approval and rejection.
- Withdrawal payment confirmation.
- Partner settings management.

Validate all inputs on the backend.

## 12. Security & Financial Integrity

Critical requirements:
- Never trust commission amounts submitted by the frontend.
- Calculate all commissions on the server.
- Protect financial information.
- Implement audit logs for administrative financial actions.
- Prevent duplicate commission generation.
- Prevent unauthorized balance modification.
- Use idempotency for payment-related commission generation.
- Validate payment gateway webhook signatures using the existing integration.
- Never generate commission based only on frontend payment success callbacks.

## 13. Testing Requirements

Test the following scenarios:

- Partner registration.
- Admin approval and rejection.
- Unique referral code generation.
- Referral attribution.
- Restaurant registration through referral.
- Successful subscription payment.
- Commission calculation.
- Recurring commission generation.
- Failed payment handling.
- Refund and commission reversal.
- Duplicate webhook prevention.
- Withdrawal request.
- Insufficient balance validation.
- Concurrent withdrawal prevention.
- Partner authorization boundaries.
- Admin authorization boundaries.

## 14. Implementation Instructions

Implement the module in phases:

Phase 1:
- Inspect existing project architecture and database.
- Identify reusable authentication, restaurant, subscription, and payment modules.
- Prepare database migrations.

Phase 2:
- Implement partner registration and approval.
- Implement referral code generation and tracking.

Phase 3:
- Implement commission calculation and transaction records.
- Integrate with existing subscription payment confirmation flow.

Phase 4:
- Implement partner dashboard and referral pages.
- Implement commission history.

Phase 5:
- Implement withdrawal workflow and admin management.

Phase 6:
- Implement settings, security, and testing.

## 15. Final Requirements

- Create all necessary new pages, route files, API endpoints, migrations, and database tables.
- Reuse existing Ordexa infrastructure.
- Do not modify unrelated modules.
- Do not break existing restaurant registration, subscription, QRIS payment, or admin functionality.
- Do not create duplicate authentication or payment systems.
- Follow existing project conventions.
- Ensure database migrations can be safely rolled back.
- Document all new routes, tables, and business logic.

**Before implementation, inspect the actual existing codebase and database schema. Adapt all proposed table names, foreign keys, and relationships to the real project structure rather than blindly copying this specification.**
