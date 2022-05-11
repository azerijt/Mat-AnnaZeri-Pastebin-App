-- Create table for pastbin posts and titles
CREATE TABLE categories (
  table_id SERIAL PRIMARY KEY,
  title varchar(50),
  paste_text text NOT NULL);


