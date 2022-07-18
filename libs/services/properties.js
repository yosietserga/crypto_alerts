import { isset, empty } from "../../utils/common";

export const getProperties = async (data) => {
  
  const formData = {};

  if (!empty(data?.objectId)) formData.objectId = parseInt(data.objectId);
  if (!empty(data?.objectType)) formData.objectType = data.objectType;
  if (!empty(data?.group)) formData.group = data.group;
  if (!empty(data?.key)) formData.key = data.key;

  //get properties
  const res = await fetch("/api/properties?where="+ JSON.stringify(formData));
  const json = await res.json();

  if (json.length === 1) {
    let v = JSON.parse(json[0].value);
    json[0].value = v;
    return json[0];
  } else {
    return json.map((p) => {
      let v = JSON.parse(p.value);
      p.value = v;
      return p;
    });
  }
};

export const setProperty = async (id, data) => {
  try {

    if (typeof data.objectId !== "number") return null;
    if (typeof data.objectType !== "string") return null;
    if (typeof data.group !== "string") return null;
    if (typeof data.key !== "string") return null;

    const formData = {};

    formData.objectId = parseInt(data.objectId);
    formData.objectType = data.objectType;
    formData.group = data.group;
    formData.key = data.key;
    formData.dataType = data.dataType ?? "string";
    formData.value = JSON.stringify(data.value) ?? "";

    if (isset(id) && !empty(id)) {
      //UPDATE property
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return await res.json();
    } else {
      //CREATE property
      const res = await fetch(`/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return await res.json();
    }
  } catch(err) {
    console.log("Error on saving property:"+ err);
  }
};
