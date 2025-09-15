// prisma/seed.js
import bcrypt from "bcryptjs";

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('password', 10);

  // Tenants
  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: { slug: 'acme', name: 'Acme', plan: 'FREE' }
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: { slug: 'globex', name: 'Globex', plan: 'FREE' }
  });

  // Env fallbacks in case .env isn’t set
  const ADMIN_ACME   = process.env.SEED_ADMIN_ACME  || 'admin@acme.test';
  const USER_ACME    = process.env.SEED_USER_ACME   || 'user@acme.test';
  const ADMIN_GLOBEX = process.env.SEED_ADMIN_GLOBEX|| 'admin@globex.test';
  const USER_GLOBEX  = process.env.SEED_USER_GLOBEX || 'user@globex.test';

  // Users (all password: "password")
  await prisma.user.upsert({
    where: { email: ADMIN_ACME },
    update: {},
    create: { email: ADMIN_ACME, password: pass, role: 'ADMIN',  tenantId: acme.id }
  });
  await prisma.user.upsert({
    where: { email: USER_ACME },
    update: {},
    create: { email: USER_ACME,  password: pass, role: 'MEMBER', tenantId: acme.id }
  });
  await prisma.user.upsert({
    where: { email: ADMIN_GLOBEX },
    update: {},
    create: { email: ADMIN_GLOBEX, password: pass, role: 'ADMIN',  tenantId: globex.id }
  });
  await prisma.user.upsert({
    where: { email: USER_GLOBEX },
    update: {},
    create: { email: USER_GLOBEX,  password: pass, role: 'MEMBER', tenantId: globex.id }
  });

  console.log('✅ Seeded tenants and users.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
