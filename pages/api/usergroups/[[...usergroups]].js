import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "ProfileType" });
const resourceName = "profiletypes"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
