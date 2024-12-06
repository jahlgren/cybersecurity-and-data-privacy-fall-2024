-- enable the uuid-ossp extension 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- enable crypto functions
CREATE EXTENSION pgcrypto;

-- Users table: Minimized personal information, pseudonymization via user_token
CREATE TABLE cbkapp_users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(15) CHECK (role IN ('reserver', 'administrator')) NOT NULL,
    birthdate DATE NOT NULL,
    user_token UUID UNIQUE DEFAULT uuid_generate_v4()  -- Pseudonymized identifier
);

-- Resources table: Stores information about the resources that can be reserved
CREATE TABLE cbkapp_resources (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_description TEXT
);

-- Reservations table: Pseudonymized reservation entries, no direct user identity stored
CREATE TABLE cbkapp_reservations (
    reservation_id SERIAL PRIMARY KEY,
    reserver_token UUID REFERENCES cbkapp_users(user_token) ON DELETE CASCADE, -- Pseudonym reference
    resource_id INT REFERENCES cbkapp_resources(resource_id) ON DELETE CASCADE,
    reservation_start TIMESTAMP NOT NULL,
    reservation_end TIMESTAMP NOT NULL,
    CHECK (reservation_end > reservation_start)
);

-- Logs table: Tracks administrator actions, e.g., add/delete resources, without exposing sensitive data
CREATE TABLE cbkapp_admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES cbkapp_users(user_id),
    action VARCHAR(255) NOT NULL,
    resource_id INT,
    reservation_id INT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Login logs table
CREATE TABLE cbkapp_login_logs (
    log_id SERIAL PRIMARY KEY,
    user_token UUID NOT NULL REFERENCES cbkapp_users(user_token) ON DELETE CASCADE,
    login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL
);

-- Function to check if the user is over 15 years old before making a reservation
CREATE OR REPLACE FUNCTION cbkapp_check_age() RETURNS TRIGGER AS $$
BEGIN
    IF (EXTRACT(YEAR FROM AGE(NEW.reservation_start, (SELECT birthdate FROM cbkapp_users WHERE user_token = NEW.reserver_token))) < 15) THEN
        RAISE EXCEPTION 'User must be over 15 years old to make a reservation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce age check before inserting a reservation
CREATE TRIGGER cbkapp_check_age_trigger
BEFORE INSERT ON cbkapp_reservations
FOR EACH ROW
EXECUTE FUNCTION cbkapp_check_age();

-- View for anonymous access: Shows booked resources without reserver’s identity (pseudonymized view)
CREATE VIEW cbkapp_booked_resources_view AS
SELECT
    r.resource_name,
    res.reservation_start,
    res.reservation_end
FROM cbkapp_resources r
JOIN cbkapp_reservations res ON r.resource_id = res.resource_id;

-- Deletion function for the right to erasure (compliant with GDPR)
CREATE OR REPLACE FUNCTION cbkapp_erase_user(user_id_to_erase INT) RETURNS VOID AS $$
DECLARE
    user_token_to_erase UUID;
BEGIN
    -- Find the pseudonym (token) of the user to erase
    SELECT user_token INTO user_token_to_erase FROM cbkapp_users WHERE user_id = user_id_to_erase;

    -- Delete user and associated data
    DELETE FROM cbkapp_reservations WHERE reserver_token = user_token_to_erase;
    DELETE FROM cbkapp_users WHERE user_id = user_id_to_erase;
    
    -- Optionally, delete admin logs associated with the user
    DELETE FROM cbkapp_admin_logs WHERE admin_id = user_id_to_erase;
END;
$$ LANGUAGE plpgsql;