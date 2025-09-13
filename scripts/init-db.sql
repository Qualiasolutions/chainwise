-- Initialize ChainWise Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional users if needed (optional)
-- CREATE USER chainwise_readonly WITH PASSWORD 'readonly_password';

-- Set up proper permissions
GRANT ALL PRIVILEGES ON DATABASE chainwise_db TO chainwise_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log initialization
DO $$ BEGIN
    RAISE NOTICE 'ChainWise database initialized successfully';
END $$;