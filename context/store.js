import * as React from "react";
import storage from "node-persist";
import Freezer from "freezer-js";
import { encrypt, decrypt } from "../utils/common";

//TODO:import common utils ucfirst 
String.prototype.ucfirst = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const store = new Freezer({});

if (typeof fs !== "undefined") {
  storage.init({
    dir: "../tmp",
  });
}

const __get = (k) => {
  if (typeof fs !== "undefined") {
    return false;
  }

  return JSON.parse(decrypt(storage.getItem(k)));
};

const __set = (k, v) => {
  if (typeof fs !== "undefined") {
    return false;
  }

  storage.setItem(k, encrypt(JSON.stringify(v)));
};

const __delete = (k) => {
  if (typeof fs !== "undefined") {
    return false;
  }

  storage.removeItem(k);
};

const StoreContext = React.createContext(store);

const StoreProvider = ({ children }) => {
  store.on("beforeAll", (eventName, state)=>{
    console.log("Store::beforeAll", eventName, state);
  });
  
  store.on("afterAll", (eventName, state)=>{
    console.log("Store::afterAll", eventName, state);
  });

  store.set("init", true);
  
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider, store };