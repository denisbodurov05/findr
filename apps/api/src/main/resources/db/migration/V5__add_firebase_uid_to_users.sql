CREATE SEQUENCE IF NOT EXISTS user_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS user_ (
  id BIGINT PRIMARY KEY,
  firebase_uid VARCHAR(128),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  CONSTRAINT user_email_unique UNIQUE (email)
);

ALTER TABLE user_ ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_firebase_uid
  ON user_(firebase_uid)
  WHERE firebase_uid IS NOT NULL;
