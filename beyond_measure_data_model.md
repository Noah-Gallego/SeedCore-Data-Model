# Beyond Measure Data Model (Simplified)

## Overview
This document outlines the simplified data model for the Beyond Measure platform, focusing only on essential tables.

## Database Tables

### 1. Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_image_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'donor', 'admin')),
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);
```

### 2. Teacher Profiles

```sql
CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    school_district TEXT,
    school_address TEXT NOT NULL,
    school_city TEXT NOT NULL,
    school_state TEXT NOT NULL,
    school_postal_code TEXT NOT NULL,
    position_title TEXT NOT NULL,
    employment_verified BOOLEAN DEFAULT FALSE,
    nonprofit_status_verified BOOLEAN DEFAULT FALSE,
    guidestar_charity_id TEXT,
    account_status TEXT NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'denied', 'inactive')),
    instagram_username TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Donor Profiles

```sql
CREATE TABLE donor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    donation_total DECIMAL(12,2) DEFAULT 0.00,
    projects_supported INTEGER DEFAULT 0,
    is_anonymous_by_default BOOLEAN DEFAULT FALSE,
    receives_updates_email BOOLEAN DEFAULT TRUE,
    stripe_customer_id TEXT,
    instagram_username TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Categories/Interests

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. User Interests

```sql
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);
```

### 6. Projects

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    student_impact TEXT NOT NULL,
    funding_goal DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    main_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'funded', 'completed', 'expired', 'denied')),
    featured BOOLEAN DEFAULT FALSE,
    donor_count INTEGER DEFAULT 0,
    is_extended BOOLEAN DEFAULT FALSE,
    disbursement_status TEXT DEFAULT NULL CHECK (disbursement_status IN (NULL, 'pending', 'processed', 'failed')),
    disbursement_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
```

### 7. Project Categories

```sql
CREATE TABLE project_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, category_id)
);
```

### 8. Project Updates

```sql
CREATE TABLE project_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 9. Donations

```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    stripe_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    shared_on_instagram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 10. Favorite Projects

```sql
CREATE TABLE favorite_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);
```

### 11. Favorite Teachers

```sql
CREATE TABLE favorite_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES donor_profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(donor_id, teacher_id)
);
```

### 12. Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_id UUID,
    related_entity_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 13. Project Reviews

```sql
CREATE TABLE project_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('approved', 'denied', 'needs_revision')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## ER Diagram

Below is the simplified entity-relationship diagram:

```mermaid
erDiagram
    users ||--o| teacher_profiles : has_teacher_profile
    users ||--o| donor_profiles : has_donor_profile
    users ||--o{ user_interests : has_interests
    users ||--o{ notifications : receives
    users ||--o{ favorite_projects : has_favorites
    users ||--o{ project_reviews : reviews
    
    teacher_profiles ||--o{ projects : creates
    
    donor_profiles ||--o{ donations : makes
    donor_profiles ||--o{ favorite_teachers : follows
    
    projects ||--o{ project_categories : categorized_in
    projects ||--o{ project_updates : has_updates
    projects ||--o{ donations : receives_donations
    projects ||--o{ project_reviews : undergoes_review
    
    categories ||--o{ project_categories : used_in
    categories ||--o{ user_interests : interested_in
    
    users {
        UUID id PK
        UUID auth_id FK
        TEXT email
        TEXT first_name
        TEXT last_name
        TEXT role
        TEXT phone_number
        TEXT address
    }
    
    teacher_profiles {
        UUID id PK
        UUID user_id FK
        TEXT school_name
        TEXT position_title
        BOOLEAN employment_verified
        BOOLEAN nonprofit_status_verified
        TEXT account_status
    }
    
    donor_profiles {
        UUID id PK
        UUID user_id FK
        DECIMAL donation_total
        INTEGER projects_supported
        TEXT stripe_customer_id
    }
    
    categories {
        UUID id PK
        TEXT name
        TEXT description
        TEXT icon_url
    }
    
    user_interests {
        UUID id PK
        UUID user_id FK
        UUID category_id FK
    }
    
    projects {
        UUID id PK
        UUID teacher_id FK
        TEXT title
        TEXT description
        TEXT student_impact
        DECIMAL funding_goal
        DECIMAL current_amount
        TEXT status
        TIMESTAMP end_date
        TEXT disbursement_status
    }
    
    project_categories {
        UUID id PK
        UUID project_id FK
        UUID category_id FK
    }
    
    project_updates {
        UUID id PK
        UUID project_id FK
        TEXT title
        TEXT content
    }
    
    donations {
        UUID id PK
        UUID donor_id FK
        UUID project_id FK
        DECIMAL amount
        BOOLEAN is_anonymous
        TEXT stripe_payment_id
        TEXT status
    }
    
    favorite_projects {
        UUID id PK
        UUID user_id FK
        UUID project_id FK
    }
    
    favorite_teachers {
        UUID id PK
        UUID donor_id FK
        UUID teacher_id FK
    }
    
    notifications {
        UUID id PK
        UUID user_id FK
        TEXT title
        TEXT message
        TEXT type
        BOOLEAN is_read
    }
    
    project_reviews {
        UUID id PK
        UUID project_id FK
        UUID reviewer_id FK
        TEXT status
        TEXT notes
    }
``` 