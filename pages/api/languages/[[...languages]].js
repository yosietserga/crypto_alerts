import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Language" });
const resourceName = "languages"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
