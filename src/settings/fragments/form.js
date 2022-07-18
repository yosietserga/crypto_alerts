import { ucfirst, isset, getVar } from "../../../utils/common";
import { Form } from "reactstrap";
import FieldAppname from "../fields/appname";

const APPNAME = "appname";

const actions = {
  create: {
    children: function UIForm(props) {
      const handler = (value, key) => {
        if (
          isset(props[`set${ucfirst(key)}`]) &&
          typeof props[`set${ucfirst(key)}`] === "function"
        ) {
          props[`set${ucfirst(key)}`](value);
        } else {
          //TODO: thrown error
        }
      };

      return (
        <Form>
          <h2>{props.title}</h2>
          <hr />
          <FieldAppname
            value={props[APPNAME]}
            storeId={props?.storeId}
            group="settings"
            __key={`${APPNAME}`}
            handler={handler}
          />
          <hr />
          {props.flag == "error" && (
            <>
              <span className="warning">{props.error}</span>
              <hr />
            </>
          )}
        </Form>
      );
    },
  },
  index: {},
  update: {},
};

actions.index.children = actions.create.children;
actions.update.children = actions.create.children;

actions.getVar = getVar;

export default actions;