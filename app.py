from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import gspread
from google.oauth2.service_account import Credentials
import random, string
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib
import secrets
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
# Session configuration to improve reliability across systems
from datetime import timedelta
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=6)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # set True only when serving over HTTPS

# ------------------ GOOGLE SHEETS SETUP ------------------
SCOPE = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]

# Try to initialize Google Sheets, fallback to local storage if it fails
GOOGLE_SHEETS_AVAILABLE = False
CLIENT = None
sheet = None

# Try to load service account key from environment or file
SERVICE_ACCOUNT_FILE = os.environ.get('GOOGLE_SERVICE_ACCOUNT_FILE', 'service-account-key.json')

try:
    if os.path.exists(SERVICE_ACCOUNT_FILE):
        CREDS = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPE)
        CLIENT = gspread.authorize(CREDS)
        # Use the existing shared spreadsheet
        SHEET_NAME = "Students.Details"   # <-- spreadsheet name
        sheet = CLIENT.open(SHEET_NAME).sheet1   # main student details (first sheet)
        GOOGLE_SHEETS_AVAILABLE = True
        print("Google Sheets connection successful")
    else:
        print(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
        print("Using local storage fallback")
except Exception as e:
    print(f"Google Sheets not available: {e}")
    print("Using local file storage as fallback")

# Teacher data is now stored exclusively in Google Sheets

# ------------------ EMAIL CONFIGURATION ------------------
# Import email configuration
try:
    from email_config import SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD, SCHOOL_NAME, ADMIN_EMAIL
except ImportError:
    # Fallback configuration if email_config.py doesn't exist
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    EMAIL_ADDRESS = "soham.username@gmail.com"  # Change this to your Gmail
    EMAIL_PASSWORD = "tqqv ttol jkby gkil"    # Change this to your Gmail App Password
    SCHOOL_NAME = "School Administration"
    ADMIN_EMAIL = "admin@school.com"

# ------------------ STUDENT CREDENTIALS SYSTEM ------------------
STUDENT_CREDENTIALS_FILE = "student_credentials.json"

def generate_student_password():
    """Generate a secure 8-character password with mixed case, numbers, and symbols."""
    chars = string.ascii_letters + string.digits + "!@#$%"
    return ''.join(secrets.choice(chars) for _ in range(8))

def hash_password(password):
    """Hash password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return salt + pwdhash.hex()

def verify_password(stored_password, provided_password):
    """Verify a provided password against stored hash."""
    salt = stored_password[:32]
    stored_hash = stored_password[32:]
    pwdhash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return pwdhash.hex() == stored_hash

def load_student_credentials():
    """Load student credentials from file."""
    try:
        if os.path.exists(STUDENT_CREDENTIALS_FILE):
            with open(STUDENT_CREDENTIALS_FILE, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading credentials: {e}")
        return {}

def save_student_credentials(credentials):
    """Save student credentials to file."""
    try:
        with open(STUDENT_CREDENTIALS_FILE, 'w') as f:
            json.dump(credentials, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving credentials: {e}")
        return False

def generate_all_student_credentials():
    """Generate credentials for all students in Google Sheets."""
    if not GOOGLE_SHEETS_AVAILABLE:
        return "Google Sheets not available"
    
    try:
        data, headers = fetch_student_data()
        credentials = load_student_credentials()
        new_credentials = []
        
        for student in data:
            sr_no = _extract_sr_no_from_record(student)
            if not sr_no:
                continue
                
            student_name = student.get('Student Name', student.get('Name', 'Unknown'))
            username = f"student{sr_no}"
            
            # Check if credentials already exist
            if username not in credentials:
                password = generate_student_password()
                hashed_password = hash_password(password)
                credentials[username] = {
                    'sr_no': sr_no,
                    'name': student_name,
                    'password_hash': hashed_password,
                    'created_at': datetime.now().isoformat()
                }
                new_credentials.append({
                    'username': username,
                    'password': password,
                    'sr_no': sr_no,
                    'name': student_name
                })
        
        save_student_credentials(credentials)
        return new_credentials
        
    except Exception as e:
        return f"Error generating credentials: {e}"

def verify_student_credentials(username, password):
    """Verify student login credentials."""
    credentials = load_student_credentials()
    if username not in credentials:
        return False, None
    
    stored_cred = credentials[username]
    if verify_password(stored_cred['password_hash'], password):
        return True, stored_cred
    
    return False, None

# ------------------ COUNSELLING STORAGE ------------------
def store_counselling_record(sr_no, student_name, teacher_name, message, timestamp):
    """Store counselling record in Google Sheets"""
    try:
        if GOOGLE_SHEETS_AVAILABLE:
            # Try to open counselling sheet
            try:
                counselling_sheet = CLIENT.open("Students.Details").worksheet("Counselling")
            except:
                # Create counselling sheet if it doesn't exist
                counselling_sheet = CLIENT.open("Students.Details").add_worksheet(title="Counselling", rows=1000, cols=6)
                # Add headers
                counselling_sheet.insert_row(["Sr No", "Student Name", "Teacher", "Message", "Timestamp", "Status"], 1)
            
            # Add new record
            new_row = [sr_no, student_name, teacher_name, message, timestamp, "Sent"]
            counselling_sheet.append_row(new_row)
            return True, "Counselling record stored"
        else:
            # Store locally
            return store_counselling_local(sr_no, student_name, teacher_name, message, timestamp)
    except Exception as e:
        print(f"Error storing counselling record: {e}")
        return store_counselling_local(sr_no, student_name, teacher_name, message, timestamp)

def store_counselling_local(sr_no, student_name, teacher_name, message, timestamp):
    """Store counselling record locally"""
    try:
        counselling_file = "counselling_records.json"
        if os.path.exists(counselling_file):
            with open(counselling_file, 'r') as f:
                records = json.load(f)
        else:
            records = []
        
        new_record = {
            "sr_no": sr_no,
            "student_name": student_name,
            "teacher_name": teacher_name,
            "message": message,
            "timestamp": timestamp,
            "status": "Sent"
        }
        records.append(new_record)
        
        with open(counselling_file, 'w') as f:
            json.dump(records, f, indent=2)
        
        return True, "Counselling record stored locally"
    except Exception as e:
        print(f"Error storing counselling locally: {e}")
        return False, str(e)

def get_counselling_history(sr_no):
    """Get counselling history for a student"""
    try:
        if GOOGLE_SHEETS_AVAILABLE:
            try:
                counselling_sheet = CLIENT.open("Students.Details").worksheet("Counselling")
                all_records = counselling_sheet.get_all_records()
                # Filter records for this student
                student_records = [r for r in all_records if str(r.get("Sr No")) == str(sr_no)]
                return student_records
            except:
                return get_counselling_history_local(sr_no)
        else:
            return get_counselling_history_local(sr_no)
    except Exception as e:
        print(f"Error getting counselling history: {e}")
        return get_counselling_history_local(sr_no)

def get_counselling_history_local(sr_no):
    """Get counselling history from local storage"""
    try:
        counselling_file = "counselling_records.json"
        if os.path.exists(counselling_file):
            with open(counselling_file, 'r') as f:
                records = json.load(f)
            # Filter records for this student
            student_records = [r for r in records if str(r.get("sr_no")) == str(sr_no)]
            return student_records
        return []
    except Exception as e:
        print(f"Error getting counselling history locally: {e}")
        return []

def get_counselling_counts():
    """Get counselling count for each student"""
    try:
        if GOOGLE_SHEETS_AVAILABLE:
            try:
                counselling_sheet = CLIENT.open("Students.Details").worksheet("Counselling")
                all_records = counselling_sheet.get_all_records()
                counts = {}
                for record in all_records:
                    sr_no = str(record.get("Sr No"))
                    if sr_no:
                        counts[sr_no] = counts.get(sr_no, 0) + 1
                return counts
            except:
                return get_counselling_counts_local()
        else:
            return get_counselling_counts_local()
    except Exception as e:
        print(f"Error getting counselling counts: {e}")
        return get_counselling_counts_local()

def get_counselling_counts_local():
    """Get counselling counts from local storage"""
    try:
        counselling_file = "counselling_records.json"
        if os.path.exists(counselling_file):
            with open(counselling_file, 'r') as f:
                records = json.load(f)
            counts = {}
            for record in records:
                sr_no = str(record.get("sr_no"))
                if sr_no:
                    counts[sr_no] = counts.get(sr_no, 0) + 1
            return counts
        return {}
    except Exception as e:
        print(f"Error getting counselling counts locally: {e}")
        return {}

# ------------------ EMAIL FUNCTIONS ------------------
def send_counselling_email(student_email, student_name, teacher_name, message):
    """Send counselling email to student"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = student_email
        msg['Subject'] = f"Counselling Session - {student_name}"
        
        # Email body
        body = f"""
Dear {student_name},

You have been scheduled for a counselling session.

Teacher: {teacher_name}
Message: {message}

Please contact your teacher for further details.

Best regards,
{SCHOOL_NAME}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to Gmail SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, student_email, text)
        server.quit()
        
        return True, "Email sent successfully"
        
    except Exception as e:
        print(f"Error sending email: {e}")
        return False, f"Failed to send email: {str(e)}"


@app.route("/test-form", methods=["POST"])
def test_form():
    print("TEST FORM DATA:", request.form)
    return "Check terminal for form data!"


# ------------------ HELPER FUNCTIONS ------------------
def _find_student_worksheet():
    """Try to find the worksheet in 'Students.Details' that contains student rows.

    Heuristic: pick the first sheet with at least one of the expected serial number headers.
    """
    try:
        if not GOOGLE_SHEETS_AVAILABLE:
            return None
        wb = CLIENT.open("Students.Details")
        candidates = ["Sr No", "PRN", "Serial No", "ID", "SrNo", "Roll No", "Roll"]
        for ws in wb.worksheets():
            values = ws.get_all_values()
            if not values:
                continue
            headers = [h.strip() for h in values[0]]
            lower_headers = [h.lower() for h in headers]
            for c in candidates:
                if c.lower() in lower_headers:
                    return ws
        # Fallback to first sheet
        return wb.sheet1
    except Exception as e:
        print(f"DEBUG: _find_student_worksheet error: {e}")
        return None


def fetch_student_data():
    try:
        # Resolve worksheet dynamically to handle renamed/added tabs
        active_sheet = sheet or _find_student_worksheet()
        if active_sheet is None:
            return [], []
        all_values = active_sheet.get_all_values()
        data = []

        if len(all_values) < 2:
            return data, []

        # Use actual column headers from the spreadsheet
        sheet_headers = all_values[0]
        print(f"DEBUG: Found columns in spreadsheet: {sheet_headers}")
        
        # Filter out empty columns and formula columns
        filtered_headers = []
        filtered_indices = []
        
        for i, header in enumerate(sheet_headers):
            # Skip empty headers or headers that are just spaces
            if not header or header.strip() == "":
                continue
            # Skip columns that are likely formulas (contain parentheses or start with =)
            if "(" in header or ")" in header or header.strip().startswith("="):
                continue
            # Skip columns that are just single letters (likely formula references)
            if len(header.strip()) == 1 and header.strip().isalpha():
                continue
                
            filtered_headers.append(header)
            filtered_indices.append(i)
        
        print(f"DEBUG: Filtered headers for display: {filtered_headers}")
        
        for row in all_values[1:]:
            # Skip rows with empty first column (assuming first column is ID/Sr No)
            if not row or not row[0] or row[0].strip() == "":
                continue
                
            # Create row dictionary using only filtered columns
            row_dict = {}
            for i, header in enumerate(filtered_headers):
                col_index = filtered_indices[i]
                row_dict[header] = row[col_index] if col_index < len(row) else ""
            data.append(row_dict)
            
        print(f"DEBUG: Processed {len(data)} student records with {len(filtered_headers)} columns")
        return data, filtered_headers
    except Exception as e:
        print(f"Error fetching student data: {e}")
        return [], []


def _extract_sr_no_from_record(record):
    """Try multiple candidate keys to read the student's serial/PRN from a row dict."""
    if not isinstance(record, dict):
        return None
    candidate_keys = [
        "Sr No", "SR NO", "SrNo", "sr no", "srno",
        "PRN", "Prn", "prn",
        "Serial No", "serial no", "Serial", "serial",
        "ID", "Id", "id",
        "Roll No", "roll no", "Roll", "roll",
    ]
    for key in candidate_keys:
        if key in record and str(record.get(key)).strip() != "":
            return str(record.get(key)).strip()
    # Fallback: try first column value if any
    try:
        # preserve deterministic order by headers when built
        if len(record.values()) > 0:
            return str(next(iter(record.values()))).strip()
    except Exception:
        pass
    return None


def extract_student_metrics(student_record):
    """Extract attendance percentage and marks from a student record dict.

    Heuristics:
    - Attendance: first key whose name contains 'attendance' (case-insensitive). Parsed as float percent.
    - Marks: any key containing 'mark' or 'score' (case-insensitive). Values parsed as float when possible.
    Returns: (attendance_percent_float_or_None, list[(label, value)])
    """
    if not isinstance(student_record, dict):
        return None, []

    attendance_value = None
    for k, v in student_record.items():
        key_lower = str(k).lower()
        # Check for various attendance column names
        if any(keyword in key_lower for keyword in ['attendance', '%', 'present', 'absent']) and v not in (None, ''):
            val_str = str(v).replace('%', '').strip()
            try:
                attendance_value = float(val_str)
                # If the value is already a percentage (0-100), use it directly
                if attendance_value <= 100:
                    break
                # If it's a decimal (0-1), convert to percentage
                elif attendance_value <= 1:
                    attendance_value = attendance_value * 100
                    break
            except Exception:
                continue

    marks = []
    for k, v in student_record.items():
        key_lower = str(k).lower()
        if any(token in key_lower for token in ['mark', 'score']):
            if v is None or str(v).strip() == '':
                continue
            try:
                marks_val = float(str(v).replace('%', '').strip())
            except Exception:
                # skip non-numeric marks
                continue
            marks.append((k, marks_val))

    # Fallback: if no explicit marks found, try common subject names with numeric values
    if not marks:
        common_subject_hints = ['math', 'science', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography', 'computer']
        for k, v in student_record.items():
            key_lower = str(k).lower()
            if any(h in key_lower for h in common_subject_hints):
                try:
                    marks_val = float(str(v).replace('%', '').strip())
                    marks.append((k, marks_val))
                except Exception:
                    continue

    return attendance_value, marks

def get_all_students_attendance_distribution():
    """Get attendance distribution for all students from Google Sheets for pie chart."""
    try:
        data, headers = fetch_student_data()
        attendance_values = []
        
        for student in data:
            attendance_percent, _ = extract_student_metrics(student)
            if attendance_percent is not None:
                attendance_values.append(attendance_percent)
        
        # Create attendance ranges
        ranges = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '60-69%': 0,
            'Below 60%': 0
        }
        
        for attendance in attendance_values:
            if attendance >= 90:
                ranges['90-100%'] += 1
            elif attendance >= 80:
                ranges['80-89%'] += 1
            elif attendance >= 70:
                ranges['70-79%'] += 1
            elif attendance >= 60:
                ranges['60-69%'] += 1
            else:
                ranges['Below 60%'] += 1
        
        return ranges
    except Exception as e:
        print(f"Error getting attendance distribution: {e}")
        return {}


def check_student_credentials(serial_number, user_id):
    """Validate student login using Sr No and UserID from Google Sheets.

    Returns (bool, dict|None): (is_valid, student_record)
    """
    try:
        if not GOOGLE_SHEETS_AVAILABLE or sheet is None:
            print("ERROR: Google Sheets not available - student authentication cannot proceed")
            return False, None

        all_values = sheet.get_all_values()
        if not all_values or len(all_values) < 2:
            return False, None

        headers = all_values[0]

        # Find column indices for Sr No and UserID (robust, case-insensitive)
        def find_col(header_keywords):
            for idx, h in enumerate(headers):
                h_lower = (h or "").strip().lower()
                if all(k in h_lower for k in header_keywords):
                    return idx
            return None

        sr_no_col = None
        # Common variants for serial number column
        for variant in [["sr", "no"], ["serial", "no"], ["srno"], ["prn"], ["id"]]:
            sr_no_col = find_col(variant)
            if sr_no_col is not None:
                break

        user_id_col = None
        for variant in [["user", "id"], ["userid"], ["student", "id"], ["login", "id"]]:
            user_id_col = find_col(variant)
            if user_id_col is not None:
                break

        if sr_no_col is None or user_id_col is None:
            print("DEBUG: Could not find Sr No or UserID columns in sheet headers:", headers)
            return False, None

        serial_str = str(serial_number).strip()
        user_id_str = str(user_id).strip()

        for row in all_values[1:]:
            # Pad row length
            if len(row) < len(headers):
                row = row + [""] * (len(headers) - len(row))

            row_sr = str(row[sr_no_col]).strip()
            row_userid = str(row[user_id_col]).strip()

            if row_sr == serial_str and row_userid == user_id_str:
                # Build a student dict using existing filtered approach
                student_record = {h: (row[i] if i < len(row) else "") for i, h in enumerate(headers)}
                return True, student_record

        return False, None
    except Exception as e:
        print(f"ERROR in check_student_credentials: {e}")
        return False, None

def check_teacher_credentials(userid, password):
    if not GOOGLE_SHEETS_AVAILABLE:
        print("ERROR: Google Sheets not available - authentication cannot proceed")
        return False
    
    try:
        teacher_sheet = CLIENT.open("Login And Register").worksheet("DATA")
        # Fetch all values and map to headers manually
        all_values = teacher_sheet.get_all_values()
        if not all_values or len(all_values) < 2:
            print("No teacher data found in Google Sheets")
            return False
            
        headers = all_values[0]
        accounts = []
        for row in all_values[1:]:
            if len(row) < len(headers):
                row += [""] * (len(headers) - len(row))
            account = dict(zip(headers, row))
            accounts.append(account)

        print("DEBUG: Checking credentials against Google Sheets")
        print(f"DEBUG: Found {len(accounts)} teacher accounts")

        for account in accounts:
            user = str(account.get("UserID", "")).strip()
            pw = str(account.get("Password", "")).strip()
            print(f"DEBUG comparing: input=({userid},{password}) vs sheet=({user},{pw})")

            if user == str(userid).strip() and pw == str(password).strip():
                print("DEBUG: MATCH FOUND ✅")
                return True

        print("DEBUG: NO MATCH ❌")
        return False
        
    except Exception as e:
        print(f"ERROR in check_teacher_credentials (Google Sheets): {e}")
        print("Authentication failed - Google Sheets connection error")
        return False


def register_teacher(teacher_data):
    if not GOOGLE_SHEETS_AVAILABLE:
        print("ERROR: Google Sheets not available - registration cannot proceed")
        return False, "Registration service unavailable - Google Sheets connection required"
    
    try:
        teacher_sheet = CLIENT.open("Login And Register").worksheet("DATA")
        headers = teacher_sheet.row_values(1)
        if not headers or headers == ['']:
            headers = ["UserID", "Password", "Name", "Email", "Phone", "Department", "Subject"]
            teacher_sheet.insert_row(headers, 1)
            headers = teacher_sheet.row_values(1)  # Refresh headers

        # Fetch all values and map to headers manually
        all_values = teacher_sheet.get_all_values()
        if not all_values or len(all_values) < 2:
            existing_records = []
        else:
            sheet_headers = all_values[0]
            existing_records = []
            for row in all_values[1:]:
                if len(row) < len(sheet_headers):
                    row += [""] * (len(sheet_headers) - len(row))
                record = dict(zip(sheet_headers, row))
                existing_records.append(record)

        for record in existing_records:
            if str(record.get("UserID", "")).strip() == str(teacher_data["teacherUserId"]).strip():
                return False, "User ID already exists"

        new_row = [
            teacher_data["teacherUserId"],
            teacher_data["teacherPassword"],
            teacher_data["teacherName"],
            teacher_data["teacherEmail"],
            teacher_data["teacherPhone"],
            teacher_data["teacherDepartment"],
            teacher_data["teacherSubject"]
        ]
        teacher_sheet.append_row(new_row)
        return True, "Teacher registered successfully"

    except Exception as e:
        print(f"ERROR in register_teacher (Google Sheets): {e}")
        return False, "Registration failed - Google Sheets connection error"




# ------------------ ROUTES ------------------

@app.route("/")
def index():
    return render_template("index.html")


# ------------------ STUDENT LOGIN ------------------
@app.route("/student-login", methods=["GET", "POST"])
def student_login():
    # Ensure session persists for this user
    session.permanent = True
    if request.method == "POST":
        username = (request.form.get("studentUsername") or "").strip()
        password = (request.form.get("studentPassword") or "").strip()

        print(f"DEBUG Student Login - Username: {username}, Password: {'*' * len(password)}")

        is_valid, student_cred = verify_student_credentials(username, password)
        if is_valid:
            session['student_logged_in'] = True
            session['student_sr_no'] = student_cred['sr_no']
            session['student_name'] = student_cred['name']
            return redirect(url_for("student_dashboard_home"))
        else:
            return render_template("student-login.html", error="Invalid username or password")

    # GET request: simple form (no CAPTCHA)
    return render_template("student-login.html")


# ------------------ TEACHER REGISTRATION ------------------
@app.route("/teacher-register", methods=["GET", "POST"])
def teacher_register():
    if request.method == "POST":
        print("DEBUG: POST request received for teacher registration")
        print("DEBUG: Form data:", request.form)
        
        teacher_data = {
            "teacherName": request.form.get("teacherName"),
            "teacherUserId": request.form.get("teacherUserId"),
            "teacherPassword": request.form.get("teacherPassword"),
            "teacherEmail": request.form.get("teacherEmail"),
            "teacherPhone": request.form.get("teacherPhone"),
            "teacherDepartment": request.form.get("teacherDepartment"),
            "teacherSubject": request.form.get("teacherSubject")
        }
        
        print("DEBUG: Teacher data:", teacher_data)
        
        # Validate required fields
        required_fields = ["teacherName", "teacherUserId", "teacherPassword", "teacherEmail", "teacherPhone", "teacherDepartment", "teacherSubject"]
        for field in required_fields:
            if not teacher_data[field]:
                print(f"DEBUG: Missing field: {field}")
                return render_template("teacher-register.html", error=f"Please fill in all required fields")
        
        print("DEBUG: All fields validated, calling register_teacher")
        # Register teacher
        success, message = register_teacher(teacher_data)
        print(f"DEBUG: Registration result - Success: {success}, Message: {message}")
        
        if success:
            return render_template("teacher-register.html", success=message)
        else:
            return render_template("teacher-register.html", error=message)
    
    # GET request: show registration form
    print("DEBUG: GET request for teacher registration form")
    return render_template("teacher-register.html")


# ------------------ TEACHER LOGIN ------------------
@app.route("/teacher-login", methods=["GET", "POST"])
def teacher_login():
    # Ensure session persists for this user
    session.permanent = True
    if request.method == "POST":
        userid = request.form.get("teacherUserId")
        password = request.form.get("teacherPassword")
        captcha_input = request.form.get("captchaInput")
        captcha_code = session.get("captcha")

        # If captcha missing (fresh/new session), regenerate and prompt again
        if not captcha_code:
            fresh_captcha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            session["captcha"] = fresh_captcha
            return render_template("teacher-login.html", captcha=fresh_captcha, error="Session expired. Please try again.")

        # Debug logging
        print(f"DEBUG Teacher Login - UserID: {userid}, Password: {'*' * len(password) if password else 'None'}")
        print(f"DEBUG Teacher Login - Captcha Input: '{captcha_input}', Session Captcha: '{captcha_code}'")

        # Check CAPTCHA first before regenerating
        if captcha_input != captcha_code:
            print("DEBUG: Invalid CAPTCHA")
            # Generate fresh CAPTCHA for next attempt
            fresh_captcha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            session["captcha"] = fresh_captcha
            print(f"DEBUG: Generated fresh teacher captcha: {fresh_captcha}")
            return render_template("teacher-login.html", captcha=fresh_captcha, error="CAPTCHA incorrect")

        if not check_teacher_credentials(userid, password):
            print("DEBUG: Invalid credentials")
            # Generate fresh CAPTCHA for next attempt
            fresh_captcha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            session["captcha"] = fresh_captcha
            print(f"DEBUG: Generated fresh teacher captcha: {fresh_captcha}")
            if not GOOGLE_SHEETS_AVAILABLE:
                return render_template("teacher-login.html", captcha=fresh_captcha, error="Authentication service unavailable - Google Sheets connection required")
            else:
                return render_template("teacher-login.html", captcha=fresh_captcha, error="Invalid UserID or Password")

        # ✅ Success → store teacher session and redirect
        print("DEBUG: Teacher login successful")
        session['teacher_logged_in'] = True
        session['teacher_userid'] = userid
        return redirect(url_for("teacher_dashboard"))

    # GET request: show fresh CAPTCHA
    captcha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    session["captcha"] = captcha
    print(f"DEBUG: Generated new teacher captcha: {captcha}")
    return render_template("teacher-login.html", captcha=captcha)

# ------------------ TEACHER LOGOUT ------------------
@app.route("/teacher-logout")
def teacher_logout():
    session.pop('teacher_logged_in', None)
    session.pop('teacher_userid', None)
    return redirect(url_for('index'))

# ------------------ TEACHER DASHBOARD ------------------
@app.route("/teacher-dashboard")
def teacher_dashboard():
    # Check if teacher is logged in
    if not session.get('teacher_logged_in'):
        return redirect(url_for('teacher_login'))
    
    data, headers = fetch_student_data()
    
    # Get counselling counts for each student
    counselling_counts = get_counselling_counts()
    
    # Add counselling count to each student record
    for student in data:
        sr_no = str(student.get('Sr No', ''))
        student['counselling_count'] = counselling_counts.get(sr_no, 0)
    
    return render_template("dashboard.html", data=data, headers=headers)


# ------------------ STUDENT DASHBOARD ------------------
@app.route("/student-dashboard")
def student_dashboard_home():
    if not session.get('student_logged_in'):
        return redirect(url_for('student_login'))

    sr_no = session.get('student_sr_no')
    data, headers = fetch_student_data()
    # Robust match on multiple possible serial/PRN headers
    student = None
    for s in data:
        rec_sr = _extract_sr_no_from_record(s)
        if rec_sr is not None and str(rec_sr) == str(sr_no):
            student = s
            break
    if not student:
        print("DEBUG: Student not found. Session sr_no:", sr_no)
        if data:
            print("DEBUG: Example record keys:", list(data[0].keys()))
            print("DEBUG: Example record first serial candidate:", _extract_sr_no_from_record(data[0]))
        return "Student not found", 404
    attendance_percent, marks = extract_student_metrics(student)
    return render_template(
        "student_dashboard.html",
        student=student,
        headers=headers,
        google_available=GOOGLE_SHEETS_AVAILABLE,
        attendance_percent=attendance_percent,
        marks=marks
    )

# Backward-compatible route (will redirect to session-based dashboard)
@app.route("/student-dashboard/<prn>")
def student_dashboard(prn):
    session['student_logged_in'] = True
    session['student_sr_no'] = str(prn)
    return redirect(url_for('student_dashboard_home'))

# Student logout
@app.route("/student-logout")
def student_logout():
    session.pop('student_logged_in', None)
    session.pop('student_sr_no', None)
    session.pop('student_name', None)
    return redirect(url_for('index'))

# ------------------ STUDENT API (for dashboard data) ------------------
@app.route("/api/student/me")
def api_student_me():
    if not session.get('student_logged_in'):
        return jsonify({"error": "unauthorized"}), 401

    sr_no = session.get('student_sr_no')
    data, headers = fetch_student_data()
    student = None
    for s in data:
        rec_sr = _extract_sr_no_from_record(s)
        if rec_sr is not None and str(rec_sr) == str(sr_no):
            student = s
            break
    if not student:
        return jsonify({"error": "not_found"}), 404

    return jsonify({
        "googleSheets": bool(GOOGLE_SHEETS_AVAILABLE),
        "headers": headers,
        "student": student
    })

# Optional: quick diagnostics
@app.route("/health/sheets")
def health_sheets():
    return jsonify({
        "googleSheets": bool(GOOGLE_SHEETS_AVAILABLE),
        "serviceAccountFile": SERVICE_ACCOUNT_FILE,
    })

# ------------------ CREDENTIALS MANAGEMENT ------------------
@app.route("/generate-credentials")
def generate_credentials():
    """Generate credentials for all students (admin function)."""
    result = generate_all_student_credentials()
    if isinstance(result, str) and result.startswith("Error"):
        return result, 500
    
    # Display credentials in a simple format
    credentials_html = "<h2>Generated Student Credentials</h2><table border='1'><tr><th>Username</th><th>Password</th><th>Sr No</th><th>Name</th></tr>"
    for cred in result:
        credentials_html += f"<tr><td>{cred['username']}</td><td>{cred['password']}</td><td>{cred['sr_no']}</td><td>{cred['name']}</td></tr>"
    credentials_html += "</table>"
    
    return credentials_html

@app.route("/list-credentials")
def list_credentials():
    """List all existing student credentials."""
    credentials = load_student_credentials()
    if not credentials:
        return "<h2>No student credentials found</h2><p>Visit /generate-credentials to create them.</p>"
    
    html = "<h2>All Student Credentials</h2><table border='1'><tr><th>Username</th><th>Sr No</th><th>Name</th><th>Created</th></tr>"
    for username, cred in credentials.items():
        html += f"<tr><td>{username}</td><td>{cred['sr_no']}</td><td>{cred['name']}</td><td>{cred.get('created_at', 'Unknown')}</td></tr>"
    html += "</table><p><strong>Note:</strong> Passwords are hashed and not displayed for security.</p>"
    
    return html

@app.route("/debug-student-data")
def debug_student_data():
    """Debug endpoint to see what student data is being read from Google Sheets."""
    if not GOOGLE_SHEETS_AVAILABLE:
        return "<h2>Google Sheets not available</h2>"
    
    try:
        data, headers = fetch_student_data()
        if not data:
            return "<h2>No student data found</h2>"
        
        html = "<h2>Student Data Debug</h2>"
        html += f"<p><strong>Total students:</strong> {len(data)}</p>"
        html += f"<p><strong>Headers:</strong> {', '.join(headers)}</p>"
        
        html += "<h3>First 3 Students with Attendance Detection:</h3>"
        html += "<table border='1'><tr><th>Sr No</th><th>Name</th><th>All Data</th><th>Detected Attendance</th></tr>"
        
        for i, student in enumerate(data[:3]):
            sr_no = _extract_sr_no_from_record(student)
            name = student.get('Student Name', student.get('Name', 'Unknown'))
            attendance, marks = extract_student_metrics(student)
            
            html += f"<tr><td>{sr_no}</td><td>{name}</td>"
            html += f"<td><pre>{dict(student)}</pre></td>"
            html += f"<td>{attendance}%</td></tr>"
        
        html += "</table>"
        return html
        
    except Exception as e:
        return f"<h2>Error:</h2><p>{str(e)}</p>"


# ------------------ STUDENT PROFILE ------------------
@app.route("/student/<int:sr_no>")
def student_profile(sr_no):
    data, headers = fetch_student_data()
    student = next((s for s in data if str(s.get("Sr No")) == str(sr_no)), None)
    if not student:
        return "Student not found", 404
    
    # Get counselling history for this student
    counselling_history = get_counselling_history(sr_no)
    
    return render_template("student_profile.html", student=student, headers=headers, counselling_history=counselling_history)


# ------------------ COUNSELING ------------------
@app.route("/schedule/<int:sr_no>", methods=["POST"])
def schedule_counseling(sr_no):
    # Check if teacher is logged in
    if not session.get('teacher_logged_in'):
        return redirect(url_for('teacher_login'))
    
    message = request.form.get("message")
    teacher_name = session.get('teacher_userid', 'Teacher')
    
    # Get student data to find email
    data, headers = fetch_student_data()
    student = next((s for s in data if str(s.get("Sr No")) == str(sr_no)), None)
    
    if not student:
        return "Student not found", 404
    
    student_name = student.get("Student Name", "Student")
    student_email = student.get("Students Email", "")
    
    if not student_email:
        return f"Student email not found for {student_name}", 400
    
    # Send counselling email
    success, email_message = send_counselling_email(student_email, student_name, teacher_name, message)
    
    if success:
        # Store counselling record
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        store_success, store_message = store_counselling_record(sr_no, student_name, teacher_name, message, timestamp)
        
        print(f"Counselling email sent to {student_name} ({student_email}): {message}")
        if store_success:
            print(f"Counselling record stored: {store_message}")
        else:
            print(f"Failed to store counselling record: {store_message}")
        
        return redirect(url_for("student_profile", sr_no=sr_no))
    else:
        print(f"Failed to send counselling email: {email_message}")
        return f"Failed to send email: {email_message}", 500
# ... (keep all your existing code in app.py)

# Chatbot route
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    user_message = data["message"].lower()

    # Simple rule-based chatbot logic
    if "hello" in user_message or "hi" in user_message:
        bot_response = "Hello! How can I help you today?"
    elif "counseling" in user_message:
        bot_response = "You can schedule a counseling session from the student's profile page."
    elif "attendance" in user_message:
        bot_response = "You can view the attendance of all students on the dashboard."
    elif "cgpa" in user_message:
        bot_response = "The dashboard provides a distribution of student CGPA."
    elif "bye" in user_message:
        bot_response = "Goodbye! Have a great day."
    else:
        bot_response = "I'm sorry, I don't understand. Can you please rephrase?"

    return jsonify({"response": bot_response})


# ------------------ RUN APP ------------------
if __name__ == "__main__":
    app.run(debug=True)
