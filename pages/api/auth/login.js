import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { log, encrypt, decrypt } from "../../../utils/common";

const prisma = new PrismaClient();
let errorMessage = "";
const login = async (email, password) => {
  try {
    //email incorrect
    if (!email || !email.includes("@") || !password) {
      errorMessage = "Invalid User";
      console.log(errorMessage);
      return false;
    }

    //find person into db
    log("/api/auth/login: getting person from db email:" + email);
    let person = await prisma.person.findUnique({
      where: {
        email,
      },
    });

    log("db result:", { person });
    //person not found
    if (!person) {
      errorMessage = "User not found";
      console.log(errorMessage);
      return false;
    }

    // password incorrect
    if (
      typeof person.password == "undefined" ||
      decrypt(password) != decrypt(person.password)
    ) {
      errorMessage = "User or Password invalid";
      console.log(errorMessage);
      return false;
    }
    
    let profileType = await prisma.profileType.findUnique({
      where: {
        slug: "user",
      },
    });

    if (!profileType || !profileType?.id) {
      errorMessage = "User profile does not exist";
      console.log(errorMessage);
      return false;
    }

    let profile = await prisma.profile.findFirst({
      where: {
        personId: person.id,
        profileTypeId: profileType.id, //TODO:load default user type from settings
      },
    });

    if (!profile || !profile?.id) {
      errorMessage = "User has no profile";
      console.log(errorMessage);
      return false;
    }

    person.profile = profile;
    

    //customize specific data to encrypt y pass as access token
    const accessToken = encrypt(JSON.stringify(person));
    const response = { ...person, accessToken };
    return response;
  } catch (err) {
    console.log(err);
  }
};

export default async function handler(req, res) {
  try {
    //get params vars
    const { email, password } = req.body;
    const payload = await login(email, password);

    log({ payload });
    if (!payload) {
      res.status(500).json({ error: errorMessage });
    } else if (!payload?.accessToken) {
      res.status(500).json({ error: errorMessage });
    } else {
      //const expires = new Date().toISOString();
      let d = {
        personId: payload.id,
        sessionToken: payload.accessToken,
        storeId:1, //TODO:get storeId from env or db
        //expires
      };

      prisma.session.create({ data: d }).then(log);

      res.status(200).json({
        result: "OK",
        payload,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
}