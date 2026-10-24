import os
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    # Try common Windows TrueType fonts, fallback to default
    font_names = ["segoeui.ttf", "arial.ttf", "tahoma.ttf", "calibri.ttf"]
    if bold:
        font_names = ["segouib.ttf", "arialbd.ttf", "tahomabd.ttf", "calibrib.ttf"]
    for name in font_names:
        font_path = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", name)
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_header(draw, title, subtitle, width):
    draw.rectangle([(0, 0), (width, 80)], fill="#1E293B")
    font_title = get_font(24, bold=True)
    font_sub = get_font(14)
    draw.text((30, 15), title, fill="#F8FAFC", font=font_title)
    draw.text((30, 48), subtitle, fill="#94A3B8", font=font_sub)

def render_class_diagram(output_path):
    width, height = 1800, 1300
    img = Image.new("RGB", (width, height), "#F1F5F9")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Hostel Complaint Management System - UML Design Class Diagram", 
                "Assignment 6 Deliverable | Team T042 | CS314 | Standard Design Class Model", width)

    # Class card helper
    def draw_class(x, y, w, h, class_name, stereotype, attributes, methods, fill_color="#FFFFFF", border_color="#334155"):
        # Shadow
        draw.rectangle([(x+4, y+4), (x+w+4, y+h+4)], fill="#E2E8F0")
        # Body
        draw.rectangle([(x, y), (x+w, y+h)], fill=fill_color, outline=border_color, width=2)
        # Header banner
        draw.rectangle([(x, y), (x+w, y+40)], fill="#E0E7FF", outline=border_color, width=2)
        
        f_stereo = get_font(11)
        f_name = get_font(14, bold=True)
        f_body = get_font(12)
        
        if stereotype:
            draw.text((x + 10, y + 4), f"<<{stereotype}>>", fill="#4338CA", font=f_stereo)
            draw.text((x + 10, y + 18), class_name, fill="#1E1B4B", font=f_name)
        else:
            draw.text((x + 10, y + 10), class_name, fill="#1E1B4B", font=f_name)
            
        # Attributes divider
        curr_y = y + 48
        for attr in attributes:
            draw.text((x + 10, curr_y), attr, fill="#1E293B", font=f_body)
            curr_y += 18
            
        curr_y += 6
        draw.line([(x, curr_y), (x+w, curr_y)], fill="#CBD5E1", width=1)
        curr_y += 6
        
        # Methods
        for m in methods:
            draw.text((x + 10, curr_y), m, fill="#0F172A", font=f_body)
            curr_y += 18

    # 1. Base User
    draw_class(750, 110, 320, 240, "User", "entity", 
               ["- userId: String [PK]", "- name: String", "- email: String [Unique]", "- passwordHash: String", 
                "- contactNumber: String", "- role: Enum", "- accountStatus: Enum", "- createdAt: DateTime"],
               ["+ login(credentials): SessionToken", "+ logout(): Boolean", "+ updateProfile(details): Boolean"])

    # 2. Subclasses of User
    draw_class(60, 420, 280, 170, "Student", "entity",
               ["- studentId: String"],
               ["+ submitComplaint(details, file): Complaint", "+ viewStatus(complaintId): Status", 
                "+ viewOwnComplaints(): List<Complaint>", "+ viewHistory(complaintId): List"])

    draw_class(370, 420, 310, 180, "HostelWardenAuthority", "entity",
               ["- authorityId: String", "- assignedBlock: String"],
               ["+ reviewComplaint(complaintId): Boolean", "+ categorizeComplaint(id, catId): Boolean",
                "+ prioritizeComplaint(id, p): Boolean", "+ assignComplaint(id, staffId): Assign",
                "+ rejectComplaint(id, reason): Boolean", "+ closeComplaint(id): Boolean"])

    draw_class(710, 420, 310, 160, "MaintenanceStaff", "entity",
               ["- staffId: String", "- specialization: String"],
               ["+ viewAssignedComplaints(): List", "+ startWork(complaintId): Boolean",
                "+ updateProgress(id, remarks): Boolean", "+ recordResolution(id, details): Res"])

    draw_class(1050, 420, 260, 140, "Administrator", "entity",
               ["- adminId: String"],
               ["+ manageUsers(): List<User>", "+ createDemoUser(data): User", "+ toggleAccountStatus(userId): Bool"])

    draw_class(1340, 420, 260, 140, "InstituteManagement", "entity",
               ["- managementId: String"],
               ["+ viewExecutiveSummary(): Summary", "+ viewCategoryBreakdown(): Map"])

    # 3. Core Business Entities
    draw_class(60, 680, 380, 290, "Complaint", "entity",
               ["- complaintId: String [PK]", "- studentId: String [FK]", "- categoryId: String [FK]",
                "- title: String", "- description: String", "- hostelBlock: String", "- roomNumber: String",
                "- priority: Enum (Low,Med,High,Urg)", "- currentStatus: Enum (7 States)", "- imageUrl: String",
                "- submissionDateTime: DateTime", "- closedDateTime: DateTime"],
               ["+ validateComplaint(): Boolean", "+ create(): Complaint", 
                "+ updateStatus(newStatus, actor, note): Bool", "+ retrieveHistory(): List<History>"])

    draw_class(500, 680, 280, 150, "ComplaintCategory", "entity",
               ["- categoryId: String [PK]", "- categoryName: String", "- description: String", "- isActive: Boolean"],
               ["+ validateCategory(): Boolean", "+ checkAvailability(): Boolean"])

    draw_class(840, 680, 330, 200, "ComplaintAssignment", "entity",
               ["- assignmentId: String [PK]", "- complaintId: String [FK]", "- staffId: String [FK]",
                "- assignedBy: String [FK]", "- assignmentDateTime: DateTime", "- assignmentStatus: Enum", "- remarks: String"],
               ["+ assignStaff(): Boolean", "+ validateAssignment(): Boolean", "+ reassign(newStaffId): Boolean"])

    draw_class(1230, 680, 320, 190, "Resolution", "entity",
               ["- resolutionId: String [PK]", "- complaintId: String [FK]", "- resolutionDetails: String",
                "- resolvedBy: String [FK]", "- resolutionDateTime: DateTime"],
               ["+ validateResolution(): Boolean", "+ recordResolution(): Boolean"])

    draw_class(60, 1030, 400, 180, "ComplaintStatusHistory", "entity",
               ["- historyId: String [PK]", "- complaintId: String [FK]", "- previousStatus: String",
                "- newStatus: String", "- changedBy: String [FK]", "- changeDateTime: DateTime", "- comments: String"],
               ["+ recordStatusChange(): Boolean", "+ retrieveHistory(): List<History>"])

    # Draw inheritance lines
    def draw_arrow(start, end, label=""):
        draw.line([start, end], fill="#475569", width=2)
        if label:
            draw.text(((start[0]+end[0])//2, (start[1]+end[1])//2 - 14), label, fill="#334155", font=get_font(11, bold=True))

    # User generalizations
    draw_arrow((910, 350), (910, 380))
    draw_arrow((200, 380), (1470, 380))
    draw_arrow((200, 380), (200, 420), "extends")
    draw_arrow((525, 380), (525, 420), "extends")
    draw_arrow((865, 380), (865, 420), "extends")
    draw_arrow((1180, 380), (1180, 420), "extends")
    draw_arrow((1470, 380), (1470, 420), "extends")

    # Associations
    draw_arrow((200, 590), (200, 680), "1 submits 0..*")
    draw_arrow((500, 750), (440, 750), "1 classifies 0..*")
    draw_arrow((440, 810), (840, 810), "1 has (composition) 0..*")
    draw_arrow((440, 870), (1230, 870), "1 concludes (composition) 0..1")
    draw_arrow((250, 970), (250, 1030), "1 tracks (composition) 0..*")
    draw_arrow((865, 580), (980, 680), "1 receives 0..*")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

def render_arch_diagram(output_path):
    width, height = 1500, 900
    img = Image.new("RGB", (width, height), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Hostel Complaint Management System - Architectural Diagram",
                "Assignment 6 Deliverable | Monolithic Multi-Tier Architecture (React + Express + SQLite)", width)

    f_box = get_font(13, bold=True)
    f_txt = get_font(11)

    def draw_layer(y, h, title, fill_color, border_color):
        draw.rectangle([(40, y), (width - 40, y + h)], fill=fill_color, outline=border_color, width=2)
        draw.text((60, y + 10), title, fill="#0F172A", font=get_font(16, bold=True))

    def draw_comp(x, y, w, h, name, desc):
        draw.rectangle([(x+3, y+3), (x+w+3, y+h+3)], fill="#E2E8F0")
        draw.rectangle([(x, y), (x+w, y+h)], fill="#FFFFFF", outline="#475569", width=2)
        draw.text((x + 12, y + 12), name, fill="#1E293B", font=f_box)
        draw.text((x + 12, y + 36), desc, fill="#64748B", font=f_txt)

    # Layer 1: Client
    draw_layer(100, 140, "1. Presentation Layer (Client - React Single Page Application)", "#EFF6FF", "#3B82F6")
    draw_comp(70, 145, 250, 75, "Student Dashboard", "Submission form, track status, photo upload")
    draw_comp(345, 145, 250, 75, "Hostel Authority Portal", "Review, prioritize, assign, reject, close")
    draw_comp(620, 145, 250, 75, "Maintenance Staff View", "Assigned queue, work remarks, resolution")
    draw_comp(895, 145, 250, 75, "Administrator Panel", "User accounts, role allocation, active status")
    draw_comp(1170, 145, 250, 75, "Institute Overview", "Executive summary stats & KPI cards")

    # Layer 2: API & Routing
    draw_layer(290, 140, "2. API & Security Layer (Node.js & Express Router)", "#F0FDF4", "#22C55E")
    draw_comp(70, 335, 330, 75, "Auth & Role Guard Middleware", "JWT / session token check, RBAC policy")
    draw_comp(425, 335, 330, 75, "Multer Upload Middleware", "Strict image type check, 2MB size limit")
    draw_comp(780, 335, 630, 75, "Express REST Endpoints (/api/...)", "Routes: /auth, /complaints, /assignments, /resolutions, /admin, /summary")

    # Layer 3: Business Logic
    draw_layer(480, 150, "3. Business Logic & Service Layer", "#FAF5FF", "#A855F7")
    draw_comp(70, 525, 250, 85, "Auth Service", "Bcrypt hash verify, session lifecycle")
    draw_comp(345, 525, 250, 85, "Complaint Workflow Service", "Validation, state transitions (7 states)")
    draw_comp(620, 525, 250, 85, "Assignment Service", "Staff eligibility, assignment state logic")
    draw_comp(895, 525, 250, 85, "Resolution Service", "Resolution verification, closure rules")
    draw_comp(1170, 525, 250, 85, "Audit History Service", "ACID logging of every status update")

    # Layer 4: Data Layer
    draw_layer(680, 160, "4. Data Access & Persistent Storage Layer", "#FFFBEB", "#F59E0B")
    draw_comp(70, 730, 480, 85, "Database Access Adapter (SQLite Engine)", "Parameterized queries, Foreign Keys ON, ACID transactions")
    draw_comp(580, 730, 400, 85, "SQLite Relational Database (database.sqlite)", "Tables: users, categories, complaints, assignments, history")
    draw_comp(1010, 730, 400, 85, "Static Uploads Store (/uploads)", "Local disk storage for optional complaint images")

    # Connectors
    for x in [200, 470, 750, 1020, 1290]:
        draw.line([(x, 240), (x, 290)], fill="#3B82F6", width=2)
    for x in [230, 590, 1090]:
        draw.line([(x, 430), (x, 480)], fill="#22C55E", width=2)
    for x in [200, 470, 750, 1020, 1290]:
        draw.line([(x, 630), (x, 680)], fill="#A855F7", width=2)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

def render_comp_diagram(output_path):
    width, height = 1500, 950
    img = Image.new("RGB", (width, height), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    draw_header(draw, "Hostel Complaint Management System - Component Design Diagram",
                "Assignment 7 Deliverable | Refined Component Architecture & Interface Specifications", width)

    f_comp = get_font(13, bold=True)
    f_sub = get_font(11)

    def draw_cbox(x, y, w, h, name, interfaces):
        # UML Component box with small tabs
        draw.rectangle([(x+3, y+3), (x+w+3, y+h+3)], fill="#E2E8F0")
        draw.rectangle([(x, y), (x+w, y+h)], fill="#FFFFFF", outline="#1E293B", width=2)
        # Component icon tabs
        draw.rectangle([(x - 8, y + 10), (x + 2, y + 25)], fill="#FFFFFF", outline="#1E293B", width=2)
        draw.rectangle([(x - 8, y + 35), (x + 2, y + 50)], fill="#FFFFFF", outline="#1E293B", width=2)
        draw.text((x + 12, y + 8), "<<component>>", fill="#6366F1", font=get_font(10))
        draw.text((x + 12, y + 24), name, fill="#0F172A", font=f_comp)
        
        curr_y = y + 55
        for iface in interfaces:
            draw.text((x + 12, curr_y), iface, fill="#475569", font=f_sub)
            curr_y += 16

    # 1. Frontend UI Components
    draw.text((60, 100), "Presentation Components (React Frontend)", fill="#334155", font=get_font(14, bold=True))
    draw_cbox(60, 130, 260, 130, "Student Web Interface", ["Provides: UI-Views", "Requires: IAuth, IComplaintSubmit", "Requires: IFileUpload"])
    draw_cbox(350, 130, 260, 130, "Hostel Authority Interface", ["Provides: UI-Views", "Requires: IAuth, IComplaintReview", "Requires: IAssign, IClose"])
    draw_cbox(640, 130, 260, 130, "Maintenance Staff Interface", ["Provides: UI-Views", "Requires: IAuth, IAssignedWork", "Requires: IResolve"])
    draw_cbox(930, 130, 240, 130, "Administrator Interface", ["Provides: UI-Views", "Requires: IAuth, IUserMgmt"])
    draw_cbox(1200, 130, 240, 130, "Management Interface", ["Provides: UI-Views", "Requires: IAuth, ISummary"])

    # 2. Application Services
    draw.text((60, 310), "Application & Domain Services (Express Engine)", fill="#334155", font=get_font(14, bold=True))
    draw_cbox(60, 340, 320, 150, "Authentication Service", ["Provides: IAuth", "Requires: IDataAccess", "- verifyCredentials()", "- generateSessionToken()", "- enforceRole()"])
    draw_cbox(420, 340, 320, 150, "Complaint Management Service", ["Provides: IComplaintSubmit, IComplaintReview", "Requires: IDataAccess, IAuditLog", "- validateComplaint()", "- updateStatus()"])
    draw_cbox(780, 340, 320, 150, "Assignment Management Service", ["Provides: IAssign, IAssignedWork", "Requires: IDataAccess, IAuditLog", "- assignStaff()", "- reassign()"])
    draw_cbox(1140, 340, 300, 150, "Resolution & Closure Service", ["Provides: IResolve, IClose", "Requires: IDataAccess, IAuditLog", "- recordResolution()", "- closeComplaint()"])

    # 3. Persistence & Support Services
    draw.text((60, 540), "Data Access, Audit & Storage Services", fill="#334155", font=get_font(14, bold=True))
    draw_cbox(60, 570, 320, 140, "Audit & History Service", ["Provides: IAuditLog", "Requires: IDataAccess", "- logStatusTransition()", "- getComplaintTimeline()"])
    draw_cbox(420, 570, 320, 140, "User Management Service", ["Provides: IUserMgmt", "Requires: IDataAccess", "- createUser()", "- toggleStatus()"])
    draw_cbox(780, 570, 320, 140, "Summary & KPI Service", ["Provides: ISummary", "Requires: IDataAccess", "- getExecutiveCounts()", "- getCategoryDistribution()"])
    draw_cbox(1140, 570, 300, 140, "File Storage Service", ["Provides: IFileUpload", "Requires: LocalDisk", "- saveImageFile()", "- validateImageMime()"])

    # 4. Database Component
    draw_cbox(450, 760, 600, 140, "Database Engine Component (SQLite)", 
              ["Provides: IDataAccess", "Persistence: database.sqlite", 
               "- Parameterized SQL Execution, PRAGMA foreign_keys = ON", 
               "- ACID Transactions for Assignment, Resolution & Audit History", 
               "- Tables: users, categories, complaints, assignments, status_history"])

    # Draw connectors
    draw.line([(190, 260), (190, 340)], fill="#6366F1", width=2)
    draw.line([(480, 260), (480, 340)], fill="#6366F1", width=2)
    draw.line([(770, 260), (770, 340)], fill="#6366F1", width=2)
    draw.line([(1050, 260), (1050, 340)], fill="#6366F1", width=2)
    draw.line([(1320, 260), (1320, 340)], fill="#6366F1", width=2)

    for x in [220, 580, 940, 1290]:
        draw.line([(x, 490), (x, 570)], fill="#10B981", width=2)

    draw.line([(220, 710), (500, 760)], fill="#F59E0B", width=2)
    draw.line([(580, 710), (650, 760)], fill="#F59E0B", width=2)
    draw.line([(940, 710), (850, 760)], fill="#F59E0B", width=2)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

def render_wireframe_01(output_path):
    # UI-Wireframe-01: UC-003 Submit Complaint
    width, height = 1200, 850
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Browser Frame
    draw.rectangle([(20, 20), (width-20, height-20)], outline="#94A3B8", width=2)
    draw.rectangle([(20, 20), (width-20, 60)], fill="#F1F5F9", outline="#94A3B8", width=1)
    draw.ellipse([(35, 35), (47, 47)], fill="#EF4444")
    draw.ellipse([(55, 35), (67, 47)], fill="#F59E0B")
    draw.ellipse([(75, 35), (87, 47)], fill="#10B981")
    draw.rectangle([(120, 28), (width-100, 52)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((130, 32), "http://localhost:5173/student/submit-complaint (UC-003)", fill="#64748B", font=get_font(12))

    # Navbar
    draw.rectangle([(20, 60), (width-20, 120)], fill="#1E293B")
    draw.text((45, 80), "Hostel Complaint Management System", fill="#FFFFFF", font=get_font(16, bold=True))
    draw.text((width - 320, 83), "Logged in as: Dhruv (Student | S101)", fill="#94A3B8", font=get_font(12))
    draw.rectangle([(width - 120, 75), (width - 40, 105)], fill="#EF4444")
    draw.text((width - 105, 82), "Logout", fill="#FFFFFF", font=get_font(12, bold=True))

    # Content Area: Submit Complaint Form Card
    draw.rectangle([(160, 150), (width - 160, height - 60)], fill="#F8FAFC", outline="#E2E8F0", width=2)
    draw.text((200, 175), "Submit a New Hostel Complaint", fill="#0F172A", font=get_font(20, bold=True))
    draw.text((200, 205), "Please fill out all mandatory fields below accurately.", fill="#64748B", font=get_font(12))

    # Form Fields
    f_lbl = get_font(12, bold=True)
    f_inp = get_font(12)

    # Title
    draw.text((200, 240), "Complaint Title * (5 - 100 characters)", fill="#334155", font=f_lbl)
    draw.rectangle([(200, 265), (width - 200, 305)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((215, 277), "Leaking bathroom pipe in washroom", fill="#0F172A", font=f_inp)

    # Category & Hostel Block (2 cols)
    draw.text((200, 325), "Category *", fill="#334155", font=f_lbl)
    draw.rectangle([(200, 350), (520, 390)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((215, 362), "Plumbing [v]", fill="#0F172A", font=f_inp)

    draw.text((560, 325), "Hostel Block *", fill="#334155", font=f_lbl)
    draw.rectangle([(560, 350), (width - 200, 390)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((575, 362), "Hostel Block A [v]", fill="#0F172A", font=f_inp)

    # Room Number & Image
    draw.text((200, 410), "Room / Location *", fill="#334155", font=f_lbl)
    draw.rectangle([(200, 435), (520, 475)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((215, 447), "Room 204 (2nd Floor)", fill="#0F172A", font=f_inp)

    draw.text((560, 410), "Attach Photo (Optional - JPEG/PNG max 2MB)", fill="#334155", font=f_lbl)
    draw.rectangle([(560, 435), (width - 200, 475)], fill="#F1F5F9", outline="#94A3B8")
    draw.rectangle([(570, 442), (670, 468)], fill="#E2E8F0", outline="#64748B")
    draw.text((585, 448), "Choose File", fill="#1E293B", font=get_font(11))
    draw.text((685, 448), "leak_tap_evidence.jpg", fill="#475569", font=f_inp)

    # Description
    draw.text((200, 495), "Detailed Problem Description * (10 - 1000 characters)", fill="#334155", font=f_lbl)
    draw.rectangle([(200, 520), (width - 200, 640)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((215, 535), "The main water supply pipe under the basin is continuously leaking water,", fill="#0F172A", font=f_inp)
    draw.text((215, 555), "causing puddles on the washroom floor. Needs washer replacement urgently.", fill="#0F172A", font=f_inp)

    # Buttons
    draw.rectangle([(200, 670), (370, 715)], fill="#2563EB")
    draw.text((230, 683), "Submit Complaint", fill="#FFFFFF", font=get_font(14, bold=True))

    draw.rectangle([(390, 670), (510, 715)], fill="#F1F5F9", outline="#CBD5E1")
    draw.text((430, 683), "Cancel", fill="#475569", font=get_font(14))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

def render_wireframe_02(output_path):
    # UI-Wireframe-02: UC-008 Assign Complaint (Hostel Authority)
    width, height = 1200, 850
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Browser Frame
    draw.rectangle([(20, 20), (width-20, height-20)], outline="#94A3B8", width=2)
    draw.rectangle([(20, 20), (width-20, 60)], fill="#F1F5F9", outline="#94A3B8", width=1)
    draw.ellipse([(35, 35), (47, 47)], fill="#EF4444")
    draw.ellipse([(55, 35), (67, 47)], fill="#F59E0B")
    draw.ellipse([(75, 35), (87, 47)], fill="#10B981")
    draw.rectangle([(120, 28), (width-100, 52)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((130, 32), "http://localhost:5173/authority/assign/CMP-101 (UC-008)", fill="#64748B", font=get_font(12))

    # Navbar
    draw.rectangle([(20, 60), (width-20, 120)], fill="#1E293B")
    draw.text((45, 80), "Hostel Authority Portal - Complaint Review & Assignment", fill="#FFFFFF", font=get_font(16, bold=True))
    draw.text((width - 340, 83), "Authority: Warden Sharma (Block A | A12)", fill="#94A3B8", font=get_font(12))
    draw.rectangle([(width - 120, 75), (width - 40, 105)], fill="#EF4444")
    draw.text((width - 105, 82), "Logout", fill="#FFFFFF", font=get_font(12, bold=True))

    # Details Card (Left)
    draw.rectangle([(60, 150), (620, height - 60)], fill="#F8FAFC", outline="#E2E8F0", width=2)
    draw.text((90, 175), "Complaint Details: CMP-101", fill="#0F172A", font=get_font(18, bold=True))
    
    # Status Badge
    draw.rectangle([(480, 170), (590, 205)], fill="#FEF3C7", outline="#F59E0B")
    draw.text((495, 180), "Under Review", fill="#B45309", font=get_font(11, bold=True))

    f_dt = get_font(12)
    draw.text((90, 220), "Student: Dhruv Agrawal (S101) | Block A, Room 204", fill="#475569", font=f_dt)
    draw.text((90, 245), "Category: Plumbing", fill="#475569", font=f_dt)
    draw.text((90, 270), "Submitted: 22-Oct-2026 10:15 AM", fill="#475569", font=f_dt)

    draw.text((90, 305), "Title:", fill="#1E293B", font=get_font(12, bold=True))
    draw.text((90, 325), "Leaking bathroom pipe in washroom", fill="#0F172A", font=get_font(13))

    draw.text((90, 360), "Description:", fill="#1E293B", font=get_font(12, bold=True))
    draw.rectangle([(90, 385), (590, 485)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((105, 395), "The main water supply pipe under the basin is continuously leaking water,", fill="#334155", font=f_dt)
    draw.text((105, 415), "causing puddles on the washroom floor. Needs washer replacement urgently.", fill="#334155", font=f_dt)

    draw.text((90, 510), "Attached Photo:", fill="#1E293B", font=get_font(12, bold=True))
    draw.rectangle([(90, 535), (250, 680)], fill="#E2E8F0", outline="#94A3B8")
    draw.text((120, 600), "[Photo: Tap Leak]", fill="#64748B", font=get_font(12))

    # Action Panel (Right)
    draw.rectangle([(660, 150), (width - 60, height - 60)], fill="#F8FAFC", outline="#E2E8F0", width=2)
    draw.text((690, 175), "Take Action / Assign Maintenance Staff", fill="#0F172A", font=get_font(18, bold=True))

    draw.text((690, 225), "Set Priority Level *", fill="#334155", font=get_font(12, bold=True))
    draw.rectangle([(690, 250), (width - 100, 290)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((705, 262), "High [v]", fill="#0F172A", font=f_dt)

    draw.text((690, 320), "Select Maintenance Staff *", fill="#334155", font=get_font(12, bold=True))
    draw.rectangle([(690, 345), (width - 100, 385)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((705, 357), "M07 - Ramesh Kumar (Plumber, Active) [v]", fill="#0F172A", font=f_dt)

    draw.text((690, 415), "Assignment Remarks / Instructions (Optional)", fill="#334155", font=get_font(12, bold=True))
    draw.rectangle([(690, 440), (width - 100, 530)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((705, 455), "Check washer and replace if torn. Contact student before entering.", fill="#334155", font=f_dt)

    # Assign Button
    draw.rectangle([(690, 560), (920, 605)], fill="#16A34A")
    draw.text((715, 573), "Confirm & Assign Staff", fill="#FFFFFF", font=get_font(14, bold=True))

    # Reject Button
    draw.rectangle([(690, 630), (860, 675)], fill="#EF4444")
    draw.text((720, 643), "Reject Complaint", fill="#FFFFFF", font=get_font(13, bold=True))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

def render_wireframe_03(output_path):
    # UI-Wireframe-03: UC-011 Resolve Complaint (Maintenance Staff)
    width, height = 1200, 850
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Browser Frame
    draw.rectangle([(20, 20), (width-20, height-20)], outline="#94A3B8", width=2)
    draw.rectangle([(20, 20), (width-20, 60)], fill="#F1F5F9", outline="#94A3B8", width=1)
    draw.ellipse([(35, 35), (47, 47)], fill="#EF4444")
    draw.ellipse([(55, 35), (67, 47)], fill="#F59E0B")
    draw.ellipse([(75, 35), (87, 47)], fill="#10B981")
    draw.rectangle([(120, 28), (width-100, 52)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((130, 32), "http://localhost:5173/staff/resolve/CMP-101 (UC-011)", fill="#64748B", font=get_font(12))

    # Navbar
    draw.rectangle([(20, 60), (width-20, 120)], fill="#1E293B")
    draw.text((45, 80), "Maintenance Staff Portal - Task Resolution", fill="#FFFFFF", font=get_font(16, bold=True))
    draw.text((width - 340, 83), "Staff: Ramesh Kumar (Plumber | M07)", fill="#94A3B8", font=get_font(12))
    draw.rectangle([(width - 120, 75), (width - 40, 105)], fill="#EF4444")
    draw.text((width - 105, 82), "Logout", fill="#FFFFFF", font=get_font(12, bold=True))

    # Details Card (Left)
    draw.rectangle([(60, 150), (600, height - 60)], fill="#F8FAFC", outline="#E2E8F0", width=2)
    draw.text((90, 175), "Work Order: CMP-101", fill="#0F172A", font=get_font(18, bold=True))
    
    # Status Badge
    draw.rectangle([(470, 170), (570, 205)], fill="#DBEAFE", outline="#3B82F6")
    draw.text((485, 180), "In Progress", fill="#1D4ED8", font=get_font(11, bold=True))

    f_dt = get_font(12)
    draw.text((90, 220), "Location: Hostel Block A, Room 204", fill="#1E293B", font=get_font(13, bold=True))
    draw.text((90, 248), "Assigned By: Warden Sharma | Priority: HIGH", fill="#DC2626", font=get_font(12, bold=True))
    draw.text((90, 275), "Student Contact: Dhruv (+91-9876543210)", fill="#475569", font=f_dt)

    draw.text((90, 310), "Issue Title:", fill="#1E293B", font=get_font(12, bold=True))
    draw.text((90, 330), "Leaking bathroom pipe in washroom", fill="#0F172A", font=f_dt)

    draw.text((90, 365), "Work Log History:", fill="#1E293B", font=get_font(12, bold=True))
    draw.rectangle([(90, 390), (570, 520)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((105, 405), "* [10:30 AM] Assigned to Ramesh Kumar (Plumbing)", fill="#64748B", font=get_font(11))
    draw.text((105, 430), "* [11:00 AM] Status changed to IN PROGRESS by M07", fill="#64748B", font=get_font(11))
    draw.text((105, 455), "* [11:15 AM] Remark: Inspected tap, rubber washer was cracked.", fill="#1E293B", font=get_font(11))

    # Right Panel: Work Actions & Resolution
    draw.rectangle([(640, 150), (width - 60, height - 60)], fill="#F8FAFC", outline="#E2E8F0", width=2)
    draw.text((670, 175), "Update Progress & Mark as Resolved", fill="#0F172A", font=get_font(18, bold=True))

    # Progress Remark
    draw.text((670, 225), "Intermediate Progress Remark (Status stays 'In Progress')", fill="#334155", font=get_font(12, bold=True))
    draw.rectangle([(670, 250), (width - 100, 320)], fill="#FFFFFF", outline="#CBD5E1")
    draw.text((685, 265), "Replaced rubber washer. Running water test for 10 minutes.", fill="#334155", font=f_dt)
    draw.rectangle([(670, 335), (840, 375)], fill="#F1F5F9", outline="#94A3B8")
    draw.text((690, 347), "Add Progress Remark", fill="#1E293B", font=get_font(12, bold=True))

    # Final Resolution Details Box
    draw.text((670, 410), "Final Resolution Details * (Required to Mark Resolved)", fill="#0F172A", font=get_font(13, bold=True))
    draw.rectangle([(670, 435), (width - 100, 560)], fill="#FFFFFF", outline="#22C55E", width=2)
    draw.text((685, 450), "Replaced the damaged rubber washer on the basin tap line with a new heavy-duty", fill="#0F172A", font=f_dt)
    draw.text((685, 470), "brass-fitted washer. Tested pressure for 15 mins with student present.", fill="#0F172A", font=f_dt)
    draw.text((685, 490), "No further leakage observed. Work completed satisfactorily.", fill="#0F172A", font=f_dt)

    # Resolve Button
    draw.rectangle([(670, 590), (920, 640)], fill="#16A34A")
    draw.text((700, 605), "Mark Issue as Resolved", fill="#FFFFFF", font=get_font(15, bold=True))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    print(f"Rendered: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    render_class_diagram(os.path.join(base_dir, "Design-Class-Diagram.png"))
    render_arch_diagram(os.path.join(base_dir, "Architectural-Diagram.png"))
    render_comp_diagram(os.path.join(base_dir, "Component-Design-Diagram.png"))
    render_wireframe_01(os.path.join(base_dir, "interfaces", "UI-Wireframe-01.png"))
    render_wireframe_02(os.path.join(base_dir, "interfaces", "UI-Wireframe-02.png"))
    render_wireframe_03(os.path.join(base_dir, "interfaces", "UI-Wireframe-03.png"))
    print("All diagrams rendered successfully.")
