CREATE TABLE "users" (
  "id" bigint PRIMARY KEY,
  "first_name" text NOT NULL,
  "last_name" text,
  "username" text,
  "photo_img" text,
  "is_admin" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE "orgs" (
  "id" serial PRIMARY KEY,
  "creator_id" bigint,
  "title" text NOT NULL,
  "description" text,
  "avatar_img" text,
  "is_fancy" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE "org_members" (
  "id" serial PRIMARY KEY,
  "org_id" int,
  "user_id" bigint,
  "role" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE "events" (
  "id" serial PRIMARY KEY,
  "org_id" int,
  "creator_user_id" bigint,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "cover_img" jsonb NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "location" text NOT NULL,
  "form" jsonb NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE "event_visitors" (
  "id" bigserial PRIMARY KEY,
  "event_id" int,
  "user_id" bigint,
  "form" jsonb NOT NULL,
  "check_in_date" timestamp,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

ALTER TABLE "orgs" ADD FOREIGN KEY ("creator_id") REFERENCES "users" ("id");

ALTER TABLE "org_members" ADD FOREIGN KEY ("org_id") REFERENCES "orgs" ("id");

ALTER TABLE "org_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "events" ADD FOREIGN KEY ("org_id") REFERENCES "orgs" ("id");

ALTER TABLE "events" ADD FOREIGN KEY ("creator_user_id") REFERENCES "users" ("id");

ALTER TABLE "event_visitors" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");

ALTER TABLE "event_visitors" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
