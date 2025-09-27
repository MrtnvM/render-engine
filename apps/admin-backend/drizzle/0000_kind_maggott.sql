CREATE TABLE "scenario_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"mainComponent" jsonb NOT NULL,
	"components" jsonb NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"build_number" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
