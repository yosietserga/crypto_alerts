import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

//validate JWT and session

export default NextCrud({
  resourceName: "users", // Same as your folder name
  adapter: new PrismaAdapter({
    modelName: "user", // Prisma model name, must match the one generated in your prisma client
  }),
});