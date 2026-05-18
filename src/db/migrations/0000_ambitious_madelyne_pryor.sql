CREATE TYPE "public"."report_category" AS ENUM('waste', 'infrastructure', 'noise', 'safety', 'health', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'investigating', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "incident_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"purok_id" uuid,
	"category" "report_category" DEFAULT 'other' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_purok_id_puroks_id_fk" FOREIGN KEY ("purok_id") REFERENCES "public"."puroks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incident_reports_user_idx" ON "incident_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "incident_reports_purok_idx" ON "incident_reports" USING btree ("purok_id");--> statement-breakpoint
CREATE INDEX "incident_reports_status_idx" ON "incident_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "incident_reports_created_idx" ON "incident_reports" USING btree ("created_at");