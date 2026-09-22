# PrescribeRx endpoints: 216 paths, 269 ops, 28 tags

## Auth (7)
POST   /auth/login  -- Login
POST   /auth/refresh  -- Refresh token
POST   /auth/logout  -- Logout
GET    /auth/me  -- Get current user
POST   /auth/password/forgot  -- Request password reset
POST   /auth/password/reset  -- Reset password
POST   /auth/logout-all  -- Log out from all devices

## BulkOrders (5)
POST   /bulk-orders  -- Submit a bulk order (async)
POST   /bulk-orders/cancel  -- Cancel a bulk order (by patient identifiers)
GET    /bulk-orders/{requestId}/status  -- Poll bulk-order status
GET    /bulk-orders/{bulkOrderId}/prescription  -- View bulk-order prescription (HTML)
GET    /bulk-orders/{bulkOrderId}/prescription/pdf  -- Download bulk-order prescription (PDF)

## Chat (2)
GET    /chat/agent-init/{agent_code}  -- Bootstrap a chat widget — return public branding + opening message
POST   /chat/protocol-suggest  -- Send one chat turn → get reply + 0–N product suggestions

## Clients (16)
GET    /clients  -- List clients
POST   /clients  -- Create a client
GET    /clients/{id}/pricing  -- Read client custom pricing
PUT    /clients/{id}/pricing  -- Set client custom pricing (flat per-product)
GET    /clients/{id}/orders  -- List a client's orders
POST   /clients/{id}/staged-orders  -- Place an order for a client (order mirror)
GET    /clients/{id}  -- Get a client
PUT    /clients/{id}  -- Update a client
DELETE /clients/{id}  -- Delete a client
GET    /clients/{id}/patients  -- List a client's patients
GET    /clients/{id}/users  -- List a client's users
PUT    /clients/{id}/settings  -- Update client settings
GET    /clients/{clientId}/addresses  -- List a client's addresses
POST   /clients/{clientId}/addresses  -- Add a client address
PUT    /clients/{clientId}/addresses/{addressId}  -- Update a client address
DELETE /clients/{clientId}/addresses/{addressId}  -- Delete a client address

## Encounters (17)
GET    /encounters  -- List encounters (tenant-scoped)
POST   /encounters  -- Create encounter
GET    /encounters/{id}  -- Get encounter detail
PUT    /encounters/{id}  -- Update non-clinical encounter fields (alias of PATCH)
PATCH  /encounters/{id}  -- Update non-clinical encounter fields
PUT    /encounters/{id}/status  -- Update encounter status
PATCH  /encounters/{id}/answers  -- Amend / append intake answers without creating a new encounter
POST   /encounters/{id}/assign  -- Assign provider to encounter
GET    /encounters/{id}/video-token  -- Get video consultation token
POST   /encounters/{id}/complete  -- Complete encounter
GET    /encounters/{id}/video-room  -- Get the scheduled video room + durable join link
POST   /encounters/{id}/schedule  -- Attach a scheduled time to an existing encounter
POST   /encounters/{id}/reschedule  -- Reschedule a scheduled (or no-showed) video visit
POST   /encounters/{id}/no-show  -- Mark a scheduled video visit as a no-show
GET    /encounters/queue  -- Global encounter queue + statistics
GET    /encounters/{id}/messages  -- Encounter conversation messages (poll)
POST   /encounters/{id}/messages  -- Send an encounter message

## ExternalTelehealth (3)
POST   /external-telehealth/providers  -- Register an external provider
GET    /external-telehealth/providers/{npi}  -- Look up provider(s) by NPI
POST   /external-telehealth/orders  -- Submit a prescription order

## LabCatalog (10)
GET    /lab-panels  -- List lab panels (with nested tests + biomarkers)
GET    /lab-panels/{id}  -- Get a single lab panel (full nested detail)
GET    /lab-tests  -- List individual lab tests (Rupa-synced or custom)
GET    /lab-tests/{id}  -- Get a single lab test
GET    /biomarkers  -- List system biomarkers (canonical reference data)
GET    /biomarkers/{id}  -- Get a single biomarker (with its panels)
GET    /encounter-types/{encounterTypeId}/lab-requirements  -- Lab panels required for an encounter type
GET    /patients/{patientChartId}/biomarkers/trends  -- Time-series biomarker history (charting data)
GET    /patients/{patientChartId}/lab-summary  -- Patient lab order summary (one row per order)
GET    /encounters/{encounterId}/lab-requirements  -- Lab requirements RESOLVED for a specific encounter

## LabOrders (9)
POST   /telehealth/lab-orders  -- Create lab order
GET    /telehealth/lab-orders/{id}  -- Get lab order detail
POST   /lab-orders  -- Create lab order(s) — panel-centric (L5.D)
GET    /lab-orders  -- List lab orders (tenant-scoped)
POST   /lab-orders/{id}/results/upload  -- Upload a results PDF and trigger Textract extraction
GET    /lab-orders/{id}/results  -- Read structured biomarker results for a lab order
GET    /encounters/{id}/labs  -- List an encounter's lab orders
GET    /patients/{patientChartId}/labs  -- List a chart's lab orders
GET    /lab-orders/{id}  -- Get a lab order (with results)

## Me (5)
GET    /me  -- Get current user profile
PUT    /me  -- Update current user profile
PUT    /me/password  -- Change current user password
GET    /me/settings  -- Get current user settings
PUT    /me/settings  -- Update current user settings

## Orders (11)
GET    /orders  -- List orders
GET    /orders/{id}  -- Get order detail
POST   /orders/patient  -- Create patient order
POST   /orders/batch-status  -- Batch status check
PATCH  /orders/{id}/payment-reference  -- Attach an external payment reference
POST   /orders/{id}/cancel  -- Cancel order
POST   /orders/{id}/record-reversal  -- Record an externally-executed reversal (refund or void)
GET    /orders/{id}/fulfillments  -- Get order fulfillments
GET    /orders/{id}/transactions  -- Get order transactions
POST   /orders/bulk  -- Create a bulk order (synchronous checkout)
POST   /patient-orders  -- Create a patient encounter (intake + vault payment)

## Packages (2)
GET    /packages  -- List packages (tenant-scoped, paginated, nested)
GET    /packages/{id}  -- Get package detail

## PatientPortal (40)
GET    /me/patient  -- Get my patient chart summary
PUT    /me/patient  -- Update my patient chart fields
GET    /me/patient/dashboard  -- Patient dashboard payload (latest vitals, encounters, orders, goals)
GET    /me/patient/encounters  -- My encounters
GET    /me/patient/orders  -- My orders
GET    /me/patient/prescriptions  -- My prescriptions
GET    /me/patient/orders/{order}/tracking  -- Order tracking
GET    /me/patient/approvals  -- List provider-added items awaiting my review
POST   /me/patient/approvals/{approval}/accept  -- Accept (approve + pay for) a provider-added item
POST   /me/patient/approvals/{approval}/decline  -- Decline a provider-added item
GET    /me/patient/payment-methods  -- My vaulted payment methods (read-only)
GET    /me/patient/conversations  -- My conversations
GET    /me/patient/conversations/{conversation}/messages  -- Conversation messages
POST   /me/patient/conversations/{conversation}/messages  -- Send a message
POST   /me/patient/encounters/{encounter}/conversation  -- Open the encounter conversation
GET    /me/patient/communication-preferences  -- Communication preferences
PUT    /me/patient/communication-preferences  -- Update communication preferences
POST   /me/patient/coupons/validate  -- Validate / preview a coupon
POST   /me/patient/export  -- Request a data export (HIPAA right of access)
GET    /me/patient/export/{export}  -- Data export status
GET    /me/patient/export/{export}/download  -- Download a ready data export
GET    /me/patient/vitals  -- My vitals (paginated history)
POST   /me/patient/vitals  -- Record a generic vital reading
POST   /me/patient/vitals/weight  -- Record a weight reading
POST   /me/patient/vitals/blood-pressure  -- Record a blood pressure reading
POST   /me/patient/vitals/glucose  -- Record a glucose reading
GET    /me/patient/vitals/trends  -- My vitals trend series (weight / BP / glucose chart data)
GET    /me/patient/vitals/goals  -- Get my vitals goals (target weight / BP / etc.)
PUT    /me/patient/vitals/goals  -- Update my vitals goals
GET    /me/patient/allergies  -- My allergies
POST   /me/patient/allergies  -- Add an allergy
DELETE /me/patient/allergies/{id}  -- Remove one of my allergies
GET    /me/patient/medications  -- My medications
POST   /me/patient/medications  -- Add a medication
DELETE /me/patient/medications/{id}  -- Remove one of my medications
GET    /me/patient/conditions  -- My conditions
POST   /me/patient/conditions  -- Add a condition
DELETE /me/patient/conditions/{id}  -- Remove one of my conditions
GET    /me/patient/encounters/{encounterId}/requirements  -- What a held encounter still needs
POST   /me/patient/encounters/{encounterId}/provide-information  -- Provide missing information for a held encounter

## PatientVitals (10)
GET    /patient-vitals  -- List patient vitals (filterable, paginated)
POST   /patient-vitals  -- Create a vital reading
GET    /patient-vitals/{id}  -- Get a single vital reading
PUT    /patient-vitals/{id}  -- Update a vital reading
DELETE /patient-vitals/{id}  -- Delete a vital reading
GET    /patient-vitals/patient/{patientChartId}/history  -- Vital history for a patient chart
GET    /patient-vitals/patient/{patientChartId}/trends  -- Trend analytics for a patient chart
GET    /patient-vitals/patient/{patientChartId}/latest  -- Latest reading per type for a patient chart
GET    /patient-vitals/patient/{patientChartId}/weight-loss-progress  -- Weight-loss progress vs goal
POST   /patient-vitals/calculate-projection  -- Project weight curve given current weight + goal + timeframe

## Patients (38)
GET    /patients  -- List patients
POST   /patients  -- Create patient
GET    /patients/search  -- Search patients
PATCH  /patients/{id}  -- Update a patient (partial)
GET    /patients/{id}  -- Get patient detail
PUT    /patients/{id}  -- Update patient
DELETE /patients/{id}  -- Delete patient (soft delete)
POST   /patients/{id}/issue-token  -- Issue a patient-scoped portal token
GET    /patients/{patientId}/allergies  -- List patient allergies
POST   /patients/{patientId}/allergies  -- Add patient allergy
GET    /patients/{patientId}/medications  -- List patient medications
POST   /patients/{patientId}/medications  -- Add patient medication
GET    /patients/{patientId}/conditions  -- List patient conditions
POST   /patients/{patientId}/conditions  -- Add patient condition
GET    /patients/{patientId}/addresses  -- List patient addresses
POST   /patients/{patientId}/addresses  -- Add patient address
GET    /patients/{patientId}/documents  -- List patient documents
POST   /patients/{patientId}/documents  -- Upload patient document
GET    /patients/{patientId}/consents  -- List patient consents
POST   /patients/{patientId}/consents  -- Record patient consent
GET    /patients/{patientId}/consents/summary  -- Get consent summary
GET    /patients/lookup  -- Look up a patient by email (dedup)
GET    /patients/{patientChartId}/vitals  -- List a chart's vitals
POST   /patients/{patientChartId}/vitals  -- Record a vital for a chart
PUT    /patients/{patientId}/allergies/{allergyId}  -- Update a patient allergy
DELETE /patients/{patientId}/allergies/{allergyId}  -- Delete a patient allergy
PUT    /patients/{patientId}/medications/{medicationId}  -- Update a patient medication
DELETE /patients/{patientId}/medications/{medicationId}  -- Delete a patient medication
PUT    /patients/{patientId}/conditions/{conditionId}  -- Update a patient condition
DELETE /patients/{patientId}/conditions/{conditionId}  -- Delete a patient condition
PUT    /patients/{patientId}/addresses/{addressId}  -- Update a patient address
DELETE /patients/{patientId}/addresses/{addressId}  -- Delete a patient address
GET    /patients/{patientId}/consents/{consentId}  -- Get a consent record
POST   /patients/{patientId}/consents/{consentId}/revoke  -- Revoke a consent
GET    /patients/{patientId}/documents/identity-check  -- Identity-document upload/verify status
GET    /patients/{patientId}/documents/{documentId}  -- Get a patient document
DELETE /patients/{patientId}/documents/{documentId}  -- Delete a patient document
POST   /patients/{patientId}/documents/{documentId}/verify  -- Verify a patient document

## PaymentMethods (3)
GET    /payment-methods/{patientChartId}  -- List vaulted cards
POST   /payment-methods  -- Vault a new payment method
DELETE /payment-methods/{id}  -- Delete payment method

## Payments (1)
GET    /merchant-accounts  -- List connected merchant accounts (redacted)

## Peptides (2)
GET    /peptides  -- List peptides
GET    /peptides/{peptide}  -- Get a peptide

## Prescriptions (7)
GET    /prescriptions  -- List prescriptions (tenant-scoped)
GET    /prescriptions/{id}  -- Get prescription detail
PUT    /prescriptions/{id}/status  -- Update prescription status (provider only)
POST   /prescriptions/{id}/cancel  -- Cancel a prescription
POST   /encounters/{encounterId}/prescribe  -- Prescribe for an encounter
POST   /encounters/{encounterId}/prescribe/validate  -- Validate a prescription (dry run)
POST   /prescriptions/{id}/refill  -- Request a prescription refill

## Pricing (4)
POST   /pricing/validate-coupon  -- Validate coupon code
POST   /pricing/preview  -- Preview cart pricing
POST   /pricing/shipping-rates  -- Get shipping rate quotes
GET    /pricing/client/{clientId}  -- Get a client's custom pricing

## Products (7)
GET    /products  -- List products
GET    /products/{id}  -- Get product detail
GET    /products/{id}/packages  -- List product packages
GET    /products/{id}/doses  -- List product doses
GET    /catalog  -- Comprehensive scoped catalog (products + packages + plans + items)
GET    /product-classes  -- List product classes
GET    /product-types  -- List product types

## Providers (7)
GET    /providers  -- List providers
GET    /providers/{id}  -- Get a provider
PUT    /providers/{id}  -- Update a provider
PUT    /providers/{id}/availability  -- Update provider availability
GET    /providers/{id}/encounters  -- List a provider's encounters
GET    /providers/{id}/licenses  -- List a provider's licenses
PUT    /providers/{id}/signature  -- Update provider signature

## SalesOrganizations (8)
GET    /sales-organizations  -- List sales organizations
POST   /sales-organizations  -- Create a sales organization
GET    /sales-organizations/{id}  -- Get a sales organization
PUT    /sales-organizations/{id}  -- Update a sales organization
DELETE /sales-organizations/{id}  -- Delete a sales organization
GET    /sales-organizations/{id}/children  -- List direct child organizations
GET    /sales-organizations/{id}/clients  -- List an org's clients
GET    /sales-organizations/{id}/orders  -- List an org's orders

## Scheduling (15)
GET    /scheduling/availability/slots  -- Get available appointment slots
GET    /scheduling/availability/providers  -- Get available providers
GET    /scheduling/appointments  -- List appointments
POST   /scheduling/appointments  -- Book appointment
GET    /scheduling/appointments/{id}  -- Get appointment detail
PUT    /scheduling/appointments/{id}  -- Update appointment
POST   /scheduling/appointments/{id}/cancel  -- Cancel appointment
POST   /scheduling/appointments/{id}/reschedule  -- Reschedule appointment
GET    /providers/{providerId}/schedule  -- List a provider's weekly schedule
POST   /providers/{providerId}/schedule  -- Add a weekly schedule block
PUT    /providers/{providerId}/schedule/{scheduleId}  -- Update a weekly schedule block
DELETE /providers/{providerId}/schedule/{scheduleId}  -- Delete a weekly schedule block
POST   /providers/{providerId}/schedule/overrides  -- Add a schedule override (block/add a specific date)
DELETE /providers/{providerId}/schedule/overrides/{overrideId}  -- Delete a schedule override
POST   /scheduling/appointments/{id}/confirm  -- Confirm an appointment

## Subscriptions (16)
GET    /subscriptions  -- List subscriptions
POST   /subscriptions  -- Create subscription
GET    /subscriptions/{id}  -- Get a subscription
PUT    /subscriptions/{id}  -- Update subscription
POST   /subscriptions/{id}/pause  -- Pause subscription
POST   /subscriptions/{id}/swap-product  -- Request a product swap (provider-review gated)
POST   /subscriptions/{id}/cancel  -- Cancel subscription
POST   /subscriptions/{id}/resume  -- Resume paused subscription
POST   /subscriptions/{id}/refill-request  -- Request a refill
PATCH  /subscriptions/{id}/payment-method  -- Update the card on file for future rebills
POST   /subscriptions/{id}/refund  -- Refund a subscription charge (pre-fulfillment only)
POST   /subscriptions/{id}/discount  -- Apply a discount to forward billing
POST   /subscriptions/{id}/reassessment  -- Get (or open) the reassessment consult for a subscription
POST   /subscriptions/{id}/external-refill  -- External "paid & ready" refill (externally-billed subs)
POST   /subscriptions/{id}/charge  -- Staff one-off (ad-hoc) charge on the vaulted card
POST   /subscriptions/{id}/billing-mode  -- Toggle a subscription between external and platform billing

## Telehealth (7)
POST   /telehealth/shipping-eligibility  -- Pre-intake shipping eligibility
GET    /telehealth/encounter-types  -- List encounter types
GET    /telehealth/encounter-types/{encounterType}/schema  -- Get encounter type schema
POST   /telehealth/preclusions/evaluate  -- Evaluate preclusions in real-time
POST   /telehealth/intake/unified  -- Unified intake -- create patient + encounter + answers
GET    /telehealth/products  -- List telehealth products
GET    /telehealth/encounters/{encounterId}/status  -- Get encounter status with order tracking

## Terminology (6)
GET    /telehealth/medications  -- Search medications
GET    /telehealth/allergies  -- Search allergies
GET    /telehealth/conditions  -- Search conditions
GET    /terminology/allergies/search  -- Search allergens (typeahead)
GET    /terminology/conditions/search  -- Search conditions (typeahead)
GET    /terminology/medications/search  -- Search medications (typeahead)

## Transactions (1)
POST   /transactions/external  -- Record external transaction

## Webhooks (10)
GET    /webhooks  -- List webhook subscriptions
POST   /webhooks  -- Create webhook subscription
GET    /webhooks/event-types  -- List subscribable event types
GET    /webhooks/{subscription}  -- Get webhook subscription
PUT    /webhooks/{subscription}  -- Update webhook subscription
DELETE /webhooks/{subscription}  -- Delete webhook subscription
POST   /webhooks/{subscription}/test  -- Send a test delivery
POST   /webhooks/{subscription}/rotate-secret  -- Rotate signing secret
POST   /webhooks/{subscription}/re-enable  -- Re-enable an auto-disabled subscription
GET    /webhooks/{subscription}/delivery-logs  -- List delivery logs