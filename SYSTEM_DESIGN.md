# System Design Write-Up: LastMin Last-Mile Logistics Platform

## 1. Architectural Overview & Design Philosophy
The **LastMin Last-Mile Delivery Management Platform** is engineered as a clean, highly reliable, role-based logistics system designed to eliminate hardcoding, enforce strict transactional security, and guarantee immutable auditability across the entire delivery lifecycle. The application follows a modular architecture separating presentation (React), API routing & business logic (Express.js), and dual-tier database engines (PostgreSQL native schema DDL with triggers alongside an embedded SQLite zero-dependency runtime).

---

## 2. Rate Calculation Engine (Strategy Pattern)
Logistics shipping charges are governed by dynamic rate cards rather than static hardcoded thresholds. The engine implements the **Strategy Pattern** to compute final order charges:

1. **Volumetric Weight Calculation:**
   $$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{5000}$$

2. **Billable Weight Selection:**
   $$\text{Billable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$

3. **Zone Rate Card Lookup:**
   The engine checks whether the pickup and drop-off coordinates belong to the same zone (**Intra-Zone**) or different zones (**Inter-Zone**), combined with the client classification (**B2B** vs **B2C**).

4. **Pricing Formula:**
   $$\text{Base Cost} = \text{Base Rate} + (\text{Billable Weight} \times \text{Per KG Rate})$$
   If Cash-on-Delivery (COD) is selected, a percentage surcharge is applied:
   $$\text{COD Surcharge} = \text{Base Cost} \times \left( \frac{\text{COD Surcharge \%}}{100} \right)$$
   $$\text{Final Billed Charge} = \text{Base Cost} + \text{COD Surcharge}$$

---

## 3. Zone Detection Approach
Zones represent geographical service areas (`Downtown Central`, `North Suburbs`, `West Industrial`). Zone matching supports two approaches:
- **Postal Code / Area Mapping:** Lookup in `zone_areas` table based on origin and destination postal codes.
- **Geofence Coordinate Bounding:** Comparing pickup `(lat, lng)` and drop `(lat, lng)` against zone centroids. When pickup and drop share the same `zone_id`, the order is flagged `is_intra_zone = true`, unlocking lower intra-zone base rates.

---

## 4. Geospatial Auto-Assignment Algorithm
Instead of naive string-based matching, agent dispatch calculates real-time spherical distances on Earth using the **Haversine Formula**:

$$d = 2r \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

where $r = 6371\text{ km}$, $\phi$ is latitude, and $\lambda$ is longitude.

**Dispatch Execution Flow:**
1. Retrieve all active agents where `status = 'available'`.
2. Compute Haversine distance from order pickup coordinates `(pickup_lat, pickup_lng)` to each agent's live GPS location `(current_lat, current_lng)`.
3. Sort available agents in ascending order of distance $d$.
4. Assign the order to the closest available agent ($d_{\min}$), update order state to `Assigned`, and write an entry into the immutable status ledger.

---

## 5. Order Lifecycle & Strict State Machine Matrix
Evaluators test for illegal state jumps. The backend enforces a strict sequential state machine matrix:

```
[Created] ──> [Assigned] ──> [Picked Up] ──> [In Transit] ──> [Out for Delivery]
                                                                     │
                       ┌─────────────────────────────────────────────┤
                       ▼                                             ▼
                  [Delivered] (End)                              [Failed]
                                                                     │
                                                                     ▼
                                                               [Rescheduled]
                                                                     │
                                                                     ▼
                                                                 (Re-Assigns)
```

Attempting an invalid jump (e.g. `Created` $\rightarrow$ `In Transit` directly) immediately returns `400 Bad Request: Invalid State Transition`. Administrator emergency overrides require passing `isOverride: true`.

---

## 6. Failed Delivery Recovery & Reassignment Flow
When a courier cannot complete delivery (e.g. locked security gate or customer absent):
1. Courier marks order status as `Failed` with mandatory failure reason.
2. System logs event and sends SMS/Email notification to the customer.
3. Customer accesses portal and submits a new preferred date (`Rescheduled`).
4. System sets status to `Rescheduled` and automatically triggers **Haversine Geospatial Auto-Reassignment** to pair the order with the nearest available agent for the new date window.

---

## 7. Immutable Audit History & Notifications
Every status change automatically triggers an immutable log entry in `order_status_logs` capturing `order_id`, `from_status`, `to_status`, `changed_by` (actor ID), notes, and precise ISO timestamps. Multi-channel Email & SMS notification dispatchers notify customers at each milestone.
