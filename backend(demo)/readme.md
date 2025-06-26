# Backend Database Architecture - CV Screening SaaS

## 📁 Folder Structure

```
/backend
├── /migrations
│   ├── 001_organizations.sql       # Organizations table (tenants)
│   ├── 002_users.sql              # Users with roles
│   ├── 003_jobs.sql               # Job postings
│   ├── 004_candidates.sql         # CV applicants
│   ├── 005_cv_analyses.sql        # AI analysis results
│   ├── 006_audit_logs.sql         # Activity tracking
│   └── 007_enable_rls.sql         # Enable Row Level Security
│
├── /policies
│   └── rls_policies.sql           # Multi-tenant security policies
│
├── /seed
│   └── sample_data.sql            # Test data for development
│
└── README.md                      # Database documentation
```

## 🏗️ Architecture Overview

### **Multi-Tenant SaaS Design**

- **Primary Tenant**: `organizations` table
- **Data Isolation**: Row Level Security (RLS) on all tables
- **User Context**: JWT claims with `organization_id` and `role`

### **Core Tables**

1. **organizations** - Tenant entities
2. **users** - Role-based access (admin, recruiter, viewer)
3. **jobs** - Job postings per organization
4. **candidates** - CV applicants with file metadata
5. **cv_analyses** - AI processing results
6. **audit_logs** - Security and compliance tracking

### **Security Features**

- ✅ **Row Level Security** for tenant isolation
- ✅ **Role-based permissions** (admin/recruiter/viewer)
- ✅ **Audit logging** for compliance
- ✅ **JWT-based authentication** context
- ✅ **Cascade deletions** for data integrity

### **Key Features for SaaS**

- **Tenant isolation** via `organization_id`
- **Scalable architecture** for multiple clients
- **Audit trail** for enterprise customers
- **Role hierarchy** for team management
- **JSON fields** for flexible AI data storage

## 🚀 Usage

1. Run migrations in order (001 → 007)
2. Apply RLS policies for security
3. Load seed data for testing
4. Configure JWT authentication with organization context
