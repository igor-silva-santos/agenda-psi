# Estrutura do Banco de Dados - Dra. Jandira Frederick

## 🗄️ Coleções do Firestore

### 1. **users** (Usuários)
```javascript
{
  id: "user_id_auto_generated",
  name: "João Silva",
  email: "joao@email.com",
  password: "hash_bcrypt", // apenas para login tradicional
  role: "patient" | "admin", // patient = paciente, admin = dra. jandira
  phone: "+5511999999999",
  createdAt: timestamp,
  emailVerified: timestamp | null,
  image: "url_foto_perfil", // do Google OAuth
  provider: "credentials" | "google"
}
```

### 2. **appointments** (Agendamentos)
```javascript
{
  id: "appointment_id_auto_generated",
  patientId: "user_id_do_paciente",
  patientName: "João Silva",
  patientEmail: "joao@email.com",
  patientPhone: "+5511999999999",
  date: "2024-06-15", // YYYY-MM-DD
  time: "14:00", // HH:MM
  datetime: timestamp, // data/hora completa
  reason: "Ansiedade e estresse no trabalho",
  status: "scheduled" | "confirmed" | "cancelled_by_patient" | "cancelled_by_doctor" | "completed" | "no_show",
  googleEventId: "google_calendar_event_id",
  createdAt: timestamp,
  updatedAt: timestamp,
  cancelledAt: timestamp | null,
  cancelReason: "string" | null,
  value: 150.00, // valor da consulta
  paid: boolean,
  paymentMethod: "cash" | "pix" | "card" | null
}
```

### 3. **session_notes** (Anotações das Sessões)
```javascript
{
  id: "note_id_auto_generated",
  appointmentId: "appointment_id",
  patientId: "user_id_do_paciente",
  doctorId: "user_id_da_doutora",
  title: "Sessão 1 - Avaliação inicial",
  content: "Paciente apresentou sintomas de ansiedade...",
  isVisibleToPatient: boolean, // se o paciente pode ver
  createdAt: timestamp,
  updatedAt: timestamp,
  tags: ["ansiedade", "tcc", "primeira_sessao"]
}
```

### 4. **patient_activities** (Atividades para Pacientes)
```javascript
{
  id: "activity_id_auto_generated",
  patientId: "user_id_do_paciente",
  doctorId: "user_id_da_doutora",
  title: "Exercício de respiração",
  description: "Pratique a técnica de respiração 4-7-8 duas vezes ao dia",
  instructions: "1. Inspire por 4 segundos\n2. Segure por 7 segundos\n3. Expire por 8 segundos",
  dueDate: timestamp | null, // prazo para completar
  status: "pending" | "in_progress" | "completed",
  completedAt: timestamp | null,
  patientNotes: "Como foi a experiência...", // feedback do paciente
  createdAt: timestamp,
  updatedAt: timestamp,
  priority: "low" | "medium" | "high"
}
```

### 5. **notifications** (Notificações)
```javascript
{
  id: "notification_id_auto_generated",
  userId: "user_id_destinatario",
  type: "appointment_reminder" | "appointment_cancelled" | "reschedule_offer" | "activity_assigned" | "note_added",
  title: "Lembrete de consulta",
  message: "Sua consulta é amanhã às 14:00",
  data: {
    appointmentId: "appointment_id",
    originalDate: "2024-06-15",
    newDate: "2024-06-14"
  },
  read: boolean,
  createdAt: timestamp,
  sentVia: ["whatsapp", "email", "push"], // canais de envio
  status: "pending" | "sent" | "failed"
}
```

### 6. **settings** (Configurações do Sistema)
```javascript
{
  id: "working-hours",
  hours: {
    monday: {
      enabled: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "18:00" }
      ]
    },
    tuesday: { enabled: true, slots: [...] },
    // ... outros dias
  }
},
{
  id: "consultation-price",
  value: 150.00,
  currency: "BRL",
  discountFirstConsultation: 20, // porcentagem
  updatedAt: timestamp,
  updatedBy: "user_id_da_doutora"
},
{
  id: "system-config",
  siteName: "Dra. Jandira Frederick",
  siteDescription: "Psicóloga especializada em TCC",
  contactPhone: "+5511999999999",
  contactEmail: "contato@drajandira.com.br",
  address: "Rua das Flores, 123 - São Paulo/SP",
  googleCalendarId: "calendario@group.calendar.google.com",
  whatsappNumber: "+5511999999999",
  autoReschedule: boolean, // ativar reagendamento automático
  reminderHours: 24 // horas antes para lembrete
}
```

### 7. **reschedule_queue** (Fila de Reagendamento)
```javascript
{
  id: "queue_id_auto_generated",
  cancelledAppointmentId: "appointment_id_cancelado",
  availableDate: "2024-06-15",
  availableTime: "14:00",
  nextPatientId: "user_id_proximo_paciente",
  nextPatientAppointmentId: "appointment_id_original",
  status: "pending" | "offered" | "accepted" | "declined" | "expired",
  offeredAt: timestamp,
  respondedAt: timestamp | null,
  expiresAt: timestamp, // 24h para responder
  whatsappMessageId: "message_id" | null,
  createdAt: timestamp
}
```

### 8. **audit_log** (Log de Auditoria)
```javascript
{
  id: "log_id_auto_generated",
  userId: "user_id_que_fez_acao",
  action: "appointment_created" | "appointment_cancelled" | "note_added" | "activity_assigned" | "login" | "logout",
  entityType: "appointment" | "note" | "activity" | "user",
  entityId: "id_da_entidade_afetada",
  oldData: {...}, // dados antes da mudança
  newData: {...}, // dados depois da mudança
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: timestamp
}
```

## 🔐 Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/editar apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Agendamentos
    match /appointments/{appointmentId} {
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Anotações de sessão
    match /session_notes/{noteId} {
      allow read: if request.auth != null && (
        (resource.data.patientId == request.auth.uid && resource.data.isVisibleToPatient == true) ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Atividades
    match /patient_activities/{activityId} {
      allow read: if request.auth != null && (
        resource.data.patientId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow create, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow update: if request.auth != null && 
        resource.data.patientId == request.auth.uid &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'completedAt', 'patientNotes']);
    }
    
    // Configurações - apenas admin
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Notificações
    match /notifications/{notificationId} {
      allow read, update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Fila de reagendamento - apenas admin
    match /reschedule_queue/{queueId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Log de auditoria - apenas leitura para admin
    match /audit_log/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
    }
  }
}
```

## 📊 Índices Necessários

```javascript
// Firestore Indexes
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "datetime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "patient_activities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "patientId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 🚀 Scripts de Inicialização

### Criar usuário admin inicial
```javascript
// Script para criar Dra. Jandira como admin
const adminUser = {
  name: "Dra. Jandira Frederick",
  email: "dra.jandira@email.com",
  role: "admin",
  createdAt: new Date(),
  emailVerified: new Date()
}

// Configurações iniciais
const initialSettings = [
  {
    id: "consultation-price",
    value: 150.00,
    currency: "BRL",
    discountFirstConsultation: 20
  },
  {
    id: "system-config",
    siteName: "Dra. Jandira Frederick",
    autoReschedule: true,
    reminderHours: 24
  }
]
```

Esta estrutura de banco de dados suporta todas as funcionalidades especificadas:
- ✅ Autenticação de usuários
- ✅ Portal do paciente
- ✅ Agendamentos com status
- ✅ Anotações de sessão
- ✅ Atividades para pacientes
- ✅ Sistema de reagendamento automático
- ✅ Notificações
- ✅ Configurações flexíveis
- ✅ Auditoria e logs
- ✅ Segurança por roles

