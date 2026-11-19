Privacy Policy

Last updated: 19/11/2026

This document applies to the Discord bots of this GitHub repository:
- **Helldivers [FR]** — the community bot of the French Helldivers 2 Discord server ("the HDFR server");
- **Monitoring [FR]** — a private bot that only watches whether Helldivers [FR] is online.

Unless stated otherwise, "the Bot" below means Helldivers [FR].

1. Introduction
This Privacy Policy describes which data the Bot processes, why, where it goes and how long it is kept.

2. Data Controller
The data controller is: https://github.com/Spatulox
Contact me with a Github issue [here](https://github.com/Spatulox/helldivers-FR-bot/issues)

3. Scope
The automatic features (moderation, anti-scam, counting channel, gallery, statistics) only run on
the HDFR server. On any other server where the Bot has been added, it only acts when someone uses
one of its commands there:
- "Translate the Automaton" reads the message it is used on;
- "Delete occurrences" (moderators only) reads the recent messages of that server to find and
  delete the copies of the targeted message;
- it reads the messages posted in the thread of a stratagem code game started there, for the
  duration of the game;
- moderation commands act on that server only; their report is shown on that server, never in the
  HDFR server's channels.

Errors are logged in the Bot's technical logs (console and a private channel of the HDFR server):
they may contain an ID, never the content of a message from another server.

It does not otherwise read, analyse or store the messages of that server.

4. Data Processed

4.1 Discord identifiers
User IDs, server IDs, channel IDs and message IDs, used to reference members, messages and the
Bot's own persistent messages (panels, status) across restarts.

4.2 Message content and attachments (HDFR server only)
The Bot reads the text and attachments of messages posted on the HDFR server in order to:
- run the community mini-games played by typing (counting channel, stratagem code games);
- moderate the gallery channel (only images, videos, links and polls are allowed there);
- protect members against scams: images are hashed and compared to a bank of known scam images,
  their text may be read by OCR (performed locally, on the Bot's host, no external service), and the
  same message posted in several channels within one minute is detected;
- log deleted messages that contained attachments, for moderation.

This processing happens in memory. Message content is **not** stored by the Bot, except the copies
listed in 4.3.

4.3 Copies kept for moderation
A copy of a message (text and attachments) is posted in private staff channels of the HDFR server
when:
- the message triggered an anti-scam sanction, or was deleted by the "Delete occurrences" moderation
  command;
- a message with attachments was deleted;
- a message was removed from the gallery or the counting channel, or edited/deleted there.

Images detected as scams are also posted, with their author's ID and a link to the original message,
in a private channel of the Bot's monitoring server, only accessible to the people who maintain the
Bot and review the scam image bank.

4.4 Scam image bank
Perceptual hashes (fingerprints) of images recognised as scams, with their review status. A hash
cannot be turned back into the image and is not linked to a user.

4.5 Member profile
On the HDFR server, the Bot reads members' nicknames, roles and server tag to apply the server
rules: one level role per member, nickname matching that role, removal of unpingable characters or
emojis, and alerts to moderators for forbidden server tags. Nicknames and roles are changed on
Discord directly; the Bot does not keep a copy.

4.6 Presence
The Bot reads the online status of a single account: the MEE6 bot, to switch on its own temporary
voice channels while MEE6 is offline. Monitoring [FR] reads the online status of the Helldivers [FR]
bot only. No member's presence is read or stored.

4.7 Usage data
- Link requests (`/lien`): the requester's user ID and the dates of their requests, to enforce a
  limit of 3 requests per 24 hours. Entries older than 24 hours are deleted.
- Activity statistics: aggregated numbers only (messages per minute, number of distinct authors,
  members in voice channels), kept for 7 days, without any user ID.
- Feedback and wiki error reports sent through the Bot's forms: the text written and the author's
  user ID, delivered to the Bot's developer.

> The Bot does not collect passwords, email addresses, IP addresses, or the content of direct messages
> sent to it.

5. Legal Basis (GDPR)
Data is processed based on legitimate interest: moderating the HDFR server, protecting its members
against scams, and operating the Bot's features.

6. Data Storage and Security
Data stored by the Bot (section 4.4 and 4.7, plus the identifiers of its own messages) is kept in
files on the Bot's host. Copies listed in 4.3 are stored on Discord, in channels only accessible to
moderators or to the Bot's maintainers. The Bot's host is managed by a hosting provider, which is
responsible for the security of its infrastructure.

7. Data Sharing
Data is not sold or shared with third parties, except:
- when required by law;
- when necessary to operate the Bot (Discord, hosting provider).

8. Data Retention
- Message content: not stored (processed in memory only).
- Moderation copies (4.3): kept in the staff channels as long as needed for moderation; they can be
  deleted on request, unless they are needed to justify an ongoing sanction.
- Scam image bank (4.4): kept as long as the image is used for scams.
- Link requests (4.7): 24 hours. Activity statistics (4.7): 7 days.

9. User Rights (GDPR)
You have the right to:
- access your personal data;
- request correction or deletion;
- object to or restrict processing.

To exercise your rights, contact the data controller.

10. Third-Party Services
The Bot relies on Discord's API and on its hosting provider, which may process data under their own
privacy policies. Image OCR is performed locally with tesseract.js; no image or text is sent to an
external service.

11. Changes to This Policy
This Privacy Policy may be updated at any time. Continued use of the Bot constitutes acceptance of the updated policy.

12. Contact
For any questions or data-related requests, contact with a Github issue [here](https://github.com/Spatulox/helldivers-FR-bot/issues)

By using the Bot, you acknowledge that you have read and understood this Privacy Policy.
