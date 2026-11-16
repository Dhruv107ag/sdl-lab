# LNMIIT CS314 Software Development Laboratory
## Comprehensive Viva Voce Master Guide (Assignments 6 & 7)
### Software Design Modelling: Class, Architecture, Interface & Component-Level Design

**Project:** Hostel Complaint Management System (HCMS)  
**Team ID:** T042  
**Authors:**
- Dhruv Agrawal (24UCS016)
- Sanyam Humad (24UCS017)
- Harshil Agrawal (24UCS018)
- Akshat Khandal (24UCS019)

**Target Use Cases Tracked Across All Assignments:**
1. **UC-003:** Submit Complaint (Student lodging maintenance issue)
2. **UC-008:** Assign Complaint (Warden allocating staff with priority and SLA)
3. **UC-011:** Resolve Complaint & Feedback (Staff marking completion with verification OTP and student rating)

---

## 1. Crucial UML Diagram Comparisons (Frequently Asked by Examiners)

### Comparison 1: Analysis Class Diagram vs. Design Class Diagram
> **Note from Lab Assignment 6 Task 1:** *"Do not simply reproduce the analysis class diagram from Assignment 4. Refine it by adding implementation-oriented details while maintaining consistency with the existing requirements and analysis models."*

| Dimension | Analysis Class Diagram (Assignment 4) | Design Class Diagram (Assignment 6) |
| :--- | :--- | :--- |
| **Primary Objective** | Capture problem-domain entities and conceptual relationships without implementation bias. | Provide an exact, concrete implementation blueprint for developers and database engineers. |
| **Abstraction Level** | Conceptual / Domain level using BCE (Boundary, Control, Entity) analysis patterns. | Implementation / Code level with Controllers, Services, Repositories, DTOs, and Entities. |
| **Attribute Details** | Descriptive business names; types omitted or generic (e.g., `text`, `number`). | Fully typed with language types (e.g., `string`, `int`, `boolean`, `UUID`, `ComplaintStatus` enum). |
| **Visibility & Encapsulation**| No visibility markers; all domain concepts are treated as open concepts. | Strict UML visibility notation: Private (`-`), Public (`+`), Protected (`#`), Package (`~`). |
| **Methods / Operations** | High-level responsibilities (e.g., `validate()`, `notify()`), no parameter or return types. | Complete signatures with parameter lists, types, return types, and exceptions. |
| **Relationships** | Conceptual associations (e.g., "Student files Complaint"). | Explicit navigability arrows, foreign key attributes, collection types, aggregation, and composition. |
| **Persistence / Storage** | Storage-agnostic; no knowledge of tables, primary keys, or relational constraints. | Mapped to physical SQLite tables with primary keys, foreign keys, indices, and constraints. |

* **Viva Punchline:** "Analysis Class Diagram answers **WHAT** concepts exist in the domain; Design Class Diagram answers **HOW** those classes are typed, encapsulated, structured, and wired to execute in code."

---

### Comparison 2: Collaboration (Communication) Diagram vs. Sequence Diagram

Both are UML **Interaction Diagrams** and are semantically equivalent (isomorphic), but they emphasize contrasting views of system behavior:

| Dimension | Collaboration / Communication Diagram | Sequence Diagram |
| :--- | :--- | :--- |
| **Primary Focus** | **Spatial Topology & Object Links:** Emphasizes structural relationships and which objects collaborate. | **Chronological Time Ordering:** Emphasizes the exact timeline and sequence of messages over time. |
| **Layout Style** | Graph/Network layout: Objects are nodes connected by association links. | 2D Grid: Objects horizontally arranged at the top; vertical lifelines moving downwards. |
| **Message Sequencing** | Hierarchical decimal numbers on message arrows (e.g., `1:`, `1.1:`, `1.2:`, `2:`). | Implicit top-to-bottom vertical progression of horizontal message arrows. |
| **Lifetimes & Activation** | Difficult to see when an object is instantiated, active, or destroyed. | Explicit vertical activation boxes (focus of control) and destruction markers (`X`). |
| **Optimal Use** | Visualizing coupling, clustering, and structural cohesion within a module. | Modeling complex procedural logic, asynchronous callbacks, timeouts, and parallel branches. |

* **Viva Punchline:** "Sequence Diagrams show **WHEN** messages flow over a timeline; Collaboration Diagrams show **WHO** communicates with whom across structural links with numbered tags."

---

### Comparison 3: Collaboration Diagram vs. Class Diagram

| Dimension | Class Diagram (Static Structural Model) | Collaboration Diagram (Dynamic Behavioral Model) |
| :--- | :--- | :--- |
| **Model Type** | Static structural model depicting the permanent architectural skeleton. | Dynamic behavioral model showing runtime interactions for a specific use case scenario. |
| **Elements Represented** | Class descriptors (types/blueprints), operations, attributes, and permanent relationships. | Specific runtime object instances (e.g., `student: Student`, `c101: Complaint`) and transient links. |
| **Time & Messages** | No message passing, no chronological time, no execution flow. | Numbered method calls exchanged between active objects during runtime execution. |
| **Lifetime Scope** | Valid for the lifetime and compilation of the software system. | Valid only during the transient execution of a specific transaction or user request. |

---

### Comparison 4: Component Diagram vs. Architectural / Package Diagram

| Dimension | Package / Architectural Diagram | Component Diagram |
| :--- | :--- | :--- |
| **Scope** | Logical grouping of source files, namespaces, classes, and architectural layers. | Physical, deployable, replaceable units of modular software execution. |
| **UML Notations** | Folder tab packages with dashed dependency arrows (`..>`). | Component boxes with tab icons, Provided Interfaces (`--o` lollipop), and Required Interfaces (`--( ` socket). |
| **Replaceability** | Logical organization; cannot simply be swapped at runtime without recompilation. | Black-box replaceable units conforming strictly to declared interface contracts. |

---

### Comparison 5: State Machine Diagram vs. Activity Diagram

| Dimension | State Machine Diagram (Statechart) | Activity Diagram |
| :--- | :--- | :--- |
| **Focal Subject** | **Entity-Centric:** Models the complete lifecycle of a *single object* (e.g., `Complaint`). | **Process-Centric:** Models multi-step workflows, business processes, and control flow across *multiple actors*. |
| **Nodes** | Passive **States** where an entity waits for an event (e.g., `SUBMITTED`, `ASSIGNED`). | Active **Actions / Activities** executing computational tasks (e.g., `Validate Form`, `Send SMS`). |
| **Transitions** | Triggered by *external events* with guard conditions (`event [guard] / action`). | Triggered automatically upon completion of the preceding activity (flow of control). |
| **Partitioning** | Composite states, sub-states, and concurrent regions. | Activity Swimlanes (e.g., Student lane, Warden lane, Staff lane) to denote actor responsibility. |

---

## 2. Task 1: Data & Class Design Viva Questions & Answers

### Q1.1: What are the UML visibility specifiers, and why are attributes made private in design classes?
* `+` **Public:** Accessible by any client class.
* `-` **Private:** Accessible only within the declaring class.
* `#` **Protected:** Accessible by the declaring class and its subclasses (generalization).
* `~` **Package / Default:** Accessible by classes within the same package/module.
* **Why private attributes?** Encapsulation and Information Hiding. Private attributes ensure internal state invariants cannot be bypassed (e.g., mutating `complaint.status` from `SUBMITTED` directly to `RESOLVED` without recording an audit log or assigning staff). All mutations are governed by public validated methods.

### Q1.2: Differentiate between Association, Aggregation, and Composition using HCMS examples.
1. **Association (`---`):** General relationship where classes communicate but have independent lifecycles.
   * *Example:* `Student (1) ------- (0..*) Complaint`.
2. **Aggregation (`◇--->`):** Weak "has-a" relationship; parts can exist without the whole.
   * *Example:* `Hostel (1..*) ◇------- (1..*) MaintenanceStaff`. If a hostel wing closes, the maintenance staff still exist as university employees.
3. **Composition (`◆--->`):** Strong "part-of" relationship; parts have coincident lifecycle with the whole and cannot be shared.
   * *Example:* `Complaint (1) ◆------- (1..*) AuditLogEntry`. If a complaint is purged, its audit trail and status history cannot meaningfully exist on their own and are deleted cascadingly.

### Q1.3: How is the User Generalization hierarchy structured and persisted in SQLite?
* Base class `User` contains: `id`, `name`, `email`, `passwordHash`, `role`, `phone`.
* Specialized subclasses:
  * `Student`: adds `rollNo`, `hostelBlock`, `roomNo`.
  * `HostelWardenAuthority`: adds `hostelAssigned`, `officeRoom`.
  * `MaintenanceStaff`: adds `category` (Skill), `activeTasksCount`, `isAvailable`.
  * `Administrator`: adds `adminLevel`.
* **Database Mapping:** Mapped using **Single Table Inheritance (STI)** in a single `users` table with a discriminator column `role`. This eliminates SQL `JOIN` overhead during high-frequency JWT token verification and login.

---

## 3. Task 2: Architectural Design Viva Questions & Answers

### Q2.1: Which architectural style is chosen for HCMS and why?
* **Selected Style:** **4-Layered Modular Monolith (Layered Architecture)**.
  1. *Presentation Layer:* React SPA (Vite) for client rendering and form validation.
  2. *Routing & Security Layer:* Express routing, JWT authentication, and RBAC middleware.
  3. *Domain / Business Logic Layer:* Core services implementing complaint state machines, SLA rules, and staff dispatching.
  4. *Data Access & Persistence Layer:* SQLite relational database with connection pooling and WAL mode.
* **Justification:** Strict separation of concerns, high maintainability, sub-50ms response times for campus load (~5,000 students), and atomic ACID transactional guarantees.

### Q2.2: Why not Microservices?
* Microservices introduce distributed complexity: network latency, distributed transactions (Saga pattern), eventual consistency, service discovery, container orchestration (Kubernetes), and split-brain risks. For a single campus domain with ~5,000 users, a Modular Monolith offers maximum developer velocity, zero network serialization latency between layers, and transactional integrity.

### Q2.3: How does SQLite handle concurrency when multiple students submit complaints simultaneously?
* SQLite is configured with **WAL (Write-Ahead Logging)** mode (`PRAGMA journal_mode = WAL;`). In WAL mode, concurrent readers never block writers, and writers never block readers.
* Node.js handles I/O asynchronously on a single-threaded event loop, while write queries execute in microsecond bursts (~0.5 ms).
* Configured with `PRAGMA busy_timeout = 5000;`, allowing incoming concurrent write requests to queue and retry automatically for up to 5 seconds rather than failing.

---

## 4. Task 3: Interface Design Viva Questions & Answers (Assignment 7)

### Q3.1: Differentiate between UI Design and Software Interface Design.
* **UI Design (Human-Computer):** Visual wireframes, field layouts, typography, button affordance, input validation error toasts, and navigation flow between pages.
* **Software Interface Design (Machine-Machine):** REST API specifications, HTTP verbs (`GET`, `POST`, `PATCH`), request/response JSON schemas, authentication headers (`Bearer <JWT>`), and HTTP status codes.

### Q3.2: Explain the UI Wireframes for the 3 Use Cases.
1. **UC-003 (Submit Complaint):** Category dropdown, urgency selector, title, multi-line description, room number, file upload widget, and submit button with real-time field validation.
2. **UC-008 (Assign Complaint):** Warden triage dashboard with queue filters, staff workload counter (e.g., "Ramesh: 2 tasks active"), priority override, SLA selector, and "Assign Staff" confirmation modal.
3. **UC-011 (Resolve Complaint & Feedback):** Staff work order completion modal (parts used, work notes, resolution button); Student verification modal with OTP validation and 1-to-5 star rating.

### Q3.3: REST API Contracts for the 3 Use Cases
* `POST /api/complaints`: Body `{ category, title, description, room_no, urgency }` -> `201 Created` with complaint object.
* `PATCH /api/complaints/:id/assign`: Body `{ staff_id, priority, sla_hours }` -> `200 OK` (or `403 Forbidden` if not warden, `409 Conflict` if already assigned).
* `PATCH /api/complaints/:id/resolve`: Body `{ resolution_notes, verification_otp }` -> `200 OK` (or `422 Unprocessable` if wrong status).

---

## 5. Task 4: Component-Level Design Viva Questions & Answers

### Q4.1: What are Provided vs. Required Interfaces in Component-Level Design?
* **Provided Interface (Lollipop `--o`):** The services and operations that a component *exposes* to others (e.g., `IComplaintOperations` provides `submitComplaint()`, `getComplaintById()`).
* **Required Interface (Socket `--(`):** The services that a component *needs from outside* to operate (e.g., `ComplaintCoreComponent` requires `IDataAccess` to persist records and `INotificationService` to alert wardens).

### Q4.2: Processing Logic & Pseudocode Highlights
* **`submitComplaint(studentId, payload)`:**
  1. Validate fields (category, non-empty title, room format).
  2. Verify active student identity.
  3. Query for duplicate complaints submitted in the last 10 minutes.
  4. In a DB transaction: Insert `complaint` record with status `SUBMITTED`, calculate default SLA deadline, and insert initial `audit_log` entry.
  5. Dispatch asynchronous warden notification.
  6. Return `201 Created`.
* **`assignComplaint(complaintId, staffId, wardenId, slaHours)`:**
  1. Verify warden permissions for the hostel block.
  2. Check complaint status: must be `SUBMITTED` or `ESCALATED`.
  3. Check staff availability and workload invariant: `activeTasks < 5`.
  4. In a DB transaction: Update complaint to `ASSIGNED`, set `sla_deadline`, increment `staff.activeTasks`, and record `audit_log`.
  5. Alert assigned staff member.
  6. Return `200 OK`.
* **`resolveComplaint(complaintId, staffId, notes, otp)`:**
  1. Verify assigned staff ID matches the authenticated user.
  2. Guard check: Complaint status must be `ASSIGNED` or `IN_PROGRESS`.
  3. Verify physical OTP matches student ticket OTP.
  4. In a DB transaction: Update status to `RESOLVED`, decrement `staff.activeTasks`, record resolution timestamp, and insert `audit_log`.
  5. Trigger student satisfaction feedback notification.
  6. Return `200 OK`.

---

## 6. Task 5: Design Consistency & Traceability Viva Questions & Answers

### Q5.1: Explain the complete Traceability Pipeline from SRS to Code.
`SRS (FR/NFR)`  
$\rightarrow$ `Use Case Model (UC-003, UC-008, UC-011)`  
$\rightarrow$ `Scenarios & Activity Diagrams (Sunny & exceptional paths)`  
$\rightarrow$ `Analysis Class Model (Boundary, Control, Entity BCE objects)`  
$\rightarrow$ `Collaboration & State Machine Models (Message passing & state lifecycle)`  
$\rightarrow$ `Design Class Model (Implementation types, visibility, DB foreign keys)`  
$\rightarrow$ `Architectural Design (4-Layered Modular Monolith)`  
$\rightarrow$ `Interface Design (UI Wireframes & REST API schemas)`  
$\rightarrow$ `Component-Level Design (Provided/Required interfaces & Pseudocode)`  
$\rightarrow$ `Source Code (Controllers, Services, DB) & Automated Unit Tests`

### Q5.2: What is Requirements Impact Analysis?
When a customer requirement changes, forward traceability allows engineers to trace from the requirement to affected Use Cases, State Machine transitions, Design Classes, REST API contracts, and Component algorithms. This guarantees no orphaned features or silent regressions occur.

---

## 7. Professor Curveball & Real Viva Questions (WhatsApp Qs)

### Q7.1: What are Guard Conditions in UML?
Boolean expressions in square brackets `[condition]` that must evaluate to `TRUE` for a state transition or message to fire (e.g., `[staff.activeTasks < 5]` or `[inputOtp == complaint.otp]`).

### Q7.2: What is the System Boundary of HCMS?
* **Inside:** React frontend, Express backend, JWT auth middleware, complaint state machine, staff assignment engine, SQLite database, and audit log subsystem.
* **Outside:** Human users (Students, Wardens, Staff), Campus LDAP SSO server, Institute SMTP email server, and SMS gateway.

### Q7.3: Take two classes, make a business rule, and explain the ambiguity if both enforce it.
* **Classes:** `Complaint` and `MaintenanceStaff`.
* **Rule:** *"A staff member cannot have more than 5 active complaints concurrently."*
* **Ambiguity:** If `Complaint` checks staff workload, it violates low coupling and information hiding. If `MaintenanceStaff` checks complaints, concurrency race conditions occur when two wardens assign tasks simultaneously.
* **Solution:** Apply **GRASP Information Expert** and introduce a Domain Service `StaffAssignmentService` that acquires a lock on the staff record, verifies the invariant, and binds the complaint atomically within a transaction.

### Q7.4: How is fairness guaranteed in the system?
1. Deterministic FIFO queueing for identical priority.
2. Automated background SLA escalation after 24 hours.
3. Workload-balanced staff assignment suggestions.
4. Tamper-proof audit logging of every status transition.

### Q7.5: How do you validate institutional email domains in code?
* Code check: `email.trim().toLowerCase().endsWith('@lnmiit.ac.in')` or regex `^[a-zA-Z0-9._%+-]+@lnmiit\.ac\.in$`.
* Registration check: Send a cryptographically random token via SMTP with a 15-minute expiration time.

### Q7.6: If given only 48 hours to complete a prototype, what do you prioritize?
Focus exclusively on the core value loop: Student files complaint $\rightarrow$ Warden assigns staff $\rightarrow$ Staff resolves. Strip out photo attachments, dark mode, complex SMS gateways, and analytics charts.

### Q7.7: Compare Evolutionary Prototyping vs. Throwaway Prototyping.
* *Throwaway:* Quick disposable UI mock-up built to clarify vague requirements, discarded before development.
* *Evolutionary:* High-quality initial modular foundation that is iteratively refined and hardened into production software. Ideal for HCMS because requirements were already established in the SRS.

### Q7.8: What is the difference between a Feature and a Function?
* **Feature:** A user-facing capability delivering business value (e.g., *"Automated SLA Escalation"*).
* **Function:** An internal programmatic subroutine executing a computation (e.g., `calculateSlaDeadline(category, urgency)`).

---

## 8. Rapid-Fire 2-Minute Viva Voce Cheat Sheet
* **UML:** Unified Modeling Language (OMG industry standard for object-oriented modeling).
* **Analysis vs Design Class:** Conceptual domain entity (BCE) vs. Implementation-ready blueprint with types, visibility, and DB mapping.
* **GRASP:** General Responsibility Assignment Software Patterns (Information Expert, Controller, Low Coupling, High Cohesion).
* **SOLID:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
* **Aggregation vs Composition:** Weak "has-a", shared lifecycles (`Hostel ◇--> Staff`) vs. Strong "part-of", shared lifecycle (`Complaint ◆--> AuditLog`).
* **Provided vs Required Interface:** What a component provides (`--o`) vs. what it requires (`--(`).
* **SQLite WAL Mode:** Write-Ahead Logging; concurrent readers do not block writers.
* **SLA:** Service Level Agreement; formal resolution deadline (Emergency = 4 hrs, Routine = 48 hrs).
