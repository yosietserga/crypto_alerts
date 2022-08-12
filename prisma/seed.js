const CryptoJS = require("crypto-js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const iv = CryptoJS.enc.Utf8.parse("1514838699281281");
const secret = "b7352d2424bb2072655a519547f5a9df";

function encrypt(s, parse = false) {
  s = parse ? JSON.stringify(s) : s;
  const h = CryptoJS.AES.encrypt(s, secret, { iv });
  return h.toString();
}

async function main() {
  const store = await prisma.store.upsert({
    where: { folder: "default" },
    create: {
      name: "default",
      folder: "default",
    },
    update: {},
  });
  const language = await prisma.language.upsert({
    where: { code: "es" },
    create: {
      name: "es",
      code: "es",
    },
    update: {},
  });
  const profileType = await prisma.profileType.upsert({
    where: { slug: "user" },
    create: {
      storeId: store.id,
      name: "user",
      slug: "user",
    },
    update: {},
  });
  const profileGroup = await prisma.profileGroup.create({
    data: {
      profileTypeId: profileType.id,
      storeId: store.id,
      name: "user",
    },
  });
  const person = await prisma.person.upsert({
    where: { email: "admin@admin.com" },
    create: {
      storeId: store.id,
      email: "admin@admin.com",
      phone: "0123456789",
      username: "admin",
      password: encrypt("12345678"),
    },
    update: {},
  });
  const profile = await prisma.profile.create({
    data: {
      profileTypeId: profileType.id,
      personId: person.id,
      storeId: store.id,
      name: "admin",
    },
  });
  await prisma.profileToGroup.create({
    data: {
      profileGroupId: profileGroup.id,
      profileId: profile.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
