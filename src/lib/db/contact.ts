import { supabase } from '@/lib/db/supabase';

export interface ContactDetails {
  id?: string;
  name: string;
  title: string;
  vitEmail: string;
  officialEmail: string;
  linkedinUrl: string;
  githubUrl: string;
  location: string;
  bio: string;
  availableFor: string;
  pgpKey?: string;
  pgpKeyFingerprint?: string;
  twitterUrl?: string;
  discordUsername?: string;
  updatedAt?: string;
}

export const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  id: 'default',
  name: 'Anurag Soni',
  title: 'Cybersecurity Engineer & Full-Stack Developer',
  vitEmail: 'anurag.soni2025@vitstudent.ac.in',
  officialEmail: 'anuragsoni5473@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/anur1gsoni/',
  githubUrl: 'https://github.com/anur1g5473',
  location: 'Vellore / India',
  bio: 'Undergraduate Security Researcher & Full-Stack Web Developer at VIT. Focusing on offensive security, secure authentication architectures, and modern web infrastructure.',
  availableFor: 'Security Audits, Vulnerability Research, Full-Stack Development & Collaborative Projects',
  pgpKey: '',
  pgpKeyFingerprint: '4A8F 9B2C D1E3 7F05 8821  B309 6C5E 1A2D 8E4F 99B0',
  twitterUrl: '',
  discordUsername: '',
  updatedAt: new Date().toISOString(),
};

// In-memory runtime cache for resilience
let cachedContactDetails: ContactDetails = { ...DEFAULT_CONTACT_DETAILS };

/**
 * Retrieves contact details from Supabase or returns in-memory fallback.
 */
export async function getContactDetails(): Promise<ContactDetails> {
  try {
    const { data, error } = await supabase
      .from('contact_details')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      cachedContactDetails = {
        ...DEFAULT_CONTACT_DETAILS,
        ...data,
      };
      return cachedContactDetails;
    }
  } catch (err) {
    console.error('[DB GET CONTACT ERROR - USING FALLBACK]:', err);
  }

  return cachedContactDetails;
}

/**
 * Updates contact details in Supabase and memory cache.
 */
export async function updateContactDetails(input: Partial<ContactDetails>): Promise<ContactDetails> {
  const updated: ContactDetails = {
    ...cachedContactDetails,
    ...input,
    id: 'default',
    updatedAt: new Date().toISOString(),
  };

  cachedContactDetails = updated;

  try {
    const { data, error } = await supabase
      .from('contact_details')
      .upsert(
        {
          id: 'default',
          name: updated.name,
          title: updated.title,
          vitEmail: updated.vitEmail,
          officialEmail: updated.officialEmail,
          linkedinUrl: updated.linkedinUrl,
          githubUrl: updated.githubUrl,
          location: updated.location,
          bio: updated.bio,
          availableFor: updated.availableFor,
          pgpKey: updated.pgpKey || '',
          pgpKeyFingerprint: updated.pgpKeyFingerprint || '',
          twitterUrl: updated.twitterUrl || '',
          discordUsername: updated.discordUsername || '',
          updatedAt: updated.updatedAt,
        },
        { onConflict: 'id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[DB UPSERT CONTACT NOTICE]: Supabase table may not exist yet, using in-memory update:', error.message);
    } else if (data) {
      cachedContactDetails = { ...DEFAULT_CONTACT_DETAILS, ...data };
    }
  } catch (err) {
    console.error('[DB UPSERT CONTACT ERROR]:', err);
  }

  return cachedContactDetails;
}
