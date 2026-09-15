import { supabase } from '@/lib/db/supabase';

export interface ContactChannel {
  id: string;
  label: string;
  value: string;
  type: 'email' | 'url' | 'username' | 'text';
  platform: 'email' | 'linkedin' | 'github' | 'discord' | 'twitter' | 'telegram' | 'signal' | 'matrix' | 'globe' | 'phone' | 'custom';
  visible: boolean;
  isPrimary?: boolean;
}

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
  channels?: ContactChannel[];
  updatedAt?: string;
}

export function buildDefaultChannels(details?: Partial<ContactDetails>): ContactChannel[] {
  const official = details?.officialEmail || 'anuragsoni5473@gmail.com';
  const vit = details?.vitEmail || 'anurag.soni2025@vitstudent.ac.in';
  const linkedin = details?.linkedinUrl || 'https://www.linkedin.com/in/anur1gsoni/';
  const github = details?.githubUrl || 'https://github.com/anur1g5473';
  const discord = details?.discordUsername || '';
  const twitter = details?.twitterUrl || '';

  return [
    {
      id: 'officialEmail',
      label: 'Official Inbox',
      value: official,
      type: 'email',
      platform: 'email',
      visible: true,
      isPrimary: true,
    },
    {
      id: 'vitEmail',
      label: 'VIT Student Email',
      value: vit,
      type: 'email',
      platform: 'email',
      visible: true,
    },
    {
      id: 'linkedinUrl',
      label: 'LinkedIn Profile',
      value: linkedin,
      type: 'url',
      platform: 'linkedin',
      visible: true,
    },
    {
      id: 'githubUrl',
      label: 'GitHub Repositories',
      value: github,
      type: 'url',
      platform: 'github',
      visible: true,
    },
    {
      id: 'discordUsername',
      label: 'Discord',
      value: discord,
      type: 'username',
      platform: 'discord',
      visible: Boolean(discord && discord.trim() !== ''),
    },
    {
      id: 'twitterUrl',
      label: 'Twitter / X',
      value: twitter,
      type: 'url',
      platform: 'twitter',
      visible: Boolean(twitter && twitter.trim() !== ''),
    },
  ];
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
  channels: buildDefaultChannels(),
  updatedAt: new Date().toISOString(),
};

// In-memory runtime cache for resilience
let cachedContactDetails: ContactDetails = { ...DEFAULT_CONTACT_DETAILS };

function parseChannelsPayload(pgpKey?: string, rawChannels?: any, fallbackDetails?: Partial<ContactDetails>): ContactChannel[] {
  if (Array.isArray(rawChannels) && rawChannels.length > 0) {
    return rawChannels;
  }

  if (pgpKey && pgpKey.startsWith('__CHANNELS_JSON__:')) {
    try {
      const jsonStr = pgpKey.replace('__CHANNELS_JSON__:', '');
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.channels)) {
        return parsed.channels;
      }
    } catch {}
  }

  return buildDefaultChannels(fallbackDetails);
}

function encodeChannelsPayload(channels?: ContactChannel[], rawPgpKey?: string): string {
  const cleanKey = rawPgpKey && !rawPgpKey.startsWith('__CHANNELS_JSON__:') ? rawPgpKey : '';
  const payload = {
    key: cleanKey,
    channels: channels || [],
  };
  return `__CHANNELS_JSON__:${JSON.stringify(payload)}`;
}

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
      const channels = parseChannelsPayload(data.pgpKey, (data as any).channels, data);

      cachedContactDetails = {
        ...DEFAULT_CONTACT_DETAILS,
        ...data,
        channels,
      };
      return cachedContactDetails;
    }
  } catch (err) {
    console.error('[DB GET CONTACT ERROR - USING FALLBACK]:', err);
  }

  if (!cachedContactDetails.channels || cachedContactDetails.channels.length === 0) {
    cachedContactDetails.channels = buildDefaultChannels(cachedContactDetails);
  }

  return cachedContactDetails;
}

/**
 * Updates contact details in Supabase and memory cache.
 */
export async function updateContactDetails(input: Partial<ContactDetails>): Promise<ContactDetails> {
  let channels = input.channels;
  let officialEmail = input.officialEmail || cachedContactDetails.officialEmail;
  let vitEmail = input.vitEmail || cachedContactDetails.vitEmail;
  let linkedinUrl = input.linkedinUrl || cachedContactDetails.linkedinUrl;
  let githubUrl = input.githubUrl || cachedContactDetails.githubUrl;
  let discordUsername = input.discordUsername ?? cachedContactDetails.discordUsername ?? '';
  let twitterUrl = input.twitterUrl ?? cachedContactDetails.twitterUrl ?? '';

  if (channels && Array.isArray(channels)) {
    const off = channels.find((c) => c.id === 'officialEmail' || c.label.toLowerCase().includes('official'));
    if (off && off.value) officialEmail = off.value;

    const vit = channels.find((c) => c.id === 'vitEmail' || c.label.toLowerCase().includes('vit'));
    if (vit && vit.value) vitEmail = vit.value;

    const li = channels.find((c) => c.id === 'linkedinUrl' || c.platform === 'linkedin');
    if (li && li.value) linkedinUrl = li.value;

    const gh = channels.find((c) => c.id === 'githubUrl' || c.platform === 'github');
    if (gh && gh.value) githubUrl = gh.value;

    const dc = channels.find((c) => c.id === 'discordUsername' || c.platform === 'discord');
    if (dc) discordUsername = dc.value;

    const tw = channels.find((c) => c.id === 'twitterUrl' || c.platform === 'twitter');
    if (tw) twitterUrl = tw.value;
  } else {
    channels = buildDefaultChannels({
      officialEmail,
      vitEmail,
      linkedinUrl,
      githubUrl,
      discordUsername,
      twitterUrl,
    });
  }

  const encodedPgpPayload = encodeChannelsPayload(channels, input.pgpKey);

  const updated: ContactDetails = {
    ...cachedContactDetails,
    ...input,
    id: 'default',
    officialEmail,
    vitEmail,
    linkedinUrl,
    githubUrl,
    discordUsername,
    twitterUrl,
    channels,
    pgpKey: encodedPgpPayload,
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
          pgpKey: encodedPgpPayload,
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
      console.warn('[DB UPSERT CONTACT NOTICE]: Supabase update notice:', error.message);
    } else if (data) {
      const parsedChannels = parseChannelsPayload(data.pgpKey, (data as any).channels, data);
      cachedContactDetails = {
        ...DEFAULT_CONTACT_DETAILS,
        ...data,
        channels: parsedChannels,
      };
    }
  } catch (err) {
    console.error('[DB UPSERT CONTACT ERROR]:', err);
  }

  return cachedContactDetails;
}
