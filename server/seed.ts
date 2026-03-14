import { db, updateUserPassword, getUserByUsername } from './db';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = 'admin123';

export async function initializeAdminPassword() {
  const admin = getUserByUsername('Administrator');
  if (admin && !admin.password_hash) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    updateUserPassword(admin.id, hash);
    console.log('Admin password initialized');
  }
}

export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  db.exec(`
    INSERT INTO users (username, role, reputation, title, signature, created_at, last_seen_at, post_count) VALUES
    ('Administrator', 'admin', 9999, 'Supreme Overlord', 'The rules are whatever I say they are.', '2004-03-15 10:00:00', '2025-01-15 09:30:00', 342),
    ('ModeratorSteve', 'mod', 1500, 'Senior Moderator', 'I am the law here. Mostly.', '2005-06-20 14:30:00', '2025-01-15 08:45:00', 892),
    ('Mod_Karen', 'mod', 800, 'Moderator', 'Your post has been noted and filed appropriately.', '2006-11-08 09:15:00', '2025-01-14 22:10:00', 445),
    ('xX_FlameMage_Xx', 'user', -50, 'Probationary Member', 'FIRE BURNS ALL WHO OPPOSE', '2007-02-14 16:45:00', '2008-03-22 11:30:00', 127),
    ('CoolGuy1999', 'user', 250, 'Veteran Member', '~*~Cool guys dont look at explosions~*~', '2005-09-03 20:00:00', '2025-01-10 15:20:00', 1543),
    ('ForumNinja', 'user', 180, 'Regular Member', '[img]ninja.gif[/img]', '2006-04-17 11:20:00', '2025-01-12 18:40:00', 678),
    ('DebateKing2006', 'user', -120, 'Member', 'Actually, I think you will find that I am correct.', '2006-08-25 13:00:00', '2007-12-01 09:00:00', 2341),
    ('SilentLurker', 'user', 50, 'Lurker', '', '2007-05-30 22:30:00', '2025-01-13 03:15:00', 23),
    ('MemeCollector', 'user', 320, 'Senior Member', 'All your base are belong to us', '2005-12-01 08:00:00', '2025-01-14 12:00:00', 1876),
    ('TrollHunter', 'user', 75, 'Member', 'Dont feed the trolls, report them!', '2008-01-10 17:45:00', '2025-01-11 20:30:00', 234),
    ('NewbieUser01', 'user', 5, 'Newbie', 'Hi Im new here :)', '2024-12-20 10:00:00', '2025-01-08 14:00:00', 12),
    ('VintageGamer', 'user', 450, 'Elite Member', 'Member since the dark ages', '2004-06-01 12:00:00', '2025-01-09 16:45:00', 3421),
    ('OffTopic_Andy', 'user', -80, 'Derailed', 'Speaking of which, have you heard about...', '2006-10-15 19:30:00', '2009-04-12 08:20:00', 567),
    ('RuleStickler', 'user', 200, 'Regular Member', 'Please read rule 7.3.1a before posting.', '2005-08-22 14:15:00', '2025-01-14 11:00:00', 445),
    ('Controversial_Carla', 'user', -200, 'Suspended', 'You cannot handle the truth', '2007-03-03 21:00:00', '2008-07-19 16:30:00', 892),
    ('HelpfulHank', 'user', 500, 'Community Helper', 'Happy to help! Just ask.', '2005-04-10 09:00:00', '2025-01-15 07:00:00', 2134),
    ('GrammarPolice', 'user', 30, 'Member', '*youre', '2006-07-14 16:00:00', '2025-01-13 19:45:00', 1567),
    ('AnonymousCoward', 'user', -10, 'Member', '...', '2007-09-28 23:59:00', '2024-06-01 12:00:00', 89),
    ('LegacyUser_2004', 'user', 600, 'Forum Legend', 'I remember when this place had standards.', '2004-01-01 00:00:01', '2025-01-14 08:30:00', 5678),
    ('Banned_Bob', 'user', -500, 'BANNED', 'This account has been terminated.', '2006-02-28 15:00:00', '2006-05-15 10:00:00', 234),
    ('QuietObserver', 'user', 100, 'Watcher', 'Observing...', '2007-11-11 11:11:00', '2025-01-10 22:00:00', 45),
    ('TechSupport_Tom', 'user', 350, 'Tech Guru', 'Have you tried turning it off and on again?', '2005-05-05 05:05:00', '2025-01-15 06:30:00', 1234),
    ('WrongVibes_Wendy', 'user', -150, 'Vibes Offender', 'I just think its neat', '2008-08-08 08:08:00', '2009-02-14 14:00:00', 78);
  `);

  db.exec(`
    INSERT INTO threads (author_user_id, title, body, created_at, locked, sticky, view_count, reply_count, last_post_at, last_post_user_id) VALUES
    (1, 'WELCOME TO THE FORUM - READ BEFORE POSTING', 'Welcome to our community! Please read the rules before posting. Violations will be dealt with swiftly and perhaps inconsistently.

This forum was established in 2004 and we have a proud tradition of... moderation. New users should lurk for at least 3 months before their first post (not required, but highly recommended for your safety).

Remember: The mods are always watching. Always.', '2004-03-15 10:30:00', 0, 1, 45678, 12, '2025-01-10 14:20:00', 16),
    
    (5, 'Best video games of 2006 discussion', 'Yo what games are you guys playing this year? I think Oblivion is gonna be sick. The graphics look insane.

Also been playing some World of Warcraft, my guild just cleared Molten Core finally!', '2006-01-15 18:00:00', 0, 0, 2341, 45, '2006-12-20 22:30:00', 9),
    
    (7, 'Actually I think the rules need to be reconsidered', 'I have noticed some inconsistencies in how the rules are being applied. For example, last week user X was banned for saying Y, but user Z said essentially the same thing and nothing happened.

I am not saying the mods are biased, but the data speaks for itself. I have prepared a 47-page analysis...', '2007-06-10 14:00:00', 1, 0, 1234, 89, '2007-06-11 09:00:00', 2),
    
    (4, 'URGENT: My signature is not displaying correctly', 'WHY IS MY SIGNATURE NOT WORKING??? I put the fire emoji but its just showing text. This is UNACCEPTABLE. How am I supposed to represent my CLAN without proper signature support???

FIX THIS NOW MODS OR I WILL TAKE MY POSTING ELSEWHERE', '2007-08-22 11:30:00', 0, 0, 567, 23, '2007-09-15 16:45:00', 17),
    
    (9, 'Best memes of 2005 (post your favorites)', 'Post your best memes here! I will start:

O RLY?
NO WAI!

Also ceiling cat is watching you.', '2005-12-25 00:00:00', 0, 0, 8765, 156, '2008-03-10 20:00:00', 5),
    
    (12, 'Remember the old forum software? (nostalgia thread)', 'Does anyone else remember when we used that old forum software back in 2003? The one where you had to manually refresh to see new posts?

Good times. The current software is fine but it lacks character.', '2008-02-14 16:00:00', 0, 0, 432, 34, '2008-11-20 12:00:00', 19),
    
    (6, 'NINJA TECHNIQUES: A comprehensive guide', 'In this thread I will teach you the ways of the forum ninja. First lesson: stealth posting.

[This post has been edited by ForumNinja at 2006-04-17 11:25:00]
[This post has been edited by ForumNinja at 2006-04-17 11:26:00]
[This post has been edited by ForumNinja at 2006-04-17 11:27:00]', '2006-04-17 11:22:00', 0, 0, 1543, 67, '2007-08-30 14:15:00', 6),
    
    (13, 'Off topic but has anyone seen this weird website', 'So I was browsing and found this site called YouTube. You can upload videos??? Seems kinda pointless but maybe it will catch on.

Anyway what do you guys think about the new Star Wars prequels?', '2006-06-15 20:30:00', 1, 0, 234, 15, '2006-06-16 08:00:00', 2),
    
    (16, 'SOLVED: How to fix the blinking cursor issue', 'If your cursor is blinking weirdly, try these steps:

1. Press Ctrl+Alt+Delete
2. Open Task Manager
3. End the process called "explorer.exe"
4. Panic
5. Restart your computer

Hope this helps!', '2007-03-20 09:00:00', 0, 0, 876, 28, '2007-12-01 11:30:00', 22),
    
    (10, 'TROLL SPOTTED in the gaming subforum', 'I have identified a possible troll in the gaming subforum. User "xX_FlameMage_Xx" has been making inflammatory posts about console vs PC gaming.

Evidence attached. Requesting mod review.', '2007-10-05 19:00:00', 0, 0, 345, 41, '2007-11-20 16:00:00', 2),

    (15, 'Why was my thread deleted?', 'I posted a perfectly reasonable thread yesterday and it just disappeared. No warning, no explanation. 

I demand to know what rule I broke. This is censorship!', '2008-05-10 14:00:00', 1, 0, 567, 8, '2008-05-10 15:30:00', 3);
  `);

  db.exec(`
    INSERT INTO posts (thread_id, author_user_id, body, created_at, deleted, mod_note) VALUES
    (1, 16, 'Great to be here! Looking forward to participating in this community.', '2005-04-12 10:00:00', 0, NULL),
    (1, 5, 'Been here for a while, this place is pretty cool once you learn the unwritten rules lol', '2005-09-10 14:30:00', 0, NULL),
    (1, 2, 'Just a reminder: we ARE watching. Happy posting!', '2006-01-01 00:00:00', 0, NULL),
    
    (2, 9, 'Oblivion is overrated tbh. Morrowind was better.', '2006-01-16 09:00:00', 0, NULL),
    (2, 12, 'You young people dont know real games. Try playing Ultima Online.', '2006-01-17 11:30:00', 0, NULL),
    (2, 4, 'WoW is for CASUALS. Real gamers play HARDCORE games like... uhh... other games.', '2006-02-01 16:00:00', 0, NULL),
    (2, 6, '*vanishes into the shadows* Both are good games.', '2006-02-15 22:00:00', 0, NULL),
    
    (3, 2, 'Thread locked. This is not the appropriate venue for rules discussion. Please use the official feedback form (which definitely exists).', '2007-06-11 09:00:00', 0, NULL),
    (3, 7, '[This post has been edited by a moderator]', '2007-06-11 08:30:00', 1, 'User was warned for this post'),
    
    (4, 17, '*your', '2007-08-22 12:00:00', 0, NULL),
    (4, 4, 'THATS NOT THE POINT', '2007-08-22 12:05:00', 0, NULL),
    (4, 3, 'Signature functionality has been noted. We will look into this eventually.', '2007-08-23 09:00:00', 0, NULL),
    (4, 2, 'User has been issued a cooling off period for capslock abuse.', '2007-09-01 10:00:00', 0, NULL),
    
    (5, 5, 'lol at ceiling cat! Classic!', '2005-12-25 01:00:00', 0, NULL),
    (5, 6, 'I CAN HAZ CHEEZBURGER?', '2005-12-26 14:00:00', 0, NULL),
    (5, 12, 'These memes will never die. Mark my words.', '2006-01-02 08:00:00', 0, NULL),
    
    (6, 19, 'I definitely remember. The forum was better back then. Less... moderation.', '2008-02-15 09:00:00', 0, NULL),
    (6, 12, 'Ah yes, the good old days. Before the Great Server Migration of 2005.', '2008-03-01 16:00:00', 0, NULL),
    
    (7, 2, 'Impressive edits. Very stealthy.', '2006-04-18 08:00:00', 0, NULL),
    (7, 6, 'Thank you sensei', '2006-04-18 08:01:00', 0, NULL),
    
    (8, 2, 'Thread locked. Off-topic discussions belong in the Off-Topic subforum, not General Discussion.', '2006-06-16 08:00:00', 0, NULL),
    
    (10, 2, 'Thank you for the report. We are investigating.', '2007-10-06 09:00:00', 0, NULL),
    (10, 4, 'I AM NOT A TROLL. PC GAMING IS OBJECTIVELY SUPERIOR.', '2007-10-06 10:00:00', 1, 'Removed: Derailing and capslock'),
    
    (11, 3, 'Your thread was removed for violating Rule 4 (unspecified). This decision is final.', '2008-05-10 15:00:00', 0, NULL),
    (11, 15, 'But what IS Rule 4???', '2008-05-10 15:15:00', 1, 'User was banned for questioning moderation decisions');
  `);

  db.exec(`
    INSERT INTO reports (reporter_user_id, target_type, target_id, reason, status, created_at) VALUES
    (10, 'post', 6, 'User is being inflammatory about gaming platforms', 'resolved', '2007-10-05 18:30:00'),
    (14, 'post', 11, 'Excessive use of caps lock', 'resolved', '2007-08-22 12:10:00'),
    (17, 'thread', 3, 'User is undermining moderator authority', 'resolved', '2007-06-10 15:00:00'),
    (5, 'post', 23, 'Seems like a troll response to legitimate criticism', 'pending', '2007-10-06 10:30:00'),
    (19, 'thread', 11, 'Thread should not have been deleted in the first place', 'dismissed', '2008-05-10 16:00:00'),
    (11, 'post', 4, 'Post is kind of mean spirited maybe?', 'pending', '2025-01-08 15:00:00'),
    (6, 'thread', 4, 'User seems distressed, maybe needs help not punishment', 'pending', '2007-08-23 10:00:00');
  `);

  db.exec(`
    INSERT INTO moderation_actions (actor_user_id, target_user_id, target_post_id, target_thread_id, action_type, action_payload, created_at) VALUES
    (2, 7, NULL, 3, 'lock', '{"reason": "Inappropriate discussion of moderation policy"}', '2007-06-11 09:00:00'),
    (2, 7, 9, NULL, 'delete', '{"reason": "Undermining moderator authority", "original_content": "The moderators are clearly biased and I can prove it..."}', '2007-06-11 08:30:00'),
    (2, 7, NULL, NULL, 'warn', '{"reason": "Continued rules lawyering", "severity": 3}', '2007-06-11 09:05:00'),
    (2, 4, 23, NULL, 'delete', '{"reason": "Capslock and derailing", "original_content": "I AM NOT A TROLL..."}', '2007-10-06 10:05:00'),
    (3, 4, NULL, NULL, 'warn', '{"reason": "Repeated capslock violations", "severity": 2}', '2007-09-01 10:00:00'),
    (2, 13, NULL, 8, 'lock', '{"reason": "Off-topic content in wrong subforum"}', '2006-06-16 08:00:00'),
    (3, 15, 25, NULL, 'delete', '{"reason": "Questioning moderation decisions", "original_content": "But what IS Rule 4???"}', '2008-05-10 15:20:00'),
    (2, 15, NULL, 11, 'lock', '{"reason": "User does not need to know Rule 4"}', '2008-05-10 15:30:00'),
    (1, NULL, NULL, NULL, 'rule_change', '{"rule_id": 4, "old_text": "No spam", "new_text": "No spam or spam-adjacent behavior", "note": "Clarification"}', '2008-05-09 12:00:00');
  `);

  db.exec(`
    INSERT INTO bans (user_id, mod_user_id, reason_code, reason_text, severity, duration_hours, created_at, expires_at, active) VALUES
    (4, 2, 'derailing', 'Persistent capslock abuse and inflammatory gaming takes. User has been warned multiple times.', 3, 168, '2007-10-06 11:00:00', '2007-10-13 11:00:00', 0),
    (7, 2, 'disrespect', 'Undermining moderator authority through "rules analysis". We know what you were doing.', 4, 720, '2007-06-12 10:00:00', '2007-07-12 10:00:00', 0),
    (13, 3, 'wrong-vibes', 'General off-topic behavior and YouTube promotion.', 2, 24, '2006-06-17 08:00:00', '2006-06-18 08:00:00', 0),
    (15, 2, 'rule-3', 'Persistent questioning of moderation decisions after being asked to stop.', 5, 0, '2008-05-10 16:00:00', NULL, 1),
    (20, 1, 'spam', 'Account used exclusively for spam. Permanent ban.', 5, 0, '2006-05-15 10:00:00', NULL, 1),
    (23, 3, 'wrong-vibes', 'Just had weird energy. Nothing specific, just... you know.', 3, 48, '2009-02-14 14:00:00', '2009-02-16 14:00:00', 0);
  `);

  db.exec(`
    INSERT INTO museum_entries (user_id, created_at, title, summary, verdict) VALUES
    (4, '2007-10-07 00:00:00', 'Exhibit #001: "xX_FlameMage_Xx"', 'User known for passionate gaming opinions and creative use of caps lock. Account activity ceased after "The Console Wars Incident" of October 2007.', 'Contested'),
    (7, '2007-06-13 00:00:00', 'Exhibit #002: "DebateKing2006"', 'Prolific poster with 2,341 contributions. Developed a reputation for thorough analysis of forum policies. Final post was a 47-page document that has since been lost to time.', 'Overturned'),
    (15, '2008-05-11 00:00:00', 'Exhibit #003: "Controversial_Carla"', 'Brief but memorable forum presence. Asked the forbidden question: "But what IS Rule 4?" Account status changed to BANNED shortly thereafter.', 'Canonized'),
    (20, '2006-05-16 00:00:00', 'Exhibit #004: "Banned_Bob"', 'Account terminated for spam. Multiple witness statements conflict on whether actual spam occurred.', 'Unclear'),
    (23, '2009-02-15 00:00:00', 'Exhibit #005: "WrongVibes_Wendy"', 'Banned for "wrong vibes." No specific rule violation cited. Community opinion remains divided.', 'Contested');
  `);

  db.exec(`
    INSERT INTO museum_artifacts (museum_entry_id, artifact_type, content, created_at, source_label) VALUES
    (1, 'quote', 'PC GAMING IS OBJECTIVELY SUPERIOR. YOU CONSOLE PEASANTS WILL NEVER UNDERSTAND.', '2007-10-06 10:00:00', 'User Post (Deleted)'),
    (1, 'mod_log', 'User warned for capslock abuse. This is their third warning this month.', '2007-09-01 10:00:00', 'Mod Note - ModeratorSteve'),
    (1, 'witness_statement', 'I saw the original post. It was actually pretty reasonable until they started yelling.', '2007-10-08 00:00:00', 'Anonymous Forum Member'),
    (1, 'witness_statement', 'That user was always yelling. From day one. I remember.', '2007-10-08 01:00:00', 'VintageGamer'),
    (1, 'screenshot_text', '[IMAGE MISSING - Server migration 2008]', '2007-10-06 10:05:00', 'Evidence Archive'),
    
    (2, 'quote', 'I have prepared a 47-page analysis demonstrating inconsistencies in rule enforcement...', '2007-06-10 14:00:00', 'User Thread (Locked)'),
    (2, 'mod_log', 'Thread locked. User warned. Document confiscated for "review."', '2007-06-11 09:00:00', 'Mod Note - ModeratorSteve'),
    (2, 'mod_log', 'Upon further review, user may have had a point. Consider unbanning. - Administrator', '2007-08-15 00:00:00', 'Admin Note'),
    (2, 'witness_statement', 'The 47-page document was actually quite well-researched. I managed to read part of it before it was removed.', '2007-06-20 00:00:00', 'Anonymous Senior Member'),
    
    (3, 'quote', 'But what IS Rule 4???', '2008-05-10 15:15:00', 'User Post (Deleted)'),
    (3, 'mod_log', 'User banned permanently for questioning moderation decisions.', '2008-05-10 16:00:00', 'Mod Note - ModeratorSteve'),
    (3, 'mod_log', 'Rule 4 was clarified the day BEFORE this incident. Coincidence?', '2008-05-11 00:00:00', 'Observation - Unknown'),
    (3, 'witness_statement', 'Nobody knows what Rule 4 is. We just dont talk about it.', '2008-05-12 00:00:00', 'Long-time Member'),
    (3, 'screenshot_text', '[SCREENSHOT REDACTED BY ADMINISTRATION]', '2008-05-10 15:30:00', 'Evidence Archive'),
    
    (4, 'quote', '[No posts archived - Account flagged as spam]', '2006-05-15 10:00:00', 'System'),
    (4, 'mod_log', 'Account terminated for spam activity.', '2006-05-15 10:00:00', 'Admin Note - Administrator'),
    (4, 'witness_statement', 'I never actually saw any spam from this user. Weird.', '2006-05-20 00:00:00', 'Anonymous'),
    (4, 'witness_statement', 'Definitely spam. I saw it. Trust me.', '2006-05-20 01:00:00', 'TrollHunter'),
    
    (5, 'quote', 'I just think its neat', '2009-02-14 12:00:00', 'User Post'),
    (5, 'mod_log', 'User banned for wrong vibes. Duration: 48 hours.', '2009-02-14 14:00:00', 'Mod Note - Mod_Karen'),
    (5, 'witness_statement', 'The vibes were definitely wrong. Cannot explain how. Just... wrong.', '2009-02-15 00:00:00', 'Anonymous'),
    (5, 'witness_statement', 'I thought the vibes were fine? Maybe even good?', '2009-02-15 01:00:00', 'HelpfulHank');
  `);

  db.exec(`
    INSERT INTO rules (rule_number, title, description, last_edited, edited_by_user_id, edit_note) VALUES
    (1, 'Be Respectful', 'Treat all members with respect. Personal attacks, harassment, and discrimination are not tolerated. What constitutes "respect" is determined by moderators on a case-by-case basis.', '2004-03-15 10:00:00', 1, 'Original rule'),
    (2, 'Stay On Topic', 'Keep discussions relevant to the thread topic. Off-topic posts may be moved or deleted. The definition of "on topic" may vary.', '2004-03-15 10:00:00', 1, 'Original rule'),
    (3, 'No Spam', 'Do not post spam, advertisements, or promotional content without permission. This includes links that moderators find suspicious.', '2008-05-09 12:00:00', 1, 'Expanded to include spam-adjacent behavior'),
    (4, 'CLASSIFIED', 'This rule is known only to moderators. Violation of this rule results in immediate action. Do not ask about this rule.', '2008-05-09 11:59:00', 1, 'Clarified'),
    (5, 'No Impersonation', 'Do not impersonate other users, moderators, or administrators. This includes similar usernames.', '2005-06-20 14:00:00', 1, 'Original rule'),
    (6, 'Use Appropriate Language', 'Avoid excessive profanity, CAPS LOCK, or other disruptive text formatting. Occasional emphasis is acceptable.', '2006-11-08 09:00:00', 3, 'Caps lock clause added'),
    (7, 'Report, Dont Engage', 'If you see rule-breaking content, report it to moderators. Do not engage with trolls or flame wars.', '2007-05-01 12:00:00', 2, 'Original rule'),
    (8, 'One Account Per Person', 'Multiple accounts are not permitted. Suspected alt accounts will be investigated and may be banned.', '2004-03-15 10:00:00', 1, 'Original rule'),
    (9, 'No Backseat Moderating', 'Leave moderation to the moderators. If you think someone is breaking rules, report them. Do not publicly call them out.', '2006-04-01 08:00:00', 2, 'Original rule'),
    (10, 'Moderator Discretion', 'Moderators reserve the right to take action on any post or user that they deem harmful to the community, even if no specific rule is violated. Vibes matter.', '2009-02-14 12:00:00', 3, 'Vibes clause added');
  `);

  console.log('Database seeded successfully!');
}
