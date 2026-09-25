import { pool } from './index';
import { hashPassword } from '../utils/password';

async function seed() {
    console.log('🌱 Starting database seed for onBoard...');

    try {
        // 1. Clean existing records in cascade order
        console.log('🧹 Cleaning existing records...');
        await pool.query('TRUNCATE comments, issues, projects, workspace_members, workspaces, users CASCADE');

        // 2. Create Demo Users
        console.log('👤 Creating demo users...');
        const defaultPasswordHash = await hashPassword('password123');

        const user1Res = await pool.query(
            `INSERT INTO users (email, password_hash, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, name`,
            [
                'alex.chen@onboard.dev',
                defaultPasswordHash,
                'Alex Chen',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
            ]
        );
        const alex = user1Res.rows[0];

        const user2Res = await pool.query(
            `INSERT INTO users (email, password_hash, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, name`,
            [
                'sarah.connor@onboard.dev',
                defaultPasswordHash,
                'Sarah Connor',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
            ]
        );
        const sarah = user2Res.rows[0];

        const user3Res = await pool.query(
            `INSERT INTO users (email, password_hash, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, name`,
            [
                'marcus.vance@onboard.dev',
                defaultPasswordHash,
                'Marcus Vance',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
            ]
        );
        const marcus = user3Res.rows[0];

        // Also create a demo@example.com account for quick access
        const demoUserRes = await pool.query(
            `INSERT INTO users (email, password_hash, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, name`,
            [
                'demo@example.com',
                defaultPasswordHash,
                'Demo Lead',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
            ]
        );
        const demoLead = demoUserRes.rows[0];

        // 3. Create Workspaces
        console.log('🏢 Creating demo workspaces...');
        const ws1Res = await pool.query(
            `INSERT INTO workspaces (name, slug, description)
             VALUES ($1, $2, $3)
             RETURNING id, name, slug`,
            ['Acme Engineering', 'acme-eng', 'Core engineering organization for Acme platform']
        );
        const acmeWs = ws1Res.rows[0];

        const ws2Res = await pool.query(
            `INSERT INTO workspaces (name, slug, description)
             VALUES ($1, $2, $3)
             RETURNING id, name, slug`,
            ['NextGen Mobile Lab', 'nextgen-mobile', 'R&D initiative for high-performance mobile clients']
        );
        const mobileWs = ws2Res.rows[0];

        // 4. Assign Workspace Memberships
        console.log('👥 Assigning workspace roles & memberships...');
        await pool.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
             VALUES 
                ($1, $2, 'ADMIN'),
                ($1, $3, 'ADMIN'),
                ($1, $4, 'MEMBER'),
                ($1, $5, 'MEMBER')`,
            [acmeWs.id, alex.id, demoLead.id, sarah.id, marcus.id]
        );

        await pool.query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
             VALUES 
                ($1, $2, 'ADMIN'),
                ($1, $3, 'ADMIN'),
                ($1, $4, 'MEMBER')`,
            [mobileWs.id, alex.id, demoLead.id, marcus.id]
        );

        // 5. Create Projects
        console.log('📁 Creating projects...');
        const proj1Res = await pool.query(
            `INSERT INTO projects (workspace_id, key, name, description)
             VALUES ($1, $2, $3, $4)
             RETURNING id, key, name`,
            [acmeWs.id, 'CORE', 'onBoard Web Platform', 'Core API engine, real-time board state, and backend services']
        );
        const coreProj = proj1Res.rows[0];

        const proj2Res = await pool.query(
            `INSERT INTO projects (workspace_id, key, name, description)
             VALUES ($1, $2, $3, $4)
             RETURNING id, key, name`,
            [acmeWs.id, 'UI', 'Design System & Tailwind v4', 'Shared UI components, dark-mode tokens, and accessibility']
        );
        const uiProj = proj2Res.rows[0];

        const proj3Res = await pool.query(
            `INSERT INTO projects (workspace_id, key, name, description)
             VALUES ($1, $2, $3, $4)
             RETURNING id, key, name`,
            [mobileWs.id, 'MOB', 'iOS & Android Native App', 'React Native cross-platform application with offline sync']
        );
        const mobProj = proj3Res.rows[0];

        // 6. Create Realistic Kanban Issues
        console.log('📋 Creating realistic Kanban issues...');
        const now = new Date();
        const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

        const issuesData = [
            // --- CORE Platform Issues ---
            {
                projectId: coreProj.id,
                title: 'Implement database connection pooling & query telemetry',
                description: 'Wrap pg.Pool with structured duration logging in development and optimize pool max size for production spikes.',
                status: 'DONE',
                priority: 'HIGH',
                orderIndex: 0,
                dueDate: inDays(-4),
                assigneeId: sarah.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Set up HttpOnly JWT session cookies & CORS security',
                description: 'Enforce SameSite=Lax and credentials: true across frontend and backend for CSRF resilience.',
                status: 'DONE',
                priority: 'URGENT',
                orderIndex: 1,
                dueDate: inDays(-2),
                assigneeId: alex.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Optimize issue search query builder with ILIKE indexes',
                description: 'Add composite indexes on (project_id, status) and support case-insensitive title search without SQL injection.',
                status: 'IN_PROGRESS',
                priority: 'URGENT',
                orderIndex: 0,
                dueDate: inDays(1),
                assigneeId: alex.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Implement WebSocket / SSE live board event sync',
                description: 'Broadcast card moves and status transitions to all active workspace viewers in real-time.',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                orderIndex: 1,
                dueDate: inDays(3),
                assigneeId: sarah.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Add Redis cache layer for workspace summaries & metrics',
                description: 'Cache aggregate statistics (total open issues, sprint velocity) with a 60-second TTL.',
                status: 'TODO',
                priority: 'HIGH',
                orderIndex: 0,
                dueDate: inDays(5),
                assigneeId: sarah.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Configure Prometheus metrics endpoint & Grafana dashboard',
                description: 'Track request latency percentiles (p50, p95, p99), active connections, and error rates.',
                status: 'TODO',
                priority: 'MEDIUM',
                orderIndex: 1,
                dueDate: inDays(7),
                assigneeId: marcus.id,
                reporterId: sarah.id,
            },
            {
                projectId: coreProj.id,
                title: 'Multi-region PostgreSQL read replica replication',
                description: 'Evaluate AWS RDS read replicas for EU/APAC edge latency reduction.',
                status: 'BACKLOG',
                priority: 'LOW',
                orderIndex: 0,
                dueDate: inDays(14),
                assigneeId: sarah.id,
                reporterId: alex.id,
            },
            {
                projectId: coreProj.id,
                title: 'Integrate GitHub & GitLab webhook issue automation',
                description: 'Automatically transition issue status to DONE when pull requests reference issue keys (e.g., Closes CORE-12).',
                status: 'BACKLOG',
                priority: 'MEDIUM',
                orderIndex: 1,
                dueDate: inDays(21),
                assigneeId: marcus.id,
                reporterId: alex.id,
            },

            // --- UI Design System Issues ---
            {
                projectId: uiProj.id,
                title: 'Set up Tailwind CSS v4 design tokens and color scheme',
                description: 'Establish zinc neutral baseline, violet primary accent, and consistent dark-mode glassmorphic borders.',
                status: 'DONE',
                priority: 'HIGH',
                orderIndex: 0,
                dueDate: inDays(-3),
                assigneeId: marcus.id,
                reporterId: alex.id,
            },
            {
                projectId: uiProj.id,
                title: 'Refactor modal dialogs with focus trapping and ESC support',
                description: 'Ensure smooth fade/scale animations, background blur backdrop, and accessible keyboard navigation.',
                status: 'IN_PROGRESS',
                priority: 'MEDIUM',
                orderIndex: 0,
                dueDate: inDays(2),
                assigneeId: marcus.id,
                reporterId: alex.id,
            },
            {
                projectId: uiProj.id,
                title: 'Standardize WCAG 2.1 AA color contrast for status badges',
                description: 'Audit priority pills (URGENT red, HIGH amber, MEDIUM blue, LOW zinc) against dark backgrounds.',
                status: 'TODO',
                priority: 'HIGH',
                orderIndex: 0,
                dueDate: inDays(4),
                assigneeId: marcus.id,
                reporterId: alex.id,
            },
            {
                projectId: uiProj.id,
                title: 'Build accessible custom date & time picker component',
                description: 'Support keyboard arrow date navigation and quick presets (+1 day, +1 week, +1 month).',
                status: 'BACKLOG',
                priority: 'LOW',
                orderIndex: 0,
                dueDate: inDays(10),
                assigneeId: marcus.id,
                reporterId: marcus.id,
            },

            // --- Mobile App Issues ---
            {
                projectId: mobProj.id,
                title: 'Implement biometric authentication (FaceID / TouchID)',
                description: 'Store refresh tokens securely in iOS Keychain and Android Keystore.',
                status: 'IN_PROGRESS',
                priority: 'URGENT',
                orderIndex: 0,
                dueDate: inDays(3),
                assigneeId: marcus.id,
                reporterId: alex.id,
            },
            {
                projectId: mobProj.id,
                title: 'Build SQLite local cache for offline Kanban boards',
                description: 'Allow viewing and drafting issues offline with optimistic queue syncing on reconnection.',
                status: 'TODO',
                priority: 'HIGH',
                orderIndex: 0,
                dueDate: inDays(8),
                assigneeId: marcus.id,
                reporterId: alex.id,
            }
        ];

        for (const item of issuesData) {
            await pool.query(
                `INSERT INTO issues (project_id, title, description, status, priority, order_index, due_date, assignee_id, reporter_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    item.projectId,
                    item.title,
                    item.description,
                    item.status,
                    item.priority,
                    item.orderIndex,
                    item.dueDate,
                    item.assigneeId,
                    item.reporterId,
                ]
            );
        }

        console.log('✅ Seed completed successfully!');
        console.log('----------------------------------------------------');
        console.log('🔑 DEMO LOGIN CREDENTIALS:');
        console.log('   Email:    alex.chen@onboard.dev  (or demo@example.com)');
        console.log('   Password: password123');
        console.log('----------------------------------------------------');
    } catch (error) {
        console.error('❌ Error while seeding database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

seed();
