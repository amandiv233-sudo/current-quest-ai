-- Add unique constraint for title column to support upsert operations
ALTER TABLE current_affairs ADD CONSTRAINT current_affairs_title_key UNIQUE (title);

-- Create unique constraint for source_url as backup
ALTER TABLE current_affairs ADD CONSTRAINT current_affairs_source_url_key UNIQUE (source_url);