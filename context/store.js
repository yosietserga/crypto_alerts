import * as React from "react";
import Freezer from "freezer-js";

const store = new Freezer({});

const StoreContext = React.createContext(store);

const StoreProvider = ({ children }) => {
  /*
  store.on("beforeAll", (eventName, state)=>{
    console.log("Store::beforeAll", eventName, state);
  });
  
  store.on("afterAll", (eventName, state)=>{
    console.log("Store::afterAll", eventName, state);
  });
  */

  store.set("init", true);
  
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export { StoreContext, StoreProvider, store };