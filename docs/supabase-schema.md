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
| `liked_by`   | `uuid[]`                   | Array of user IDs who liked the reflection     | Default: `{}`                              |
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
3. `toggle_like(p_reflection_id UUID, p_user_id UUID, p_like BOOLEAN) RETURNS JSON` - Function to manage liking and unliking reflections:
   - Adds or removes a user from a reflection's `liked_by` array
   - Updates the reflection's `likes` count
   - Returns JSON with updated likes count and liked_by array

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
  liked_by UUID[] DEFAULT '{}',
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

-- Toggle like function
CREATE OR REPLACE FUNCTION toggle_like(
  p_reflection_id UUID,
  p_user_id UUID,
  p_like BOOLEAN
) RETURNS JSON AS $$
DECLARE
  current_likes INTEGER;
  liked_by UUID[];
  result JSON;
BEGIN
  -- Fetch current likes and liked_by from the reflection with locking
  SELECT likes, liked_by INTO current_likes, liked_by
  FROM reflections
  WHERE id = p_reflection_id
  FOR UPDATE;

  -- Check if reflection exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reflection with ID % not found', p_reflection_id;
  END IF;

  -- Initialize liked_by if null
  IF liked_by IS NULL THEN
    liked_by := '{}';
  END IF;

  IF p_like = TRUE THEN
    -- Add user to liked_by if not already present
    IF NOT (p_user_id = ANY(liked_by)) THEN
      liked_by := array_append(liked_by, p_user_id);
      current_likes := current_likes + 1;
    END IF;
  ELSE
    -- Remove user from liked_by if present
    IF p_user_id = ANY(liked_by) THEN
      liked_by := array_remove(liked_by, p_user_id);
      current_likes := GREATEST(0, current_likes - 1);
    END IF;
  END IF;

  -- Update the reflection
  UPDATE reflections
  SET
    likes = current_likes,
    liked_by = liked_by
  WHERE id = p_reflection_id;

  -- Prepare the result
  SELECT json_build_object(
    'likes', current_likes,
    'liked_by', liked_by
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```
