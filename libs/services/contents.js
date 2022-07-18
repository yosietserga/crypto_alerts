import { isset, empty } from "../../utils/common";

export const getContents = async (data) => {
  const formData = {};

  if (!empty(data?.languageId)) formData.languageId = parseInt(data.languageId);
  if (!empty(data?.objectId)) formData.objectId = parseInt(data.objectId);
  if (!empty(data?.objectType)) formData.objectType = data.objectType;

  //get contents
  const res = await fetch("/api/contents?where=" + JSON.stringify(formData));
  const json = await res.json();

  if (json.length === 1) {
    let description = JSON.parse(json[0].description);
    json[0].description = description;
    return json[0];
  } else {
    return json.map((p) => {
      let description = JSON.parse(p.description);
      p.description = description;
      return p;
    });
  }
};

const __partialContent = async (id, data, fieldName) => {
  try {
    if (typeof data.languageId !== "number") return null;
    if (typeof data.objectId !== "number") return null;
    if (typeof data.objectType !== "string") return null;
    if (typeof fieldName !== "string") return null;

    const formData = {};

    formData.languageId = parseInt(data.languageId);
    formData.objectId = parseInt(data.objectId);
    formData.objectType = data.objectType;
    if (fieldName === "description") {
      formData[fieldName] = JSON.stringify(data[fieldName] ?? "");
    } else {
      formData[fieldName] = data[fieldName] ?? "";
    }

    if (isset(id) && !empty(id)) {
      //UPDATE property
      const res = await fetch(`/api/contents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: formData[fieldName],
        }),
      });
      return await res.json();
    } else {
      //CREATE property
      const res = await fetch(`/api/contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return await res.json();
    }
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};

export const setTitle = async (id, data) => {
  try {
    //TODO: utf8 clean and some string treatment
    return await __partialContent(id, data, "title");
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};

export const setDescription = async (id, data) => {
  try {
    //TODO: utf8 clean and some string treatment
    return await __partialContent(id, data, "description");
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};

export const setSlug = async (id, data) => {
  try {
    //TODO: utf8 clean and some string treatment
    return await __partialContent(id, data, "slug");
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};

export const setSeoTitle = async (id, data) => {
  try {
    //TODO: utf8 clean and some string treatment
    return await __partialContent(id, data, "seoTitle");
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};

export const setSeoDescription = async (id, data) => {
  try {
    //TODO: utf8 clean and some string treatment
    return await __partialContent(id, data, "seoDescription");
  } catch (err) {
    console.log("Error on saving property:" + err);
  }
};
