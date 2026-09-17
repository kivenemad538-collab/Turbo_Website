Turbo RP V35 - Panel Allowlist Only

Admin panel access is now granted ONLY to:
1) OWNER_USER_ID
2) Discord IDs explicitly added to panelAdmins from the control panel.

Removed as panel access methods:
- Discord ADMIN_ROLE_IDS fallback
- ADMIN_PANEL_PASSWORD
- panelAdmin token bypass

Unauthorized users:
- do not see the admin panel button
- cannot open #admin from the UI
- receive HTTP 403 on /api/admin/*

The Discord bot is already integrated in index.js in this website package, so a separate bot package is not required for this access-control change.
