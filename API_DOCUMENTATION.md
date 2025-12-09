# توثيق API - نظام المكاتب القانونية

## نظرة عامة

النظام يدعم 4 أنواع من المستخدمين:
- **Guest**: زائر (غير مسجل)
- **Client**: عميل
- **Lawyer**: محامي
- **Employee**: موظف
- **Admin**: مدير

---

## Authentication

جميع الـ endpoints (ما عدا Guest) تحتاج:
```
Authorization: Bearer {token}
```

---

# 1. GUEST ENDPOINTS (الزوار)

## 1.1 Authentication

### Register (التسجيل)
```
POST /api/guest/register
```

**Body:**
```json
{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response:**
```json
{
    "message": "Registered successfully. Check your email for verification."
}
```

---

### Login (تسجيل الدخول)
```
POST /api/guest/login
```

**Body:**
```json
{
    "email": "ahmed@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "token": "1|xxxxxxxxxxxx",
    "client": {
        "id": 1,
        "name": "أحمد محمد",
        "email": "ahmed@example.com"
    }
}
```

---

### Email Verification (تفعيل البريد)
```
GET /api/guest/verify-email/{id}/{hash}
```
(يتم إرسال الرابط تلقائياً في البريد)

---

## 1.2 Public Content

### عرض القوانين
```
GET /api/guest/laws
GET /api/guest/laws/{id}
```

### عرض المحامين
```
GET /api/guest/lawyers
GET /api/guest/lawyers/{id}
```

**Query Parameters:**
- `search`: بحث بالاسم
- `specialization_id`: فلترة حسب التخصص

### عرض التخصصات
```
GET /api/guest/specializations
GET /api/guest/specializations/{id}
```

---

# 2. CLIENT ENDPOINTS (العملاء)

## 2.1 Authentication & Profile

### Logout
```
POST /api/client/logout
```

### Get Profile
```
GET /api/client/profile
```

**Response:**
```json
{
    "id": 1,
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "status": "active"
}
```

### Resend Verification Email
```
POST /api/client/email/verification-notification
```

---

## 2.2 Consultations (الاستشارات)

### إنشاء استشارة جديدة
```
POST /api/client/consultations
```

**Body:**
```json
{
    "lawyer_id": 1,  // اختياري - إذا لم يتم اختياره، يتم البحث حسب التخصص
    "specialization_id": 2,  // اختياري
    "subject": "استشارة قانونية عاجلة",
    "description": "وصف تفصيلي للمشكلة القانونية",
    "priority": "urgent",  // normal | urgent
    "preferred_channel": "chat",  // chat | in_office | call | appointment
    "attachments": [file1, file2],  // اختياري - ملفات
    
    // إذا preferred_channel = "appointment"
    "appointment_availability_id": 5,
    "appointment_type": "online",  // online | in_office | phone
    "appointment_meeting_link": "https://meet.google.com/xxx",  // إذا type = online
    "appointment_notes": "ملاحظات"
}
```

**Response:**
```json
{
    "message": "تم إنشاء الاستشارة بنجاح",
    "consultation": {
        "id": 1,
        "subject": "استشارة قانونية عاجلة",
        "status": "pending",
        "lawyer": {...},
        "appointment": {...}  // إذا تم حجز موعد
    }
}
```

---

### عرض الاستشارات
```
GET /api/client/consultations
```

**Query Parameters:**
- `status`: pending | accepted | rejected | completed | cancelled

**Response:**
```json
[
    {
        "id": 1,
        "subject": "استشارة قانونية",
        "status": "accepted",
        "lawyer": {
            "id": 1,
            "name": "محمد علي"
        },
        "created_at": "2025-12-09T10:00:00.000000Z"
    }
]
```

---

### عرض استشارة محددة
```
GET /api/client/consultations/{id}
```

**Response:**
```json
{
    "id": 1,
    "subject": "استشارة قانونية",
    "description": "وصف تفصيلي",
    "status": "accepted",
    "priority": "urgent",
    "preferred_channel": "chat",
    "lawyer": {
        "id": 1,
        "name": "محمد علي",
        "email": "lawyer@example.com"
    },
    "attachments": [...],
    "messages": [...],
    "appointments": [...],
    "review": {...}
}
```

---

### إلغاء استشارة
```
POST /api/client/consultations/{id}/cancel
```

---

### إرسال رسالة في الاستشارة
```
POST /api/client/consultations/{consultationId}/messages
```

**Body:**
```json
{
    "message": "نص الرسالة",
    "attachment": file  // اختياري
}
```

---

### عرض رسائل الاستشارة
```
GET /api/client/consultations/{consultationId}/messages
```

**Response:**
```json
[
    {
        "id": 1,
        "sender_type": "client",
        "message": "نص الرسالة",
        "attachment_path": "path/to/file",
        "created_at": "2025-12-09T10:00:00.000000Z"
    }
]
```

---

### تقييم الاستشارة
```
POST /api/client/consultations/{consultationId}/review
```

**Body:**
```json
{
    "rating": 5,  // 1-5
    "comment": "تعليق على الاستشارة"  // اختياري
}
```

---

## 2.3 Appointments (المواعيد)

### عرض الأوقات المتاحة لمحامي
```
GET /api/client/lawyers/{lawyerId}/available-slots?date=2025-12-15
```

**Response:**
```json
{
    "date": "2025-12-15",
    "lawyer_id": 1,
    "available_slots": [
        {
            "id": 5,
            "start_time": "09:00",
            "end_time": "10:00",
            "duration": 60
        }
    ]
}
```

---

### حجز موعد مباشر (بدون استشارة)
```
POST /api/client/appointments/direct
```

**Body:**
```json
{
    "lawyer_id": 1,
    "availability_id": 5,
    "subject": "استشارة قانونية عاجلة",
    "description": "وصف المشكلة",
    "type": "online",  // online | in_office | phone
    "meeting_link": "https://meet.google.com/xxx",  // إذا type = online
    "notes": "ملاحظات إضافية"
}
```

**Response:**
```json
{
    "message": "تم حجز الموعد بنجاح. سيتم تأكيده من قبل الموظف قريباً.",
    "appointment": {
        "id": 1,
        "status": "pending",
        "datetime": "2025-12-15 09:00:00",
        "lawyer": {...}
    }
}
```

---

### حجز موعد لاستشارة موجودة
```
POST /api/client/consultations/{consultationId}/appointments
```

**Body:**
```json
{
    "availability_id": 5,
    "type": "in_office",
    "meeting_link": "https://meet.google.com/xxx",  // إذا type = online
    "notes": "ملاحظات"
}
```

---

### عرض مواعيد العميل
```
GET /api/client/appointments
```

**Query Parameters:**
- `status`: pending | confirmed | done | cancelled

**Response:**
```json
[
    {
        "id": 1,
        "datetime": "2025-12-15 09:00:00",
        "status": "confirmed",
        "type": "online",
        "lawyer": {
            "id": 1,
            "name": "محمد علي"
        },
        "consultation": {...}
    }
]
```

---

### عرض موعد محدد
```
GET /api/client/appointments/{id}
```

---

### إلغاء موعد
```
POST /api/client/appointments/{id}/cancel
```

**Body:**
```json
{
    "cancellation_reason": "سبب الإلغاء"  // اختياري
}
```

**Note:** لا يمكن الإلغاء قبل ساعة واحدة من الموعد

---

### إعادة جدولة موعد
```
POST /api/client/appointments/{id}/reschedule
```

**Body:**
```json
{
    "availability_id": 10
}
```

---

# 3. LAWYER ENDPOINTS (المحامين)

## 3.1 Authentication & Profile

### Logout
```
POST /api/lawyer/logout
```

### Get Profile
```
GET /api/lawyer/profile
```

---

## 3.2 Consultations (الاستشارات)

### عرض استشارات المحامي
```
GET /api/lawyer/consultations
```

**Query Parameters:**
- `status`: pending | accepted | rejected | completed

**Response:**
```json
[
    {
        "id": 1,
        "subject": "استشارة قانونية",
        "status": "pending",
        "client": {
            "id": 1,
            "name": "أحمد محمد"
        },
        "created_at": "2025-12-09T10:00:00.000000Z"
    }
]
```

---

### عرض استشارة محددة
```
GET /api/lawyer/consultations/{id}
```

---

### قبول استشارة
```
POST /api/lawyer/consultations/{id}/accept
```

**Body:**
```json
{
    "notes": "ملاحظات"  // اختياري
}
```

---

### رفض استشارة
```
POST /api/lawyer/consultations/{id}/reject
```

**Body:**
```json
{
    "rejection_reason": "سبب الرفض"  // اختياري
}
```

---

### إنهاء استشارة
```
POST /api/lawyer/consultations/{id}/complete
```

**Body:**
```json
{
    "legal_summary": "ملخص قانوني لما تم الاتفاق عليه"
}
```

---

### إرسال رسالة في الاستشارة
```
POST /api/lawyer/consultations/{consultationId}/messages
```

**Body:**
```json
{
    "message": "نص الرسالة",
    "attachment": file  // اختياري
}
```

---

### عرض رسائل الاستشارة
```
GET /api/lawyer/consultations/{consultationId}/messages
```

---

## 3.3 Appointments (المواعيد) - قراءة فقط

### عرض مواعيد المحامي
```
GET /api/lawyer/appointments
```

**Query Parameters:**
- `status`: pending | confirmed | done | cancelled
- `upcoming`: true (للمواعيد القادمة فقط)

---

### عرض مواعيد قادمة
```
GET /api/lawyer/appointments/upcoming
```

---

### عرض موعد محدد
```
GET /api/lawyer/appointments/{id}
```

---

# 4. EMPLOYEE ENDPOINTS (الموظفين)

## 4.1 Authentication & Profile

### Login
```
POST /api/employee/login
```

**Body:**
```json
{
    "email": "employee@example.com",
    "password": "password123"
}
```

### Logout
```
POST /api/employee/logout
```

### Get Profile
```
GET /api/employee/profile
```

---

## 4.2 Client Management (إدارة العملاء)

### عرض جميع العملاء
```
GET /api/employee/clients
```

**Query Parameters:**
- `status`: pending | active | suspended | rejected
- `search`: بحث بالاسم أو البريد

---

### عرض العملاء المعلقة (في انتظار الموافقة)
```
GET /api/employee/clients/pending-verified
```

---

### عرض العملاء المعتمدين
```
GET /api/employee/clients/approved
```

---

### عرض العملاء المرفوضين
```
GET /api/employee/clients/rejected
```

---

### عرض العملاء المعلقين
```
GET /api/employee/clients/suspended
```

---

### عرض العملاء المؤرشفين
```
GET /api/employee/clients/archived
```

---

### عرض عميل محدد
```
GET /api/employee/clients/{id}
```

---

### تفعيل عميل
```
POST /api/employee/clients/{id}/activate
```

---

### رفض عميل
```
POST /api/employee/clients/{id}/reject
```

---

### تعليق عميل
```
POST /api/employee/clients/{id}/suspend
```

---

### تحديث بيانات عميل
```
PUT /api/employee/clients/{id}
```

**Body:**
```json
{
    "name": "اسم جديد",
    "email": "email@example.com",
    "status": "active"
}
```

---

### حذف عميل (soft delete)
```
DELETE /api/employee/clients/{id}
```

---

### استعادة عميل محذوف
```
PUT /api/employee/clients/{id}/restore
```

---

### حذف نهائي
```
DELETE /api/employee/clients/{id}/force
```

---

## 4.3 Consultations Management (إدارة الاستشارات)

### عرض جميع الاستشارات
```
GET /api/employee/consultations
```

**Query Parameters:**
- `status`: pending | accepted | rejected | completed
- `lawyer_id`: فلترة حسب المحامي
- `client_id`: فلترة حسب العميل

---

### عرض الاستشارات المعلقة (بدون محامي)
```
GET /api/employee/consultations/pending
```

---

### عرض استشارة محددة
```
GET /api/employee/consultations/{id}
```

---

### إسناد استشارة لمحامي
```
POST /api/employee/consultations/{id}/assign
```

**Body:**
```json
{
    "lawyer_id": 1
}
```

---

### إسناد تلقائي حسب التخصص
```
POST /api/employee/consultations/{id}/auto-assign
```

---

### إحصائيات الاستشارات
```
GET /api/employee/consultations/statistics
```

**Response:**
```json
{
    "total": 100,
    "pending": 10,
    "accepted": 50,
    "completed": 30,
    "rejected": 10,
    "unassigned": 5
}
```

---

## 4.4 Availability Management (إدارة الأوقات المتاحة)

### إنشاء جدول عمل بسيط (يولد الأوقات تلقائياً)
```
POST /api/employee/availability/create-schedule
```

**Body:**
```json
{
    "lawyer_id": 1,
    "days_of_week": [1, 2, 3, 4, 5],  // 0=الأحد، 6=السبت
    "start_time": "09:00",
    "end_time": "17:00",
    "start_date": "2025-12-10",
    "end_date": "2025-12-31",
    "slot_duration": 60  // مدة كل موعد بالدقائق (افتراضي 60)
}
```

**Response:**
```json
{
    "message": "تم إنشاء الجدول بنجاح",
    "created_slots": 150,
    "skipped_slots": 5,
    "errors": []
}
```

---

### إضافة وقت متاح
```
POST /api/employee/availability
```

**Body:**
```json
{
    "lawyer_id": 1,
    "date": "2025-12-15",
    "start_time": "09:00",
    "end_time": "10:00",
    "notes": "ملاحظات",
    "is_vacation": false,  // اختياري
    "vacation_reason": "إجازة"  // إذا is_vacation = true
}
```

---

### عرض الأوقات المتاحة
```
GET /api/employee/availability
```

**Query Parameters:**
- `lawyer_id`: فلترة حسب المحامي
- `date`: فلترة حسب التاريخ
- `status`: available | booked | unavailable

---

### تحديث وقت متاح
```
PUT /api/employee/availability/{id}
```

**Body:**
```json
{
    "date": "2025-12-15",
    "start_time": "10:00",
    "end_time": "11:00",
    "status": "available",
    "is_vacation": false
}
```

---

### حذف وقت متاح
```
DELETE /api/employee/availability/{id}
```

---

### إضافة أوقات متعددة دفعة واحدة
```
POST /api/employee/availability/batch
```

**Body:**
```json
{
    "lawyer_id": 1,
    "availabilities": [
        {
            "date": "2025-12-15",
            "start_time": "09:00",
            "end_time": "10:00"
        },
        {
            "date": "2025-12-15",
            "start_time": "10:00",
            "end_time": "11:00"
        }
    ]
}
```

---

## 4.5 Availability Templates (قوالب الأوقات)

### إنشاء قالب أوقات
```
POST /api/employee/availability-templates
```

**Body:**
```json
{
    "lawyer_id": 1,
    "name": "أوقات العمل الأسبوعية",
    "start_time": "09:00",
    "end_time": "17:00",
    "days_of_week": [1, 2, 3, 4, 5],
    "start_date": "2025-12-01",
    "end_date": "2025-12-31",
    "is_active": true
}
```

---

### تطبيق قالب على فترة زمنية
```
POST /api/employee/availability-templates/{id}/apply
```

**Body:**
```json
{
    "start_date": "2025-12-01",
    "end_date": "2025-12-31"
}
```

---

### عرض القوالب
```
GET /api/employee/availability-templates
```

**Query Parameters:**
- `lawyer_id`: فلترة حسب المحامي
- `is_active`: true | false

---

### تحديث قالب
```
PUT /api/employee/availability-templates/{id}
```

---

### حذف قالب
```
DELETE /api/employee/availability-templates/{id}
```

---

## 4.6 Appointments Management (إدارة المواعيد)

### عرض جميع المواعيد
```
GET /api/employee/appointments
```

**Query Parameters:**
- `lawyer_id`: فلترة حسب المحامي
- `client_id`: فلترة حسب العميل
- `status`: pending | confirmed | done | cancelled
- `date`: فلترة حسب التاريخ

---

### عرض موعد محدد
```
GET /api/employee/appointments/{id}
```

---

### تحديث موعد
```
PUT /api/employee/appointments/{id}
```

**Body:**
```json
{
    "datetime": "2025-12-15 10:00:00",
    "type": "online",
    "meeting_link": "https://meet.google.com/xxx",
    "notes": "ملاحظات",
    "status": "confirmed"
}
```

---

### تأكيد موعد
```
POST /api/employee/appointments/{id}/confirm
```

**Response:**
```json
{
    "message": "تم تأكيد الموعد بنجاح",
    "appointment": {...}
}
```

---

### إلغاء موعد
```
POST /api/employee/appointments/{id}/cancel
```

**Body:**
```json
{
    "cancellation_reason": "سبب الإلغاء"  // اختياري
}
```

---

### حذف موعد
```
DELETE /api/employee/appointments/{id}
```

---

# 5. ADMIN ENDPOINTS (المدير)

## 5.1 Authentication & Profile

### Login
```
POST /api/admin/login
```

### Logout
```
POST /api/admin/logout
```

### Get Profile
```
GET /api/admin/profile
```

---

## 5.2 Lawyers Management (إدارة المحامين)

### عرض جميع المحامين
```
GET /api/admin/lawyers
```

### إنشاء محامي
```
POST /api/admin/lawyers
```

**Body:**
```json
{
    "name": "محمد علي",
    "email": "lawyer@example.com",
    "password": "password123",
    "phone": "0123456789",
    "specializations": [1, 2, 3]
}
```

### تحديث محامي
```
PUT /api/admin/lawyers/{id}
```

### حذف محامي
```
DELETE /api/admin/lawyers/{id}
```

---

## 5.3 Employees Management (إدارة الموظفين)

### عرض جميع الموظفين
```
GET /api/admin/employees
```

### إنشاء موظف
```
POST /api/admin/employees
```

### تحديث موظف
```
PUT /api/admin/employees/{id}
```

### حذف موظف
```
DELETE /api/admin/employees/{id}
```

---

## 5.4 Laws Management (إدارة القوانين)

### عرض جميع القوانين
```
GET /api/admin/laws
```

### إنشاء قانون
```
POST /api/admin/laws
```

**Body:**
```json
{
    "title": "عنوان القانون",
    "content": "محتوى القانون",
    "status": "published"  // draft | published
}
```

### تحديث قانون
```
PUT /api/admin/laws/{id}
```

### حذف قانون
```
DELETE /api/admin/laws/{id}
```

---

## 5.5 Specializations Management (إدارة التخصصات)

### عرض جميع التخصصات
```
GET /api/admin/specializations
```

### إنشاء تخصص
```
POST /api/admin/specializations
```

**Body:**
```json
{
    "name": "قانون تجاري",
    "description": "وصف التخصص"
}
```

### تحديث تخصص
```
PUT /api/admin/specializations/{id}
```

### حذف تخصص
```
DELETE /api/admin/specializations/{id}
```

---

## 5.6 Consultations (قراءة فقط)

### عرض جميع الاستشارات
```
GET /api/admin/consultations
```

### عرض استشارة محددة
```
GET /api/admin/consultations/{id}
```

### إحصائيات الاستشارات
```
GET /api/admin/consultations/statistics
```

---

# 6. STATUS CODES & ERRORS

## Status Codes:
- `200`: نجاح
- `201`: تم الإنشاء بنجاح
- `400`: خطأ في البيانات
- `401`: غير مصرح (غير مسجل دخول)
- `403`: ممنوع (لا يوجد صلاحية)
- `404`: غير موجود
- `422`: خطأ في التحقق من البيانات
- `500`: خطأ في الخادم

## Error Response Format:
```json
{
    "message": "رسالة الخطأ",
    "errors": {
        "field": ["خطأ 1", "خطأ 2"]
    }
}
```

---

# 7. DATA MODELS

## Consultation Status:
- `pending`: معلقة (في انتظار القبول)
- `accepted`: مقبولة
- `rejected`: مرفوضة
- `completed`: مكتملة
- `cancelled`: ملغاة

## Appointment Status:
- `pending`: معلق (في انتظار التأكيد)
- `confirmed`: مؤكد
- `done`: منجز
- `cancelled`: ملغى

## Appointment Type:
- `online`: اجتماع افتراضي
- `in_office`: في المكتب
- `phone`: مكالمة هاتفية

## Client Status:
- `pending`: في انتظار الموافقة
- `active`: نشط
- `suspended`: معلق
- `rejected`: مرفوض

## Priority:
- `normal`: عادي
- `urgent`: مستعجل

## Preferred Channel:
- `chat`: محادثة داخل الموقع
- `in_office`: حضور شخصي
- `call`: مكالمة هاتفية
- `appointment`: موعد مباشر

---

# 8. NOTIFICATIONS

جميع الإشعارات تُحفظ في جدول `notifications` في قاعدة البيانات.

## Notification Types:
- `NewConsultationNotification`: استشارة جديدة
- `ConsultationAcceptedNotification`: قبول استشارة
- `ConsultationRejectedNotification`: رفض استشارة
- `NewMessageNotification`: رسالة جديدة
- `NewAppointmentNotification`: موعد جديد
- `AppointmentConfirmedNotification`: تأكيد موعد
- `AppointmentCancelledNotification`: إلغاء موعد
- `AppointmentReminderNotification`: تذكير بالموعد

## Get Notifications:
(يحتاج إضافة endpoints للإشعارات)

---

# 9. FILE UPLOADS

## Supported File Types:
- Images: jpg, jpeg, png
- Documents: pdf, doc, docx

## Max File Size:
- 10MB per file

## Upload Endpoints:
- Consultation attachments: عند إنشاء/تحديث استشارة
- Message attachments: عند إرسال رسالة

---

# 10. PAGINATION

الـ endpoints التي تعرض قوائم تدعم pagination:

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `per_page`: عدد العناصر في الصفحة (افتراضي: 15)

**Response:**
```json
{
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
}
```

---

# 11. SEARCH & FILTERING

معظم endpoints تدعم البحث والفلترة:

**Common Query Parameters:**
- `search`: بحث نصي
- `status`: فلترة حسب الحالة
- `date`: فلترة حسب التاريخ
- `lawyer_id`: فلترة حسب المحامي
- `client_id`: فلترة حسب العميل

---

# 12. DATE FORMATS

- **Date**: `YYYY-MM-DD` (مثال: 2025-12-15)
- **Time**: `HH:MM` (مثال: 09:00)
- **DateTime**: `YYYY-MM-DD HH:MM:SS` (مثال: 2025-12-15 09:00:00)
- **Timezone**: UTC

---

# 13. VALIDATION RULES

## Common Validations:
- `required`: مطلوب
- `email`: صيغة بريد صحيحة
- `exists:table,column`: يجب أن يكون موجود في الجدول
- `in:value1,value2`: يجب أن يكون أحد القيم المحددة
- `min:value`: الحد الأدنى
- `max:value`: الحد الأقصى
- `date`: تاريخ صحيح
- `after:date`: بعد تاريخ محدد
- `url`: رابط صحيح

---

# 14. BEST PRACTICES

1. **Always check authentication**: تأكد من وجود token في الـ headers
2. **Handle errors gracefully**: تعامل مع الأخطاء بشكل صحيح
3. **Validate on frontend**: تحقق من البيانات في الواجهة قبل الإرسال
4. **Show loading states**: اعرض حالة التحميل أثناء الطلبات
5. **Cache when possible**: استخدم التخزين المؤقت عند الإمكان
6. **Poll for updates**: استخدم polling للإشعارات والتحديثات
7. **Handle pagination**: تعامل مع الصفحات بشكل صحيح
8. **File uploads**: اعرض تقدم رفع الملفات

---

# 15. EXAMPLE FLOWS

## Flow 1: Client Books Appointment
1. Client views available lawyers → `GET /api/guest/lawyers`
2. Client views available slots → `GET /api/client/lawyers/{id}/available-slots?date=2025-12-15`
3. Client books appointment → `POST /api/client/appointments/direct`
4. Employee confirms → `POST /api/employee/appointments/{id}/confirm`
5. Client receives notification

## Flow 2: Client Creates Consultation
1. Client creates consultation → `POST /api/client/consultations`
2. Employee assigns to lawyer → `POST /api/employee/consultations/{id}/assign`
3. Lawyer accepts → `POST /api/lawyer/consultations/{id}/accept`
4. Client and lawyer chat → `POST /api/client/consultations/{id}/messages`
5. Lawyer completes → `POST /api/lawyer/consultations/{id}/complete`
6. Client reviews → `POST /api/client/consultations/{id}/review`

---

# END OF DOCUMENTATION

