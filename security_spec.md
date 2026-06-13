# Security Specification for Paradise Bucket

## Data Invariants
1. A product must have a name, non-negative price, and valid category.
2. Only authenticated admins can create, update, or delete products and view activity logs.
3. Activity logs are append-only (create only) for admins.
4. Marketplace links must be valid URLs (conceptually).
5. Timestamps must be server-generated.

## The "Dirty Dozen" Payloads (Adversarial Scenarios)

1. **Anonymous Write**: Attempting to create a product without being logged in.
   - *Expected*: PERMISSION_DENIED.
2. **Non-Admin Write**: Attempting to create a product as a standard authenticated user.
   - *Expected*: PERMISSION_DENIED.
3. **Price Poisoning**: Creating a product with a negative price.
   - *Expected*: PERMISSION_DENIED.
4. **Category Injection**: Creating a product with an invalid category (e.g., "Illegal Flowers").
   - *Expected*: PERMISSION_DENIED.
5. **Timestamp Spoofing**: Sending a manual `createdAt` string instead of `request.time`.
   - *Expected*: PERMISSION_DENIED.
6. **Log Deletion**: Attempting to delete an activity log to hide tracks.
   - *Expected*: PERMISSION_DENIED.
7. **Log Modification**: Attempting to edit an existing activity log.
   - *Expected*: PERMISSION_DENIED.
8. **Owner Spoofing**: Attempting to set `adminEmail` in a log to another user's email.
   - *Expected*: PERMISSION_DENIED.
9. **Massive Payload**: Sending a 1MB string in the product name field.
   - *Expected*: PERMISSION_DENIED (via size constraints).
10. **ID Poisoning**: Attempting to use a 1.5KB string as a `productId`.
    - *Expected*: PERMISSION_DENIED (via `isValidId` check).
11. **Shadow Update**: Attempting to update a product with a hidden `isAdmin: true` field.
    - *Expected*: PERMISSION_DENIED (via `affectedKeys().hasOnly()` check).
12. **Status Shortcut**: Attempting to modify `createdAt` during an update.
    - *Expected*: PERMISSION_DENIED (immortality check).

## Admin Definition
Authorized Admin Emails:
- `fadhlihadisurya@gmail.com` (Project Owner)
