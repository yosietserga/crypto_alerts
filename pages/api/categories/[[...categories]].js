import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Category" });
const resourceName = "categories"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
