import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "ProfileGroup" });
const resourceName = "profilegroups"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
