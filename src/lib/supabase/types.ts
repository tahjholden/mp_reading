// Supabase TypeScript types
// Generated from Supabase schema using: npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			parents: {
				Row: {
					id: string;
					email: string;
					created_at: string;
					updated_at: string;
					notification_preferences: Json;
					metadata: Json;
				};
				Insert: {
					id: string;
					email: string;
					created_at?: string;
					updated_at?: string;
					notification_preferences?: Json;
					metadata?: Json;
				};
				Update: {
					id?: string;
					email?: string;
					created_at?: string;
					updated_at?: string;
					notification_preferences?: Json;
					metadata?: Json;
				};
			};
			children: {
				Row: {
					id: string;
					primary_parent_id: string;
					username: string;
					password_hash: string;
					name: string;
					age: number;
					grade_level: number;
					email: string | null;
					reading_preferences: Json;
					avatar_data: Json;
					reading_level: number | null;
					onboarding_completed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					primary_parent_id: string;
					username: string;
					password_hash: string;
					name: string;
					age: number;
					grade_level: number;
					email?: string | null;
					reading_preferences?: Json;
					avatar_data?: Json;
					reading_level?: number | null;
					onboarding_completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					primary_parent_id?: string;
					username?: string;
					password_hash?: string;
					name?: string;
					age?: number;
					grade_level?: number;
					email?: string | null;
					reading_preferences?: Json;
					avatar_data?: Json;
					reading_level?: number | null;
					onboarding_completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			parent_invitations: {
				Row: {
					id: string;
					child_id: string;
					invited_email: string;
					invited_by_parent_id: string;
					token: string;
					status: 'pending' | 'accepted' | 'rejected' | 'expired';
					expires_at: string;
					accepted_at: string | null;
					accepted_by_parent_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					child_id: string;
					invited_email: string;
					invited_by_parent_id: string;
					token: string;
					status?: 'pending' | 'accepted' | 'rejected' | 'expired';
					expires_at: string;
					accepted_at?: string | null;
					accepted_by_parent_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					child_id?: string;
					invited_email?: string;
					invited_by_parent_id?: string;
					token?: string;
					status?: 'pending' | 'accepted' | 'rejected' | 'expired';
					expires_at?: string;
					accepted_at?: string | null;
					accepted_by_parent_id?: string | null;
					created_at?: string;
				};
			};
			onboarding_data: {
				Row: {
					id: string;
					child_id: string;
					reading_interest_survey: Json;
					avatar_choices: Json;
					initial_goals: Json | null;
					completed_at: string;
				};
				Insert: {
					id?: string;
					child_id: string;
					reading_interest_survey: Json;
					avatar_choices: Json;
					initial_goals?: Json | null;
					completed_at?: string;
				};
				Update: {
					id?: string;
					child_id?: string;
					reading_interest_survey?: Json;
					avatar_choices?: Json;
					initial_goals?: Json | null;
					completed_at?: string;
				};
			};
			data_access_logs: {
				Row: {
					id: string;
					user_id: string | null;
					child_id: string;
					action: 'read' | 'create' | 'update' | 'delete';
					table_name: string;
					record_id: string | null;
					ip_address: string | null;
					user_agent: string | null;
					timestamp: string;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					child_id: string;
					action: 'read' | 'create' | 'update' | 'delete';
					table_name: string;
					record_id?: string | null;
					ip_address?: string | null;
					user_agent?: string | null;
					timestamp?: string;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					child_id?: string;
					action?: 'read' | 'create' | 'update' | 'delete';
					table_name?: string;
					record_id?: string | null;
					ip_address?: string | null;
					user_agent?: string | null;
					timestamp?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
}

