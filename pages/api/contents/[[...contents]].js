import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Content" });
const resourceName = "contents"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
