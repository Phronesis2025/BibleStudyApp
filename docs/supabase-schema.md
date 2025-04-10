# Supabase Database Schema

This document outlines the database structure implemented in Supabase for the Bible Study App.

## Tables

### `users`

Stores information about application users.

| Column       | Type                       | Description               | Constraints                                |
| ------------ | -------------------------- | ------------------------- | ------------------------------------------ |
| `id`         | `uuid`                     | Unique identifier         | Primary Key, Default: `uuid_generate_v4()` |
| `name`       | `text`                     | User's name               | Not Null                                   |
| `created_at` | `timestamp with time zone` | When the user was created | Default: `now()`                           |

### `reading_log`

Tracks Bible verses read by users.

| Column       | Type                       | Description                               | Constraints                                |
| ------------ | -------------------------- | ----------------------------------------- | ------------------------------------------ |
| `id`         | `uuid`                     | Unique identifier                         | Primary Key, Default: `uuid_generate_v4()` |
| `user_id`    | `uuid`                     | Reference to users table                  | Foreign Key (users.id)                     |
| `verse`      | `text`                     | Bible verse reference (e.g., "John 3:16") | Not Null                                   |
| `created_at` | `timestamp with time zone` | When the reading was logged               | Default: `now()`                           |

### `reflections`

Stores user reflections on Bible verses.

| Column       | Type                       | Description                                    | Constraints                                |
| ------------ | -------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `id`         | `uuid`                     | Unique identifier                              | Primary Key, Default: `uuid_generate_v4()` |
| `user_id`    | `uuid`                     | Reference to users table                       | Foreign Key (users.id)                     |
| `verse`      | `text`                     | Bible verse reference                          | Not Null                                   |
| `verse_text` | `text`                     | Full text of the verse                         |                                            |
| `question`   | `text`                     | Reflection question                            | Not Null                                   |
| `answer`     | `text`                     | User's answer to the question                  | Not Null                                   |
| `insight`    | `text`                     | Additional user insights                       |                                            |
| `themes`     | `text[]`                   | Array of themes associated with the reflection |                                            |
| `is_shared`  | `boolean`                  | Whether the reflection is publicly shared      | Default: `false`                           |
| `likes`      | `integer`                  | Number of likes received                       | Default: `0`                               |
| `created_at` | `timestamp with time zone` | When the reflection was created                | Default: `now()`                           |

### `themes`

Tracks most common Bible themes by user.

| Column    | Type      | Description                        | Constraints                                |
| --------- | --------- | ---------------------------------- | ------------------------------------------ |
| `id`      | `uuid`    | Unique identifier                  | Primary Key, Default: `uuid_generate_v4()` |
| `user_id` | `uuid`    | Reference to users table           | Foreign Key (users.id)                     |
| `name`    | `text`    | Theme name (e.g., "faith", "love") | Not Null                                   |
| `count`   | `integer` | Number of times this theme appears | Default: `1`                               |

### `shared_insights`

Stores insights shared by users.

| Column       | Type                       | Description                 | Constraints                                |
| ------------ | -------------------------- | --------------------------- | ------------------------------------------ |
| `id`         | `uuid`                     | Unique identifier           | Primary Key, Default: `uuid_generate_v4()` |
| `user_id`    | `uuid`                     | Reference to users table    | Foreign Key (users.id)                     |
| `verse`      | `text`                     | Bible verse reference       | Not Null                                   |
| `content`    | `text`                     | Insight content             | Not Null                                   |
| `created_at` | `timestamp with time zone` | When the insight was shared | Default: `now()`                           |

## Indexes

Recommended indexes for optimal performance:

- `users`: Index on `created_at` for sorting
- `reading_log`: Index on `user_id` and compound index on `user_id, created_at`
- `reflections`: Indexes on `user_id`, `themes`, and compound index on `user_id, created_at`
- `themes`: Compound index on `user_id, count` for fast retrieval of top themes

## Row-Level Security (RLS)

The following RLS policies should be implemented:

- `users`: Allow read access to all authenticated users, but only allow users to update their own records
- `reading_log`: Restrict read/write access to the user who owns the records
- `reflections`: Allow read access to shared reflections for all users, but restrict private reflections to the owner
- `themes`: Restrict read/write access to the user who owns the records

## Functions and Triggers

Implement the following database functions:

1. Update theme counts whenever a reflection is created or updated
2. Clean up related records when a user is deleted

## SQL Setup

```sql
-- Example SQL for creating the tables

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reading log table
CREATE TABLE reading_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reflections table
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse TEXT NOT NULL,
  verse_text TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  insight TEXT,
  themes TEXT[],
  is_shared BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  UNIQUE(user_id, name)
);

-- Shared insights table
CREATE TABLE shared_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
