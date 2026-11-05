ZWIBODONI TICKET WEBSITE

Files:
- server.js: Node.js web server and API
- package.json: start command
- public/apply.html: guest application page
- public/admin.html: organiser approval page

Run locally:
1. Install Node.js 18 or newer.
2. Set ADMIN_PASSWORD to a NEW strong password in the hosting environment. Do not put it in source code.
3. Run: npm start
4. Open the service URL. Guest page: /apply.html. Admin page: /admin.html.

Event settings in this starter:
- Event date: 5 December 2026
- Ticket price: R50
- Payment contact: Rotenda, +27 76 487 3815
- Payment deadline: 28 November 2026

IMPORTANT:
- This starter records applications and lets the organiser manually confirm payment. It does not collect or process payments.
- It is a starter, not a production-hardened ticketing system. Add durable database storage, stronger session management, rate limiting, backups, and proper ticket check-in before selling real tickets.
- Render's ordinary local filesystem may be ephemeral. Use a persistent disk or database before accepting real applications. Do not assume tickets.json will survive restarts/redeploys.
- Use HTTPS. Keep ADMIN_PASSWORD secret and change any password previously shared in chat.
