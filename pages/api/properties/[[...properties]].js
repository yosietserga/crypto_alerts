import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Property" });
const resourceName = "properties"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
