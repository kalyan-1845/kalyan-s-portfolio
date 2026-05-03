# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | ✅ Actively maintained |
| Older   | ❌ No longer supported |

## Reporting a Vulnerability

The security of this project is taken seriously. If you discover a security vulnerability, please follow the responsible disclosure process outlined below.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. **Email** your findings to the repository owner via [LinkedIn](https://www.linkedin.com/in/bhoompally-kalyan-reddy/) direct message
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment of report | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Resolution & patch | Within **30 days** (depending on severity) |

### What to Expect

- A confirmation that your report has been received
- An assessment of the vulnerability and its severity
- A timeline for the fix
- Credit in the release notes (unless you prefer to remain anonymous)

## Security Best Practices

This project follows these security practices:

- **No server-side code** — Static site with no backend attack surface
- **No sensitive data storage** — No databases, cookies, or local storage of PII
- **Third-party audit** — External libraries loaded via trusted CDNs with integrity verification
- **Content Security** — No inline script injection vectors; all logic is self-contained
- **HTTPS enforcement** — Deployed via GitHub Pages with automatic HTTPS

## Scope

The following are **in scope** for security reports:

- Cross-Site Scripting (XSS) vulnerabilities
- Content injection flaws
- Dependency vulnerabilities in linked CDN resources
- Information disclosure issues

The following are **out of scope**:

- Social engineering attacks
- Denial of Service (DoS) attacks
- Issues in third-party services (EmailJS, Font Awesome, Google Fonts)
- Vulnerabilities requiring physical access to a user's device

## Acknowledgments

We appreciate the security research community's efforts in helping keep this project safe. Responsible reporters will be acknowledged in our release notes.

---

**Thank you for helping keep this project and its users safe!**
