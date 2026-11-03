CREATE TABLE "notification_result" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"message_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_result" ADD CONSTRAINT "notification_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "notification_result_userId_idx" ON "notification_result" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "notification_result_user_kind_message_uidx" ON "notification_result" USING btree ("user_id","kind","message_id");
