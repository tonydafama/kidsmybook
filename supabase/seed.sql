insert into public.team_members (email, display_name, role) values
('anthony@hkage.edu.hk', 'Anthony', 'manager'),
('marius@hkage.edu.hk', 'Marius', 'manager'),
('bob@hkage.edu.hk', 'Bob TO', 'member'),
('rachel@hkage.edu.hk', 'Rachel Zhang', 'member'),
('rex@hkage.edu.hk', 'Rex Yeung', 'member'),
('heidi@hkage.edu.hk', 'Heidi Kwok', 'member'),
('parker@hkage.edu.hk', 'Parker Leung', 'member'),
('ann@hkage.edu.hk', 'Ann Tang', 'member')
on conflict (email) do nothing;

insert into public.manager_whitelist (email) values
('anthony@hkage.edu.hk'),
('marius@hkage.edu.hk')
on conflict (email) do nothing;

insert into public.email_task_rules (keyword, project, owner_name, default_priority, default_due_days) values
('IJSO', 'IJSO 2027', 'Ann Tang', 'High', 2),
('IMO', 'IMO Prelim 2026', 'Rex Yeung', 'High', 2),
('HKYPT', 'HKYPT 2026', 'Bob TO', 'High', 3),
('Procurement', 'General Procurement', 'Heidi Kwok', 'Medium', 4),
('Academy Award', 'Academy Award 2026', 'Parker Leung', 'Medium', 3)
on conflict (keyword) do nothing;

insert into public.notification_channels (channel_type, target_name, target_value, is_active) values
('dashboard_only', 'In-app dashboard notifications', null, true),
('teams_webhook', 'SI Team Channel', '<TEAMS_WEBHOOK_URL>', false),
('email_webhook', 'Internal mail relay', '<EMAIL_WEBHOOK_URL>', false);
