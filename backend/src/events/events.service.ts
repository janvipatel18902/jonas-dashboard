import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WebinarWithParticipants, ParticipantDetail } from './types';

interface UserProfile {
  created_by: string;
  full_name: string | null;
  email: string;
}

interface WebinarParticipant {
  webinar_id: number;
  registered_participants: string[] | null;
  attended_participants: string[] | null;
  paid_participants: string[] | null;
}

@Injectable()
export class EventsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getAllWebinarsWithParticipants(): Promise<WebinarWithParticipants[]> {
    const client = this.supabase.getClient();

    /* ================= FETCH WEBINARS ================= */

    const { data: webinars, error: webinarsError } = await client
      .from('webinars')
      .select('*')
      .order('start_date', { ascending: false });

    if (webinarsError) {
      throw new Error(`Failed to fetch webinars: ${webinarsError.message}`);
    }

    if (!webinars || webinars.length === 0) {
      return [];
    }

    /* ================= FETCH PARTICIPANTS ================= */

    const { data: participants, error: participantsError } = await client
      .from('webinar_participants')
      .select('*');

    if (participantsError) {
      throw new Error(
        `Failed to fetch participants: ${participantsError.message}`,
      );
    }

    /* ================= COLLECT UNIQUE USER IDS ================= */

    const allUserIds = new Set<string>();

    (participants || []).forEach((p: WebinarParticipant) => {
      p.registered_participants?.forEach((id) => allUserIds.add(id));
      p.attended_participants?.forEach((id) => allUserIds.add(id));
      p.paid_participants?.forEach((id) => allUserIds.add(id));
    });

    const userIdsArray = Array.from(allUserIds);

    const userProfilesMap = new Map<string, UserProfile>();

    /* ================= FETCH USER PROFILES ================= */

    if (userIdsArray.length > 0) {
      const { data: profiles, error: profilesError } = await client
        .from('user_profiles')
        .select('created_by, full_name, email')
        .in('created_by', userIdsArray);

      if (profilesError) {
        throw new Error(
          `Failed to fetch user profiles: ${profilesError.message}`,
        );
      }

      (profiles || []).forEach((profile: UserProfile) => {
        userProfilesMap.set(profile.created_by, profile);
      });
    }

    /* ================= MAP UUIDS TO PARTICIPANTS ================= */

    const mapUuidsToParticipants = (
      uuids: string[] | null,
    ): ParticipantDetail[] => {
      if (!uuids || uuids.length === 0) return [];

      return uuids
        .map((uuid) => {
          const profile = userProfilesMap.get(uuid);
          if (!profile) return null;

          return {
            full_name: profile.full_name,
            email: profile.email,
          };
        })
        .filter((p): p is ParticipantDetail => p !== null);
    };

    /* ================= FINAL COMPOSITION ================= */

    const webinarsWithParticipants: WebinarWithParticipants[] = webinars.map(
      (webinar) => {
        const webinarParticipants = (participants || []).find(
          (p: WebinarParticipant) => p.webinar_id === webinar.id,
        );

        return {
          ...webinar,
          registered_participants: mapUuidsToParticipants(
            webinarParticipants?.registered_participants || null,
          ),
          attended_participants: mapUuidsToParticipants(
            webinarParticipants?.attended_participants || null,
          ),
          paid_participants: mapUuidsToParticipants(
            webinarParticipants?.paid_participants || null,
          ),
        };
      },
    );

    return webinarsWithParticipants;
  }
}
