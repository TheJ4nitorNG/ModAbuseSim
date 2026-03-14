import * as db from './db';

const BAN_REASON_CODES = ['spam', 'derailing', 'wrong-vibes', 'disrespect', 'rule-3', 'other'];

const PETTY_REASONS = [
  "User's posting style was deemed incompatible with community standards",
  "Excessive enthusiasm detected in response patterns",
  "Failure to read the room appropriately",
  "Persistent refusal to understand obvious social cues",
  "Technically correct but spiritually wrong",
  "Contribution was not conducive to healthy discourse",
  "User's energy did not align with forum values",
  "Repeated use of deprecated posting conventions",
  "Information shared was correct but unwelcome",
  "Tone was interpreted as confrontational by moderators",
  "User challenged established community narratives",
  "Post contained elements that caused moderator discomfort",
  "General pattern of not fitting in detected",
  "User showed insufficient deference to veteran members",
  "Content was flagged by automated vibe-checking system"
];

const WITNESS_STATEMENTS = [
  "I saw the whole thing. It was definitely their fault.",
  "To be honest, I wasn't really paying attention, but it seemed bad.",
  "Actually, I thought their posts were fine? This seems excessive.",
  "I've been here since 2004 and this is the worst thing I've ever seen.",
  "Can confirm. Was there. Very problematic.",
  "I don't want to get involved, but... yes.",
  "The user in question once replied to one of my threads. I had a bad feeling even then.",
  "I predicted this would happen. I have the screenshots to prove it. Well, I did. Server migration.",
  "This is a clear case of wrong vibes. Anyone could see it.",
  "I actually agreed with some of what they said, but I guess the mods know best.",
  "Not surprised at all. Zero surprise. Saw it coming a mile away.",
  "They seemed normal at first, which in hindsight was the first red flag.",
  "I reported them three times before anything happened. Justice at last.",
  "Honestly? I think the mods overreacted. But don't quote me on that.",
  "The community is better off. Probably. I think.",
  "Their posts weren't that bad, but their signature was incredibly annoying.",
  "I can neither confirm nor deny witnessing the incident in question.",
  "What happened was inevitable given their posting history.",
  "I tried to warn them. They didn't listen."
];

const MOD_NOTES = [
  "User has been counseled. Expect improvement or escalation.",
  "This is their final warning. (Note: may not actually be final)",
  "Pattern of behavior has been noted and filed.",
  "User claims innocence. Claim has been reviewed and rejected.",
  "Previous warnings have been aggregated. Threshold exceeded.",
  "Moderator team has reached consensus. Decision stands.",
  "Appeal was considered and summarily dismissed.",
  "User's reputation score contributed to outcome severity.",
  "Action taken in accordance with Rule 4 (classified).",
  "Precedent established. Future violations will be handled accordingly.",
  "User's posting privilege has been adjusted.",
  "Incident has been logged for future reference.",
  "The community's patience has been exhausted.",
  "User expressed disagreement with decision. Disagreement noted.",
  "This concludes the matter. Further discussion is not encouraged."
];

const VERDICTS = ['Contested', 'Unclear', 'Overturned', 'Canonized', 'Pending Review'] as const;

export function randomBanReason(): { reasonCode: string; reasonText: string } {
  const reasonCode = BAN_REASON_CODES[Math.floor(Math.random() * BAN_REASON_CODES.length)];
  const reasonText = PETTY_REASONS[Math.floor(Math.random() * PETTY_REASONS.length)];
  return { reasonCode, reasonText };
}

export function randomWitnessStatement(): string {
  return WITNESS_STATEMENTS[Math.floor(Math.random() * WITNESS_STATEMENTS.length)];
}

export function randomModNote(): string {
  return MOD_NOTES[Math.floor(Math.random() * MOD_NOTES.length)];
}

export function randomVerdict(): string {
  return VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
}

export function pickQuoteFromUserPosts(userId: number): string | null {
  const posts = db.getUserPosts(userId, 10);
  if (posts.length === 0) return null;
  
  const randomPost = posts[Math.floor(Math.random() * posts.length)];
  const sentences = randomPost.body.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length > 0) {
    return sentences[Math.floor(Math.random() * sentences.length)].trim();
  }
  
  return randomPost.body.substring(0, 150) + (randomPost.body.length > 150 ? '...' : '');
}

export function getModMood(): number {
  const dailySeed = Math.floor(Date.now() / 86400000);
  const pseudoRandom = Math.sin(dailySeed) * 10000;
  return (pseudoRandom - Math.floor(pseudoRandom)) * 2 - 1;
}

export function resolveAction(
  baseAction: 'warn' | 'delete' | 'lock' | 'ban',
  baseSeverity: number,
  userReputation: number
): {
  finalAction: string;
  finalSeverity: number;
  escalated: boolean;
  durationHours: number;
  notes: string[];
} {
  const notes: string[] = [];
  let finalAction = baseAction;
  let finalSeverity = baseSeverity;
  let escalated = false;
  let durationHours = 0;
  
  const severitySwing = Math.floor(Math.random() * 5) - 2;
  finalSeverity = Math.max(1, Math.min(5, baseSeverity + severitySwing));
  
  if (severitySwing !== 0) {
    notes.push(`Severity adjusted by ${severitySwing > 0 ? '+' : ''}${severitySwing} (RNG factor)`);
  }
  
  const modMood = getModMood();
  if (modMood > 0.5) {
    notes.push('Mod mood: STRICT - Enhanced scrutiny applied');
    finalSeverity = Math.min(5, finalSeverity + 1);
  } else if (modMood < -0.5) {
    notes.push('Mod mood: LENIENT - Reduced severity applied');
    finalSeverity = Math.max(1, finalSeverity - 1);
  }
  
  if (userReputation < -100) {
    notes.push('Low reputation modifier: +1 severity');
    finalSeverity = Math.min(5, finalSeverity + 1);
  } else if (userReputation > 500) {
    notes.push('High reputation modifier: Protected status considered');
    finalSeverity = Math.max(1, finalSeverity - 1);
  }
  
  if (baseAction === 'warn' && Math.random() < 0.15) {
    escalated = true;
    finalAction = 'ban';
    notes.push('ESCALATION: Warning automatically upgraded to ban (RNG: 15% chance)');
    durationHours = [24, 48, 168][Math.floor(Math.random() * 3)];
  }
  
  if (baseAction === 'delete' && Math.random() < 0.10) {
    escalated = true;
    notes.push('ESCALATION: Deletion triggered thread lock');
  }
  
  if (baseAction === 'ban') {
    if (Math.random() < 0.05 && durationHours !== 0) {
      escalated = true;
      durationHours = 0;
      notes.push('CRITICAL ESCALATION: Ban upgraded to permanent (5% chance)');
    } else if (!escalated) {
      const durations = [24, 48, 168, 720, 0];
      const weights = [3, 3, 2, 1, 0.5];
      const severityIndex = Math.min(finalSeverity - 1, weights.length - 1);
      durationHours = durations[severityIndex];
    }
  }
  
  return {
    finalAction,
    finalSeverity,
    escalated,
    durationHours,
    notes
  };
}

export function generateMuseumEntry(userId: number, banId: number): number {
  const user = db.getUser(userId);
  if (!user) return -1;
  
  const existingEntry = db.getMuseumEntryByUserId(userId);
  if (existingEntry) {
    return existingEntry.id;
  }
  
  const entryNumber = db.getMuseumEntries().length + 1;
  const title = `Exhibit #${String(entryNumber).padStart(3, '0')}: "${user.username}"`;
  
  const summaries = [
    `User known for ${user.post_count} contributions before their departure from the community. Account activity ceased following an incident that remains subject to interpretation.`,
    `A ${user.post_count > 100 ? 'prolific' : 'modest'} poster whose time on the forum ended under circumstances that continue to be debated among longtime members.`,
    `Once a ${user.reputation > 0 ? 'respected' : 'controversial'} member of the community. Their final interactions with the moderation team have been archived for posterity.`,
    `Account "${user.username}" represents one of the more ${Math.random() > 0.5 ? 'notable' : 'routine'} moderation cases in forum history. Documentation is ${Math.random() > 0.5 ? 'incomplete' : 'extensive'}.`
  ];
  
  const summary = summaries[Math.floor(Math.random() * summaries.length)];
  const verdict = randomVerdict();
  
  const entryId = db.createMuseumEntry(userId, title, summary, verdict);
  
  const quote = pickQuoteFromUserPosts(userId);
  if (quote) {
    db.createMuseumArtifact(entryId, 'quote', quote, 'User Post');
  }
  
  const bans = db.getUserBans(userId);
  if (bans.length > 0) {
    const latestBan = bans[0];
    db.createMuseumArtifact(
      entryId,
      'mod_log',
      `User banned for: ${latestBan.reason_text}`,
      'Moderation Log'
    );
  }
  
  const modActions = db.getUserModerationActions(userId);
  if (modActions.length > 0) {
    const randomAction = modActions[Math.floor(Math.random() * modActions.length)];
    db.createMuseumArtifact(
      entryId,
      'mod_log',
      randomModNote(),
      `Mod Note - Action ID #${randomAction.id}`
    );
  }
  
  const numWitnesses = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numWitnesses; i++) {
    db.createMuseumArtifact(
      entryId,
      'witness_statement',
      randomWitnessStatement(),
      i === 0 ? 'Anonymous Forum Member' : ['Long-time Lurker', 'Former Moderator', 'Community Veteran', 'Anonymous'][Math.floor(Math.random() * 4)]
    );
  }
  
  if (Math.random() > 0.6) {
    const placeholders = [
      '[IMAGE MISSING - Server migration 2008]',
      '[SCREENSHOT REDACTED BY ADMINISTRATION]',
      '[IMAGE FILE CORRUPTED]',
      '[EVIDENCE ARCHIVED - Access restricted]',
      '[SCREENSHOT UNAVAILABLE - Original poster deleted]'
    ];
    db.createMuseumArtifact(
      entryId,
      'screenshot_text',
      placeholders[Math.floor(Math.random() * placeholders.length)],
      'Evidence Archive'
    );
  }
  
  return entryId;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => escapeMap[char] || char);
}
