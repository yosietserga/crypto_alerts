import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Profile" });
const resourceName = "profiles"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
