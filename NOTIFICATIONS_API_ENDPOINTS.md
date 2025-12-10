# Notifications API Endpoints

## Overview
The frontend is ready for notifications, but the backend endpoints need to be implemented. Below are the required endpoints for each role.

## Required Endpoints

### For All Roles (Client, Lawyer, Employee, Admin)

#### 1. Get Notifications
```
GET /api/{role}/notifications
```

**Query Parameters:**
- `limit`: Number of notifications to return (default: 10)
- `page`: Page number for pagination
- `unread_only`: true/false - Filter only unread notifications

**Response:**
```json
[
  {
    "id": 1,
    "type": "App\\Notifications\\NewConsultationNotification",
    "notifiable_type": "App\\Models\\Client",
    "notifiable_id": 1,
    "data": {
      "title": "New Consultation",
      "message": "You have a new consultation request",
      "consultation_id": 5
    },
    "read_at": null,
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T10:30:00.000000Z"
  }
]
```

#### 2. Get Unread Count
```
GET /api/{role}/notifications/unread-count
```

**Response:**
```json
{
  "count": 5,
  "unread_count": 5
}
```

#### 3. Mark Notification as Read
```
POST /api/{role}/notifications/{id}/read
```

**Response:**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": 1,
    "read_at": "2025-01-15T10:35:00.000000Z"
  }
}
```

#### 4. Mark All Notifications as Read
```
POST /api/{role}/notifications/read-all
```

**Response:**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

#### 5. Delete Notification
```
DELETE /api/{role}/notifications/{id}
```

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

## Notification Types

The system should send notifications for:

1. **NewConsultationNotification**: When a client creates a consultation
   - Sent to: Employee, Lawyer (if assigned)

2. **ConsultationAcceptedNotification**: When a lawyer accepts a consultation
   - Sent to: Client, Employee

3. **ConsultationRejectedNotification**: When a lawyer rejects a consultation
   - Sent to: Client, Employee

4. **NewMessageNotification**: When a new message is sent in a consultation
   - Sent to: Client (if lawyer sends), Lawyer (if client sends)

5. **NewAppointmentNotification**: When a client books an appointment
   - Sent to: Employee, Lawyer

6. **AppointmentConfirmedNotification**: When an employee confirms an appointment
   - Sent to: Client, Lawyer

7. **AppointmentCancelledNotification**: When an appointment is cancelled
   - Sent to: Client, Lawyer, Employee

8. **AppointmentReminderNotification**: Reminder before appointment
   - Sent to: Client, Lawyer

## Implementation Notes

1. **Laravel Notifications**: Use Laravel's notification system
2. **Database**: Store notifications in `notifications` table (Laravel default)
3. **Broadcasting**: Optional - Can add real-time notifications with Laravel Broadcasting
4. **Pagination**: Implement pagination for large notification lists
5. **Filtering**: Support filtering by type, read/unread status

## Frontend Integration

The frontend is already configured to call these endpoints:
- `GET /api/{role}/notifications` - Fetches notifications
- `GET /api/{role}/notifications/unread-count` - Gets unread count
- `POST /api/{role}/notifications/{id}/read` - Marks as read
- `POST /api/{role}/notifications/read-all` - Marks all as read
- `DELETE /api/{role}/notifications/{id}` - Deletes notification

The frontend will automatically handle:
- Auto-refresh every 30 seconds
- Display unread count badge
- Show notification list in dropdown
- Mark notifications as read when clicked

## Testing

Once endpoints are implemented, test:
1. Create a consultation → Check if Employee receives notification
2. Accept consultation → Check if Client receives notification
3. Send message → Check if recipient receives notification
4. Book appointment → Check if Employee and Lawyer receive notifications

