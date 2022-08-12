import {
  ucfirst,
  isset,
  empty,
  getVar,
  nonceGenerator,
} from "../../../utils/common";
import {
  getProperties,
  setProperty,
  deleteProperty,
} from "../../../libs/services/properties";

export function listen(store) {
  store.on("post:delete", post => {
    console.log("Post of type "+ post.post_type +" deleted: #"+ post.id, post);
    //TODO:get all properties and delete all 
    const fData = {};
    
    fData.objectId = parseInt(post.id);
    fData.objectType = post.post_type;

    deleteProperty(null, fData);
  });
}

const d = {
  listen,
};
export default d;