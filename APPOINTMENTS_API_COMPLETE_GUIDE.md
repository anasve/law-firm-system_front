# 📅 توثيق شامل - API المواعيد (Appointments) للـ Frontend

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [تسلسل العمل الكامل](#تسلسل-العمل-الكامل)
3. [جميع الـ Endpoints](#جميع-الـ-endpoints)
4. [أمثلة React Code](#أمثلة-react-code)
5. [Error Handling](#error-handling)
6. [حالات الاستخدام](#حالات-الاستخدام)

---

## 🎯 نظرة عامة

نظام المواعيد يسمح للعملاء بـ:
- ✅ عرض الأوقات المتاحة للمحامي
- ✅ حجز موعد مباشر (مع أو بدون استشارة)
- ✅ طلب وقت مخصص (Custom Time Request)
- ✅ إلغاء المواعيد
- ✅ إعادة جدولة المواعيد
- ✅ عرض جميع مواعيدهم

---

## 🔄 تسلسل العمل الكامل

### السيناريو 1: حجز موعد عادي (مع وقت متاح)

```
1. العميل يختار محامي
   ↓
2. العميل يختار تاريخ
   ↓
3. GET /api/client/lawyers/{lawyerId}/available-slots?date=2025-12-19
   → يعرض الأوقات المتاحة (available) والمحجوزة (booked)
   ↓
4. العميل يختار وقت متاح (available)
   ↓
5. POST /api/client/appointments/direct
   {
     "lawyer_id": 1,
     "availability_id": 5,
     "subject": "استشارة قانونية",
     "description": "وصف تفصيلي",
     "type": "online",
     "meeting_link": "https://meet.google.com/xxx"
   }
   ↓
6. الموعد يُنشأ بحالة "pending"
   ↓
7. الموظف/المحامي يؤكد الموعد → status: "confirmed"
```

---

### السيناريو 2: طلب وقت مخصص (Custom Time Request)

```
1. العميل يختار محامي
   ↓
2. العميل يختار تاريخ
   ↓
3. GET /api/client/lawyers/{lawyerId}/available-slots?date=2025-12-19
   → لا يوجد أوقات متاحة (available_count: 0)
   ↓
4. العميل يختار "طلب وقت مخصص"
   ↓
5. العميل يدخل الوقت المفضل (مثلاً: 14:30)
   ↓
6. POST /api/client/appointments/direct
   {
     "lawyer_id": 1,
     "datetime": "2025-12-19T14:30:00",
     "preferred_time": "14:30",
     "preferred_date": "2025-12-19",
     "subject": "استشارة قانونية",
     "description": "وصف تفصيلي",
     "type": "online",
     "meeting_link": "https://meet.google.com/xxx"
   }
   ↓
7. الموعد يُنشأ بحالة "pending" و availability_id: null
   ↓
8. المحامي/الموظف يراجع الطلب ويؤكد أو يرفض
```

---

### السيناريو 3: حجز موعد من استشارة

```
1. العميل لديه استشارة مقبولة (status: "accepted")
   ↓
2. العميل يختار حجز موعد من صفحة الاستشارة
   ↓
3. GET /api/client/lawyers/{lawyerId}/available-slots?date=2025-12-19
   ↓
4. العميل يختار وقت متاح
   ↓
5. POST /api/client/consultations/{consultationId}/appointments
   {
     "availability_id": 5,
     "type": "online",
     "meeting_link": "https://meet.google.com/xxx"
   }
   ↓
6. الموعد يُنشأ ويرتبط بالاستشارة
```

---

### السيناريو 4: إلغاء موعد

```
1. العميل يعرض مواعيده
   GET /api/client/appointments
   ↓
2. العميل يختار موعد للإلغاء
   ↓
3. POST /api/client/appointments/{id}/cancel
   {
     "cancellation_reason": "سبب الإلغاء"
   }
   ↓
4. التحقق: لا يمكن الإلغاء قبل ساعة من الموعد
   ↓
5. الموعد يُلغى → status: "cancelled"
   ↓
6. إذا كان الموعد مرتبط بـ availability_id، يتم تحرير الوقت
```

---

### السيناريو 5: إعادة جدولة موعد

```
1. العميل يعرض موعد محدد
   GET /api/client/appointments/{id}
   ↓
2. العميل يختار "إعادة جدولة"
   ↓
3. GET /api/client/lawyers/{lawyerId}/available-slots?date=2025-12-20
   ↓
4. العميل يختار وقت جديد متاح
   ↓
5. POST /api/client/appointments/{id}/reschedule
   {
     "availability_id": 10
   }
   ↓
6. الموعد يُحدث إلى الوقت الجديد
```

---

## 📡 جميع الـ Endpoints

### 1. عرض الأوقات المتاحة

**Endpoint:**
```
GET /api/client/lawyers/{lawyerId}/available-slots
```

**Query Parameters:**
- `date` (required): `YYYY-MM-DD` (مثال: `2025-12-19`)

**Headers:**
```
Authorization: Bearer {client_token}
Accept: application/json
```

**Response:**
```json
{
  "date": "2025-12-19",
  "lawyer_id": 1,
  "slots": {
    "available": [
      {
        "id": 5,
        "start_time": "09:00",
        "end_time": "10:00",
        "duration": 60,
        "status": "available"
      }
    ],
    "booked": [
      {
        "id": 7,
        "start_time": "11:00",
        "end_time": "12:00",
        "duration": 60,
        "status": "booked",
        "appointment_id": 3
      }
    ],
    "unavailable": [],
    "past": []
  },
  "summary": {
    "total": 10,
    "available_count": 5,
    "booked_count": 3,
    "unavailable_count": 1,
    "past_count": 1
  }
}
```

**حالات الأوقات:**
- `available` ✅ - فارغ، يمكن الحجز (أخضر)
- `booked` ❌ - محجوز (أحمر)
- `unavailable` ⚠️ - معطل/إجازة (رمادي)
- `past` ⏰ - في الماضي (رمادي)

---

### 2. حجز موعد مباشر (مع وقت متاح)

**Endpoint:**
```
POST /api/client/appointments/direct
```

**Headers:**
```
Authorization: Bearer {client_token}
Content-Type: application/json
Accept: application/json
```

**Request Body:**
```json
{
  "lawyer_id": 1,
  "availability_id": 5,
  "subject": "استشارة قانونية",
  "description": "وصف تفصيلي للمشكلة (10 أحرف على الأقل)",
  "type": "online",
  "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",
  "notes": "ملاحظات إضافية (اختياري)"
}
```

**Response (201):**
```json
{
  "message": "تم حجز الموعد بنجاح. سيتم تأكيده من قبل الموظف قريباً.",
  "appointment": {
    "id": 1,
    "lawyer_id": 1,
    "client_id": 6,
    "consultation_id": null,
    "availability_id": 5,
    "subject": "استشارة قانونية",
    "description": "وصف تفصيلي",
    "datetime": "2025-12-19 09:00:00",
    "type": "online",
    "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",
    "status": "pending",
    "is_custom_time_request": false,
    "lawyer": {
      "id": 1,
      "name": "محمد علي",
      "email": "lawyer@example.com"
    },
    "created_at": "2025-12-09T10:00:00.000000Z",
    "updated_at": "2025-12-09T10:00:00.000000Z"
  }
}
```

---

### 3. طلب وقت مخصص (Custom Time Request)

**Endpoint:**
```
POST /api/client/appointments/direct
```

**Request Body:**
```json
{
  "lawyer_id": 1,
  "datetime": "2025-12-19T14:30:00",
  "preferred_time": "14:30",
  "preferred_date": "2025-12-19",
  "subject": "استشارة قانونية",
  "description": "وصف تفصيلي للمشكلة",
  "type": "online",
  "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",
  "notes": "ملاحظات إضافية (اختياري)"
}
```

**ملاحظات:**
- ❌ **لا ترسل** `availability_id` عند طلب وقت مخصص
- ✅ **يجب إرسال** `datetime`, `preferred_time`, `preferred_date`
- صيغة `datetime`: `YYYY-MM-DDTHH:mm:ss` أو `YYYY-MM-DD HH:mm:ss`

**Response (201):**
```json
{
  "message": "تم إرسال طلب الموعد بنجاح. سيتم تأكيد الوقت من قبل المحامي إذا كان متاحاً.",
  "appointment": {
    "id": 2,
    "lawyer_id": 1,
    "client_id": 6,
    "consultation_id": null,
    "availability_id": null,
    "subject": "استشارة قانونية",
    "description": "وصف تفصيلي",
    "datetime": "2025-12-19 14:30:00",
    "type": "online",
    "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",
    "status": "pending",
    "is_custom_time_request": true,
    "lawyer": {
      "id": 1,
      "name": "محمد علي"
    }
  }
}
```

---

### 4. حجز موعد من استشارة

**Endpoint:**
```
POST /api/client/consultations/{consultationId}/appointments
```

**Request Body:**
```json
{
  "availability_id": 5,
  "type": "online",
  "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",
  "notes": "ملاحظات (اختياري)"
}
```

**ملاحظات:**
- الاستشارة يجب أن تكون `status: "accepted"`
- المحامي يُؤخذ تلقائياً من الاستشارة

---

### 5. عرض جميع المواعيد

**Endpoint:**
```
GET /api/client/appointments
```

**Query Parameters (اختياري):**
- `status`: `pending`, `confirmed`, `done`, `cancelled`
- `date`: `YYYY-MM-DD`
- `lawyer_id`: رقم المحامي

**Response:**
```json
[
  {
    "id": 1,
    "lawyer_id": 1,
    "client_id": 6,
    "subject": "استشارة قانونية",
    "description": "وصف تفصيلي",
    "datetime": "2025-12-19 09:00:00",
    "type": "online",
    "meeting_link": "https://meet.google.com/xxx",
    "status": "pending",
    "is_custom_time_request": false,
    "lawyer": {
      "id": 1,
      "name": "محمد علي"
    },
    "consultation": null
  }
]
```

---

### 6. عرض موعد محدد

**Endpoint:**
```
GET /api/client/appointments/{id}
```

**Response:**
```json
{
  "id": 1,
  "lawyer_id": 1,
  "client_id": 6,
  "subject": "استشارة قانونية",
  "description": "وصف تفصيلي",
  "datetime": "2025-12-19 09:00:00",
  "type": "online",
  "meeting_link": "https://meet.google.com/xxx",
  "status": "pending",
  "is_custom_time_request": false,
  "lawyer": {
    "id": 1,
    "name": "محمد علي",
    "email": "lawyer@example.com"
  },
  "consultation": null,
  "availability": {
    "id": 5,
    "start_time": "09:00",
    "end_time": "10:00"
  }
}
```

---

### 7. إلغاء موعد

**Endpoint:**
```
POST /api/client/appointments/{id}/cancel
```

**Request Body:**
```json
{
  "cancellation_reason": "سبب الإلغاء (اختياري)"
}
```

**Response (200):**
```json
{
  "message": "تم إلغاء الموعد بنجاح",
  "appointment": {
    "id": 1,
    "status": "cancelled",
    "cancellation_reason": "سبب الإلغاء",
    "cancelled_by": "client"
  }
}
```

**قواعد الإلغاء:**
- ❌ لا يمكن الإلغاء قبل ساعة من الموعد
- ✅ يمكن الإلغاء قبل ساعة أو أكثر

---

### 8. إعادة جدولة موعد

**Endpoint:**
```
POST /api/client/appointments/{id}/reschedule
```

**Request Body:**
```json
{
  "availability_id": 10
}
```

**Response (200):**
```json
{
  "message": "تم إعادة جدولة الموعد بنجاح",
  "appointment": {
    "id": 1,
    "availability_id": 10,
    "datetime": "2025-12-20 10:00:00"
  }
}
```

**قواعد إعادة الجدولة:**
- ❌ لا يمكن إعادة الجدولة قبل ساعة من الموعد الأصلي
- ✅ يجب أن يكون `availability_id` متاح (available)
- ✅ لا يمكن إعادة الجدولة للمواعيد الماضية

---

### 9. تقويم شهري

**Endpoint:**
```
GET /api/client/appointments/calendar/month?year=2025&month=12
```

**Query Parameters:**
- `year` (required): السنة (مثال: `2025`)
- `month` (required): الشهر (مثال: `12`)

**Response:**
```json
{
  "year": 2025,
  "month": 12,
  "appointments": [
    {
      "date": "2025-12-19",
      "appointments": [
        {
          "id": 1,
          "datetime": "2025-12-19 09:00:00",
          "status": "pending",
          "lawyer": {
            "name": "محمد علي"
          }
        }
      ]
    }
  ]
}
```

---

## 💻 أمثلة React Code

### 1. إعداد API Service

```javascript
// src/services/appointmentsApi.js
import api from './api'; // axios instance مع baseURL

export const appointmentsApi = {
  // جلب الأوقات المتاحة
  getAvailableSlots: async (lawyerId, date) => {
    const response = await api.get(
      `/client/lawyers/${lawyerId}/available-slots`,
      { params: { date } }
    );
    return response.data;
  },

  // حجز موعد مباشر (مع وقت متاح)
  bookDirectAppointment: async (data) => {
    const response = await api.post('/client/appointments/direct', data);
    return response.data;
  },

  // طلب وقت مخصص
  requestCustomTime: async (data) => {
    const response = await api.post('/client/appointments/direct', {
      ...data,
      datetime: `${data.preferred_date}T${data.preferred_time}:00`,
    });
    return response.data;
  },

  // جلب جميع المواعيد
  getMyAppointments: async (filters = {}) => {
    const response = await api.get('/client/appointments', { params: filters });
    return response.data;
  },

  // عرض موعد محدد
  getAppointment: async (id) => {
    const response = await api.get(`/client/appointments/${id}`);
    return response.data;
  },

  // إلغاء موعد
  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/client/appointments/${id}/cancel`, {
      cancellation_reason: reason,
    });
    return response.data;
  },

  // إعادة جدولة
  rescheduleAppointment: async (id, availabilityId) => {
    const response = await api.post(`/client/appointments/${id}/reschedule`, {
      availability_id: availabilityId,
    });
    return response.data;
  },

  // تقويم شهري
  getCalendarMonth: async (year, month) => {
    const response = await api.get('/client/appointments/calendar/month', {
      params: { year, month },
    });
    return response.data;
  },
};
```

---

### 2. Component: عرض الأوقات المتاحة

```jsx
// src/components/AppointmentSlots.jsx
import { useState, useEffect } from 'react';
import { appointmentsApi } from '../services/appointmentsApi';

const AppointmentSlots = ({ lawyerId, selectedDate }) => {
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lawyerId && selectedDate) {
      fetchSlots();
    }
  }, [lawyerId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getAvailableSlots(
        lawyerId,
        selectedDate
      );
      setSlots(data);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!slots) return null;

  return (
    <div>
      <h3>الأوقات المتاحة - {slots.date}</h3>
      
      {/* ملخص */}
      <div>
        <p>المجموع: {slots.summary.total}</p>
        <p>متاح: {slots.summary.available_count} ✅</p>
        <p>محجوز: {slots.summary.booked_count} ❌</p>
      </div>

      {/* الأوقات المتاحة */}
      <div>
        <h4>متاح للحجز:</h4>
        {slots.slots.available.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSlotSelect(slot)}
            style={{ backgroundColor: 'green', color: 'white' }}
          >
            {slot.start_time} - {slot.end_time}
          </button>
        ))}
      </div>

      {/* الأوقات المحجوزة */}
      <div>
        <h4>محجوز:</h4>
        {slots.slots.booked.map((slot) => (
          <div key={slot.id} style={{ color: 'red' }}>
            {slot.start_time} - {slot.end_time} (محجوز)
          </div>
        ))}
      </div>

      {/* إذا لم يكن هناك أوقات متاحة */}
      {slots.summary.available_count === 0 && (
        <div>
          <p>لا توجد أوقات متاحة في هذا التاريخ</p>
          <button onClick={handleCustomTimeRequest}>
            طلب وقت مخصص
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentSlots;
```

---

### 3. Component: حجز موعد

```jsx
// src/components/BookAppointment.jsx
import { useState } from 'react';
import { appointmentsApi } from '../services/appointmentsApi';

const BookAppointment = ({ lawyerId, selectedSlot, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: 'online',
    meeting_link: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        lawyer_id: lawyerId,
        availability_id: selectedSlot.id,
        ...formData,
      };

      const response = await appointmentsApi.bookDirectAppointment(data);
      alert('تم حجز الموعد بنجاح!');
      onSuccess(response.appointment);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors || 
        'حدث خطأ'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>حجز موعد - {selectedSlot.start_time}</h3>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>الموضوع:</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div>
        <label>الوصف (10 أحرف على الأقل):</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
        />
      </div>

      <div>
        <label>نوع الموعد:</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="online">افتراضي (Online)</option>
          <option value="in_office">في المكتب</option>
          <option value="phone">مكالمة هاتفية</option>
        </select>
      </div>

      {formData.type === 'online' && (
        <div>
          <label>رابط الاجتماع:</label>
          <input
            type="url"
            value={formData.meeting_link}
            onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            required
          />
        </div>
      )}

      <div>
        <label>ملاحظات (اختياري):</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'جاري الحجز...' : 'حجز الموعد'}
      </button>
    </form>
  );
};

export default BookAppointment;
```

---

### 4. Component: طلب وقت مخصص

```jsx
// src/components/CustomTimeRequest.jsx
import { useState } from 'react';
import { appointmentsApi } from '../services/appointmentsApi';

const CustomTimeRequest = ({ lawyerId, selectedDate, onSuccess }) => {
  const [formData, setFormData] = useState({
    preferred_time: '',
    preferred_date: selectedDate,
    subject: '',
    description: '',
    type: 'online',
    meeting_link: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        lawyer_id: lawyerId,
        datetime: `${formData.preferred_date}T${formData.preferred_time}:00`,
        preferred_time: formData.preferred_time,
        preferred_date: formData.preferred_date,
        subject: formData.subject,
        description: formData.description,
        type: formData.type,
        meeting_link: formData.meeting_link,
        notes: formData.notes,
      };

      const response = await appointmentsApi.requestCustomTime(data);
      alert('تم إرسال طلب الموعد بنجاح! سيتم تأكيده من قبل المحامي.');
      onSuccess(response.appointment);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors || 
        'حدث خطأ'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>طلب وقت مخصص</h3>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>التاريخ:</label>
        <input
          type="date"
          value={formData.preferred_date}
          onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
          required
        />
      </div>

      <div>
        <label>الوقت المفضل (HH:mm):</label>
        <input
          type="time"
          value={formData.preferred_time}
          onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
          required
        />
      </div>

      {/* باقي الحقول مثل BookAppointment */}
      <div>
        <label>الموضوع:</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div>
        <label>الوصف:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
      </button>
    </form>
  );
};

export default CustomTimeRequest;
```

---

### 5. Component: عرض المواعيد

```jsx
// src/components/MyAppointments.jsx
import { useState, useEffect } from 'react';
import { appointmentsApi } from '../services/appointmentsApi';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    lawyer_id: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentsApi.getMyAppointments(filters);
      setAppointments(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;

    try {
      await appointmentsApi.cancelAppointment(id, 'تم الإلغاء من قبل العميل');
      fetchAppointments(); // تحديث القائمة
      alert('تم إلغاء الموعد بنجاح');
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h2>مواعيدي</h2>

      {/* الفلاتر */}
      <div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="done">منتهي</option>
          <option value="cancelled">ملغي</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          placeholder="التاريخ"
        />
      </div>

      {/* قائمة المواعيد */}
      <div>
        {appointments.map((appointment) => (
          <div key={appointment.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
            <h3>{appointment.subject}</h3>
            <p>المحامي: {appointment.lawyer?.name}</p>
            <p>التاريخ والوقت: {new Date(appointment.datetime).toLocaleString('ar')}</p>
            <p>الحالة: {appointment.status}</p>
            {appointment.is_custom_time_request && (
              <p style={{ color: 'orange' }}>⏰ طلب وقت مخصص</p>
            )}

            {appointment.status === 'pending' && (
              <button onClick={() => handleCancel(appointment.id)}>
                إلغاء الموعد
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
```

---

## ⚠️ Error Handling

### أخطاء شائعة ومعالجتها:

```javascript
// src/utils/errorHandler.js
export const handleAppointmentError = (error) => {
  if (!error.response) {
    return 'خطأ في الاتصال بالخادم';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data.message || 'طلب غير صحيح';
    
    case 401:
      return 'يجب تسجيل الدخول';
    
    case 403:
      return 'ليس لديك صلاحية';
    
    case 404:
      return 'الموعد غير موجود';
    
    case 422:
      // Validation errors
      if (data.errors) {
        return Object.values(data.errors).flat().join(', ');
      }
      return data.message || 'بيانات غير صحيحة';
    
    case 500:
      return 'خطأ في الخادم';
    
    default:
      return data.message || 'حدث خطأ غير متوقع';
  }
};

// استخدام في Component
try {
  await appointmentsApi.bookDirectAppointment(data);
} catch (error) {
  const errorMessage = handleAppointmentError(error);
  setError(errorMessage);
}
```

---

## 📊 حالات الاستخدام

### 1. صفحة حجز موعد كاملة

```jsx
// src/pages/BookAppointmentPage.jsx
import { useState } from 'react';
import AppointmentSlots from '../components/AppointmentSlots';
import BookAppointment from '../components/BookAppointment';
import CustomTimeRequest from '../components/CustomTimeRequest';

const BookAppointmentPage = () => {
  const [lawyerId, setLawyerId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);

  return (
    <div>
      <h1>حجز موعد</h1>

      {/* اختيار المحامي */}
      <select onChange={(e) => setLawyerId(e.target.value)}>
        <option value="">اختر محامي</option>
        {/* قائمة المحامين */}
      </select>

      {/* اختيار التاريخ */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />

      {/* عرض الأوقات */}
      {lawyerId && selectedDate && !showCustomTime && (
        <AppointmentSlots
          lawyerId={lawyerId}
          selectedDate={selectedDate}
          onSlotSelect={setSelectedSlot}
          onCustomTimeRequest={() => setShowCustomTime(true)}
        />
      )}

      {/* نموذج الحجز */}
      {selectedSlot && (
        <BookAppointment
          lawyerId={lawyerId}
          selectedSlot={selectedSlot}
          onSuccess={() => {
            alert('تم الحجز بنجاح!');
            // إعادة التوجيه أو تحديث الصفحة
          }}
        />
      )}

      {/* طلب وقت مخصص */}
      {showCustomTime && (
        <CustomTimeRequest
          lawyerId={lawyerId}
          selectedDate={selectedDate}
          onSuccess={() => {
            alert('تم إرسال الطلب!');
            setShowCustomTime(false);
          }}
        />
      )}
    </div>
  );
};

export default BookAppointmentPage;
```

---

## 📝 ملاحظات مهمة

1. **Authentication**: جميع الـ endpoints تتطلب token في header
2. **Base URL**: استخدم `http://localhost:8000/api` (ليس `:5173`)
3. **Custom Time**: لا ترسل `availability_id` عند طلب وقت مخصص
4. **Validation**: تأكد من التحقق من البيانات قبل الإرسال
5. **Error Handling**: عالج جميع الأخطاء بشكل مناسب
6. **Loading States**: أظهر حالات التحميل للمستخدم
7. **Success Messages**: أظهر رسائل نجاح واضحة

---

## ✅ Checklist للتنفيذ

- [ ] إعداد API service مع axios
- [ ] إعداد authentication interceptor
- [ ] Component لعرض الأوقات المتاحة
- [ ] Component لحجز موعد عادي
- [ ] Component لطلب وقت مخصص
- [ ] Component لعرض المواعيد
- [ ] Component لإلغاء المواعيد
- [ ] Component لإعادة الجدولة
- [ ] Error handling شامل
- [ ] Loading states
- [ ] Success/Error messages
- [ ] Validation على الـ frontend
- [ ] Responsive design

---

## 🔗 روابط مفيدة

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Axios Documentation](https://axios-http.com/)
- [React Hooks](https://react.dev/reference/react)

---

**آخر تحديث:** 2025-12-09

