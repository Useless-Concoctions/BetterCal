# Security Model

BetterCal is built with privacy and security as its foundation.

- **Local Ownership**: All calendar events, notes, and personal data are stored locally on your device in a secure SQLite database.
- **AI Privacy**: BetterCal uses Gemini to simplify and organize your calendar data.
    - **Privacy Commitment**: Covered by [Google's Enterprise Privacy protections](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/privacy).
    - **No Training**: Your data is never used to train global AI models.
    - **Isolation**: Data is processed in isolated sessions and is not shared with other users.
- **Secure Integration**: Connections to external services (like Google Calendar) use official OAuth2 protocols to keep credentials secure.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it via the **[GitHub Private Vulnerability Reporting](https://github.com/ryanphanna/BetterCal/security/advisories/new)** tool. Private reports allow for a secure disclosure process before a formal patch is released.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity and complexity
