import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Setting" });
const resourceName = "settings"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
