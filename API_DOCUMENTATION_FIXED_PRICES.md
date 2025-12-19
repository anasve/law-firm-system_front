# Fixed Prices API Documentation

## نظرة عامة / Overview

هذا الملف يوثق جميع الـ API endpoints الخاصة بنظام الأسعار الثابتة (Fixed Prices) في النظام. يسمح النظام للعملاء والموظفين بعرض الأسعار الثابتة، بينما يمكن للـ Admin إدارتها بالكامل (إنشاء، تحديث، أرشفة، حذف).

This document describes all API endpoints for the Fixed Prices system. The system allows clients and employees to view fixed prices, while admins can fully manage them (create, update, archive, delete).

---

## Base URLs

- **Client API**: `/api/client`
- **Employee API**: `/api/employee`
- **Admin API**: `/api/admin`

---

## Authentication

جميع الـ endpoints تتطلب مصادقة باستخدام Bearer Token في الـ header:
All endpoints require authentication using Bearer Token in the header:

```
Authorization: Bearer {your_token_here}
```

---

## Client Endpoints

### 1. عرض الأسعار الثابتة النشطة
### Get Active Fixed Prices

**Endpoint:** `GET /api/client/fixed-prices`

**Authentication:** Required (Client token)

**Description:** يعرض جميع الأسعار الثابتة النشطة فقط للعميل
Returns all active fixed prices for the client

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Legal Fees",
      "name_ar": "الأتعاب القانونية",
      "type": "fee",
      "price": 200.00,
      "unit": "hour",
      "description": "Hourly legal consultation fee",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Document Copy",
      "name_ar": "نسخ المستندات",
      "type": "copy",
      "price": 5.00,
      "unit": "page",
      "description": "Per page document copy fee",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    {
      "id": 3,
      "name": "Official Stamps",
      "name_ar": "الطوابع",
      "type": "stamp",
      "price": 10.00,
      "unit": "stamp",
      "description": "Official stamp fee",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    },
    {
      "id": 4,
      "name": "Translation",
      "name_ar": "الترجمة",
      "type": "translation",
      "price": 60.00,
      "unit": "page",
      "description": "Document translation per page",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

**Note:** يتم عرض الأسعار النشطة فقط (is_active = true)
Only active prices are returned (is_active = true)

---

## Employee Endpoints

### 1. عرض الأسعار الثابتة النشطة
### Get Active Fixed Prices

**Endpoint:** `GET /api/employee/fixed-prices`

**Authentication:** Required (Employee token)

**Description:** يعرض جميع الأسعار الثابتة النشطة للموظف (قراءة فقط)
Returns all active fixed prices for employees (read-only)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Legal Fees",
      "name_ar": "الأتعاب القانونية",
      "type": "fee",
      "price": 200.00,
      "unit": "hour",
      "description": "Hourly legal consultation fee",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ]
}
```

**Note:** الموظفون لديهم صلاحية قراءة فقط للأسعار الثابتة
Employees have read-only access to fixed prices

---

## Admin Endpoints

### 1. عرض جميع الأسعار الثابتة
### Get All Fixed Prices

**Endpoint:** `GET /api/admin/fixed-prices`

**Authentication:** Required (Admin token)

**Description:** يعرض جميع الأسعار الثابتة مع إمكانية التصفية والبحث
Returns all fixed prices with filtering and search capabilities

**Query Parameters (Optional):**
- `type` (string): تصفية حسب النوع (`fee`, `copy`, `stamp`, `translation`, `court_fee`, `document`, `other`)
- `is_active` (boolean): تصفية حسب الحالة (true/false)
- `search` (string): البحث في الاسم (الإنجليزية أو العربية) أو الوصف
- `page` (integer): رقم الصفحة
- `per_page` (integer): عدد العناصر في الصفحة (افتراضي: 15)

**Example Requests:**
```
GET /api/admin/fixed-prices
GET /api/admin/fixed-prices?type=fee
GET /api/admin/fixed-prices?is_active=true
GET /api/admin/fixed-prices?search=ترجمة
GET /api/admin/fixed-prices?type=stamp&is_active=true&per_page=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Legal Fees",
      "name_ar": "الأتعاب القانونية",
      "type": "fee",
      "price": 200.00,
      "unit": "hour",
      "description": "Hourly legal consultation fee",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-01T00:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 1,
  "last_page": 1,
  "from": 1,
  "to": 1
}
```

---

### 2. عرض الأسعار النشطة فقط
### Get Active Fixed Prices Only

**Endpoint:** `GET /api/admin/fixed-prices/active`

**Authentication:** Required (Admin token)

**Description:** يعرض الأسعار النشطة فقط
Returns only active fixed prices

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Legal Fees",
      "name_ar": "الأتعاب القانونية",
      "type": "fee",
      "price": 200.00,
      "unit": "hour",
      "description": "Hourly legal consultation fee",
      "is_active": true
    }
  ]
}
```

---

### 3. عرض الأسعار المؤرشفة
### Get Archived Fixed Prices

**Endpoint:** `GET /api/admin/fixed-prices/archived`

**Authentication:** Required (Admin token)

**Description:** يعرض جميع الأسعار المؤرشفة (المحذوفة بشكل مؤقت)
Returns all archived (soft deleted) fixed prices

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 5,
      "name": "Old Service",
      "name_ar": "خدمة قديمة",
      "type": "other",
      "price": 50.00,
      "unit": "service",
      "description": "Old service price",
      "is_active": false,
      "deleted_at": "2025-01-10T00:00:00.000000Z",
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-01-10T00:00:00.000000Z"
    }
  ]
}
```

---

### 4. عرض تفاصيل سعر محدد
### Get Fixed Price Details

**Endpoint:** `GET /api/admin/fixed-prices/{id}`

**Authentication:** Required (Admin token)

**Description:** يعرض تفاصيل سعر ثابت محدد (يشمل المؤرشفة)
Returns details of a specific fixed price (including archived)

**URL Parameters:**
- `id` (integer, required): معرف السعر الثابت

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "Legal Fees",
    "name_ar": "الأتعاب القانونية",
    "type": "fee",
    "price": 200.00,
    "unit": "hour",
    "description": "Hourly legal consultation fee",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z",
    "deleted_at": null
  }
}
```

**Error Responses:**
- `404 Not Found`: السعر غير موجود
  ```json
  {
    "message": "No query results for model [App\\Models\\FixedPrice] {id}"
  }
  ```

---

### 5. إنشاء سعر ثابت جديد
### Create Fixed Price

**Endpoint:** `POST /api/admin/fixed-prices`

**Authentication:** Required (Admin token)

**Description:** إنشاء سعر ثابت جديد
Creates a new fixed price

**Request Body (JSON):**
```json
{
  "name": "Legal Fees",
  "name_ar": "الأتعاب القانونية",
  "type": "fee",
  "price": 200.00,
  "unit": "hour",
  "description": "Hourly legal consultation fee",
  "is_active": true
}
```

**Validation Rules:**
- `name` (string, required): اسم الخدمة بالإنجليزية، الحد الأقصى 255 حرف
- `name_ar` (string, required): اسم الخدمة بالعربية، الحد الأقصى 255 حرف
- `type` (string, required): نوع السعر - يجب أن يكون واحد من: `fee`, `copy`, `stamp`, `translation`, `court_fee`, `document`, `other`
- `price` (numeric, required): السعر، يجب أن يكون أكبر من أو يساوي 0
- `unit` (string, optional): الوحدة (مثل: hour, page, stamp)، الحد الأقصى 255 حرف
- `description` (string, optional): وصف الخدمة، الحد الأقصى 1000 حرف
- `is_active` (boolean, optional): حالة النشاط (افتراضي: true)

**Response (201 Created):**
```json
{
  "message": "تم إنشاء السعر الثابت بنجاح",
  "data": {
    "id": 1,
    "name": "Legal Fees",
    "name_ar": "الأتعاب القانونية",
    "type": "fee",
    "price": 200.00,
    "unit": "hour",
    "description": "Hourly legal consultation fee",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: أخطاء التحقق
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "name": ["The name field is required."],
      "type": ["The selected type is invalid."]
    }
  }
  ```
- `422 Unprocessable Entity`: بيانات غير صحيحة

---

### 6. تحديث سعر ثابت
### Update Fixed Price

**Endpoint:** `PUT /api/admin/fixed-prices/{id}`

**Authentication:** Required (Admin token)

**Description:** تحديث سعر ثابت موجود
Updates an existing fixed price

**URL Parameters:**
- `id` (integer, required): معرف السعر الثابت

**Request Body (JSON):**
```json
{
  "name": "Updated Legal Fees",
  "name_ar": "الأتعاب القانونية المحدثة",
  "price": 250.00,
  "is_active": true
}
```

**Validation Rules:**
نفس قواعد الإنشاء، لكن جميع الحقول اختيارية (استخدم `sometimes`)
Same as create, but all fields are optional (use `sometimes`)

**Response (200 OK):**
```json
{
  "message": "تم تحديث السعر الثابت بنجاح",
  "data": {
    "id": 1,
    "name": "Updated Legal Fees",
    "name_ar": "الأتعاب القانونية المحدثة",
    "type": "fee",
    "price": 250.00,
    "unit": "hour",
    "description": "Hourly legal consultation fee",
    "is_active": true,
    "updated_at": "2025-01-15T10:00:00.000000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: السعر غير موجود
- `400 Bad Request`: أخطاء التحقق

---

### 7. أرشفة سعر ثابت
### Archive Fixed Price (Soft Delete)

**Endpoint:** `DELETE /api/admin/fixed-prices/{id}`

**Authentication:** Required (Admin token)

**Description:** أرشفة سعر ثابت (حذف مؤقت - يمكن استعادته لاحقاً)
Archives a fixed price (soft delete - can be restored later)

**URL Parameters:**
- `id` (integer, required): معرف السعر الثابت

**Response (200 OK):**
```json
{
  "message": "تم أرشفة السعر الثابت بنجاح"
}
```

**What happens:**
- يتم حذف السعر بشكل مؤقت (soft delete)
- لن يظهر في قوائم الأسعار النشطة
- يمكن استعادته لاحقاً
- The price is soft deleted
- It will not appear in active listings
- Can be restored later

**Error Responses:**
- `404 Not Found`: السعر غير موجود

---

### 8. استعادة سعر مؤرشف
### Restore Archived Fixed Price

**Endpoint:** `PUT /api/admin/fixed-prices/{id}/restore`

**Authentication:** Required (Admin token)

**Description:** استعادة سعر ثابت تم أرشفته مسبقاً
Restores a previously archived fixed price

**URL Parameters:**
- `id` (integer, required): معرف السعر الثابت المؤرشف

**Response (200 OK):**
```json
{
  "message": "تم استعادة السعر الثابت بنجاح",
  "data": {
    "id": 5,
    "name": "Old Service",
    "name_ar": "خدمة قديمة",
    "type": "other",
    "price": 50.00,
    "unit": "service",
    "description": "Old service price",
    "is_active": false,
    "deleted_at": null,
    "updated_at": "2025-01-15T10:00:00.000000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: السعر غير موجود أو غير مؤرشف

---

### 9. حذف سعر ثابت نهائياً
### Permanently Delete Fixed Price

**Endpoint:** `DELETE /api/admin/fixed-prices/{id}/force`

**Authentication:** Required (Admin token)

**Description:** حذف سعر ثابت مؤرشف نهائياً (لا يمكن التراجع عن هذا الإجراء)
Permanently deletes an archived fixed price (this action cannot be undone)

**URL Parameters:**
- `id` (integer, required): معرف السعر الثابت المؤرشف

**Response (200 OK):**
```json
{
  "message": "تم حذف السعر الثابت نهائياً"
}
```

**Warning:** ⚠️ هذا الإجراء لا يمكن التراجع عنه!
This action cannot be undone!

**Error Responses:**
- `404 Not Found`: السعر غير موجود أو غير مؤرشف

---

## Data Models

### Fixed Price Object Structure

```json
{
  "id": 1,
  "name": "Legal Fees",
  "name_ar": "الأتعاب القانونية",
  "type": "fee",
  "price": 200.00,
  "unit": "hour",
  "description": "Hourly legal consultation fee",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z",
  "deleted_at": null
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | معرف فريد للسعر |
| `name` | string | اسم الخدمة بالإنجليزية |
| `name_ar` | string | اسم الخدمة بالعربية |
| `type` | string | نوع السعر (انظر الأنواع أدناه) |
| `price` | decimal | السعر (10,2) |
| `unit` | string\|null | الوحدة (ساعة، صفحة، طابع، إلخ) |
| `description` | string\|null | وصف الخدمة |
| `is_active` | boolean | حالة النشاط (true = نشط) |
| `created_at` | datetime | تاريخ الإنشاء |
| `updated_at` | datetime | تاريخ آخر تحديث |
| `deleted_at` | datetime\|null | تاريخ الأرشفة (null إذا لم يتم أرشفته) |

---

## Price Types

| Type | Description | Arabic | Example |
|------|-------------|--------|---------|
| `fee` | الأتعاب القانونية | الأتعاب | Legal consultation fees |
| `copy` | نسخ المستندات | النسخ | Document copies |
| `stamp` | الطوابع الرسمية | الطوابع | Official stamps |
| `translation` | خدمات الترجمة | الترجمة | Translation services |
| `court_fee` | رسوم المحكمة | رسوم المحكمة | Court filing fees |
| `document` | إعداد المستندات | إعداد المستندات | Document preparation |
| `other` | خدمات أخرى | أخرى | Other services |

---

## Validation Rules Summary

### Create (POST):
- `name`: required, string, max:255
- `name_ar`: required, string, max:255
- `type`: required, in:fee,copy,stamp,translation,court_fee,document,other
- `price`: required, numeric, min:0
- `unit`: nullable, string, max:255
- `description`: nullable, string, max:1000
- `is_active`: nullable, boolean (default: true)

### Update (PUT):
- جميع الحقول اختيارية (sometimes)
- نفس قواعد التحقق عند التحديث
- All fields optional (sometimes)
- Same validation rules when updating

---

## Error Codes

| Status Code | Description | Arabic |
|------------|-------------|--------|
| 200 | Success | نجاح |
| 201 | Created successfully | تم الإنشاء بنجاح |
| 400 | Bad Request (validation errors) | طلب غير صحيح (أخطاء التحقق) |
| 401 | Unauthorized (missing or invalid token) | غير مصرح (رمز مفقود أو غير صحيح) |
| 403 | Forbidden (access denied) | محظور (رفض الوصول) |
| 404 | Not Found (resource doesn't exist) | غير موجود |
| 422 | Unprocessable Entity (validation errors) | كيان غير قابل للمعالجة (أخطاء التحقق) |
| 500 | Internal Server Error | خطأ في الخادم |

---

## Example Workflows

### 1. Admin Creates Fixed Price
```http
POST /api/admin/fixed-prices
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Legal Fees",
  "name_ar": "الأتعاب القانونية",
  "type": "fee",
  "price": 200.00,
  "unit": "hour",
  "description": "Hourly legal consultation fee"
}
```

**Response:** Fixed price created successfully

---

### 2. Client Views Fixed Prices
```http
GET /api/client/fixed-prices
Authorization: Bearer {client_token}
```

**Response:** List of active fixed prices

---

### 3. Employee Views Fixed Prices
```http
GET /api/employee/fixed-prices
Authorization: Bearer {employee_token}
```

**Response:** List of active fixed prices

---

### 4. Admin Updates Price
```http
PUT /api/admin/fixed-prices/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "price": 250.00
}
```

**Response:** Price updated successfully

---

### 5. Admin Archives Price
```http
DELETE /api/admin/fixed-prices/1
Authorization: Bearer {admin_token}
```

**Response:** Price archived successfully

---

### 6. Admin Restores Price
```http
PUT /api/admin/fixed-prices/1/restore
Authorization: Bearer {admin_token}
```

**Response:** Price restored successfully

---

## Best Practices

### For Admins:
1. **Clear Naming**: استخدم أسماء واضحة ووصفية بالإنجليزية والعربية
   Use clear and descriptive names in both English and Arabic
2. **Accurate Pricing**: تأكد من دقة الأسعار وحداثتها
   Ensure prices are accurate and up-to-date
3. **Active Status**: استخدم `is_active` لتعطيل الأسعار مؤقتاً دون حذفها
   Use `is_active` to temporarily disable prices without deleting them
4. **Archive Instead of Delete**: أرشف الأسعار بدلاً من حذفها نهائياً للحفاظ على السجل
   Archive prices instead of permanently deleting to maintain history
5. **Consistent Units**: استخدم أسماء وحدات متسقة (مثل: "page", "hour", "stamp")
   Use consistent unit names (e.g., "page", "hour", "stamp")

### For Clients:
1. **Check Active Prices**: فقط الأسعار النشطة مرئية للعملاء
   Only active prices are visible to clients
2. **Price Reference**: استخدم الأسعار الثابتة كمرجع لتكاليف الخدمات
   Use fixed prices as a reference for service costs
3. **Contact for Updates**: اتصل بالـ Admin إذا بدت الأسعار قديمة
   Contact admin if prices seem outdated

### For Employees:
1. **Read-Only Access**: الموظفون يمكنهم عرض الأسعار النشطة فقط ولا يمكنهم تعديلها
   Employees can view active fixed prices but cannot modify them
2. **Price Reference**: استخدم الأسعار الثابتة عند مناقشة التكاليف مع العملاء
   Use fixed prices when discussing costs with clients
3. **Contact Admin**: اتصل بالـ Admin لتحديث الأسعار أو إضافة خدمات جديدة
   Contact admin for price updates or new service additions

---

## Security Considerations

1. **Authentication**: جميع الـ endpoints تتطلب رمز مصادقة صالح
   All endpoints require valid authentication token
2. **Authorization**: فقط الـ Admin يمكنه إنشاء، تحديث، أو حذف الأسعار
   Only admins can create, update, or delete fixed prices
3. **Soft Deletes**: الأسعار تستخدم soft deletes للحفاظ على سجل التدقيق
   Prices use soft deletes to maintain audit trail
4. **Active Filter**: العملاء والموظفون يمكنهم رؤية الأسعار النشطة فقط
   Clients and employees can only see active prices

---

## Notes

1. **Active Prices Only**: العملاء والموظفون يمكنهم عرض الأسعار النشطة فقط
   Clients and employees can only view active fixed prices
2. **Soft Deletes**: الأسعار المؤرشفة يمكن استعادتها
   Archived prices can be restored
3. **Price Types**: استخدم قيم نوع متسقة للتصفية والتنظيم
   Use consistent type values for filtering and organization
4. **Units**: الوحدات اختيارية لكن موصى بها للوضوح
   Units are optional but recommended for clarity
5. **Bilingual**: الأسعار لها أسماء بالإنجليزية والعربية للتدويل
   Prices have both English and Arabic names for internationalization

---

## Support

للأسئلة أو المشاكل، يرجى الاتصال بفريق التطوير.
For issues or questions, please contact the development team.

---

## Postman Collection Example

### Environment Variables
```
base_url = http://localhost:8000
client_token = {your_client_token}
employee_token = {your_employee_token}
admin_token = {your_admin_token}
```

### Example Request (Client)
```http
GET {{base_url}}/api/client/fixed-prices
Authorization: Bearer {{client_token}}
```

### Example Request (Admin - Create)
```http
POST {{base_url}}/api/admin/fixed-prices
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "Legal Fees",
  "name_ar": "الأتعاب القانونية",
  "type": "fee",
  "price": 200.00,
  "unit": "hour",
  "description": "Hourly legal consultation fee"
}
```

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
