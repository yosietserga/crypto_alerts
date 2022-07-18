import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";

const adapter = new PrismaAdapter({ modelName: "Person" });
const resourceName = "persons"; // Same as your folder name

export default NextCrud({
  resourceName,
  adapter,
});
