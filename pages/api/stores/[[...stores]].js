import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Store" });
const resourceName = "stores"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
