import {
  log,
  encrypt,
  decrypt,
  getCookie,
  setCookie,
  COOKIE_PATH,
} from "../../../utils/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const ch = req.cookies[COOKIE_PATH] ?? null;

  if (!ch) {
    //person not found by uuid
    res.status(401).json({ error: "Session var not found" });
    return;
  }

  let accessToken = getCookie("accessToken", ch);
  let uuid = getCookie("uuid", ch);
  if (!accessToken || !uuid) {
    //person not found by uuid
    res.status(401).json({ error: "User session vars not found" });
    return;
  }

  /**
   * check if person are valid
   * check if has user profile
   * check if has user group and permissions
   */

  let person = await prisma.person.findUnique({
    where: {
      uuid,
    },
  });

  /**
   * //TODO: check if has user admin profile
   * //TODO: check and load permissions profile
   */
  if (!person || !person.email) {
    //person not found by uuid
    res.status(404).json({ error: "Person not found" });
    return;
  }

  let session = await prisma.session.findUnique({
    where: {
      sessionToken: accessToken,
    },
  });

  if (!session || session?.personId != person?.id) {
    //session not found by accesstoken and personId
    res.status(401).json({ error: "User session invalid" });
    return;
  }

  let profileType = await prisma.profileType.findUnique({
    where: {
      slug: "user",
    },
  });

  if (!profileType || !profileType?.id) {
    //session not found by accesstoken and personId
    res.status(401).json({ error: "User session invalid" });
    return;
  }

  let profile = await prisma.profile.findFirst({
    where: {
      personId: person.id,
      profileTypeId: profileType.id, //TODO:load default user type from settings
    },
  });

  if (!profile || !profile?.id) {
    //session not found by accesstoken and personId
    res.status(401).json({ error: "User session invalid" });
    return;
  }

  //TODO: time expires session controls
  try {
    res.status(200).json({
      person: {
        email: person.email,
        name: person.name,
        id: person.id,
        profile,
        accessToken,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
  res.end();
}
