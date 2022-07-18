import { isset, empty } from "../../utils/common";

export const getSettings = async (data) => {
  
  const formData = {};

  if (!empty(data?.storeId)) formData.storeId = parseInt(data.storeId);
  if (!empty(data?.group)) formData.group = data.group;
  if (!empty(data?.key)) formData.key = data.key;

  //get settings
  const res = await fetch("/api/settings?where="+ JSON.stringify(formData));
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

export const setSetting = async (id, data) => {
  try {

    if (typeof data.storeId !== "number") return null;
    if (typeof data.group !== "string") return null;
    if (typeof data.key !== "string") return null;

    const formData = {};

    formData.storeId = parseInt(data.storeId);
    formData.group = data.group;
    formData.key = data.key;
    formData.dataType = data.dataType ?? "string";
    formData.value = JSON.stringify(data.value) ?? "";

    if (isset(id) && !empty(id)) {
      //UPDATE setting
      const res = await fetch(`/api/settings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return await res.json();
    } else {
      //CREATE setting
      const res = await fetch(`/api/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      return await res.json();
    }
  } catch(err) {
    console.log("Error on saving setting:"+ err);
  }
};
