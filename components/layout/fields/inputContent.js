
import { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/store";
import { isset, empty, ucfirst } from "../../../utils/common";
import {
  getContents,
  setTitle,
  setSeoTitle,
  setDescription,
  setSeoDescription,
  setSlug,
} from "../../../libs/services/contents";
import { FormGroup, Label, Input } from "reactstrap";

let i=null;

const fn = {
  setTitle,
  setSeoTitle,
  setDescription,
  setSeoDescription,
  setSlug,
};

export default function InputContent(props) {
  const {
    handler,
    value,
    fieldName,
    label,
    placeholder,
    disabled,
    form,
    languageId,
    objectId,
    objectType,
  } = props;

  const [__value, setValue] = useState(value??"");
  const [__id, setID] = useState();
  const [w, setW] = useState(null);

  const store = useContext(StoreContext);

  const __fetch = useCallback(() => {
    const res = getContents({
      languageId,
      objectId,
      objectType,
    });

    Promise.all([res]).then((content) => {
      if (Array.isArray(content)) {
        setValue(content[0][fieldName]??"");
        setID(content[0].id);
      } else {
        setValue(content[fieldName] ?? "");
        setID(content.id);
      }
    });
  }, [setValue, setID, objectId, objectType, languageId, fieldName]);

  useEffect(() => {
    __fetch();
    setW(isset(window));
  }, [__fetch, fieldName]);
    
  if (typeof handler !== "function") return null;
  if (typeof fieldName !== "string") return null;
  if (typeof label !== "string") return null;
  if (typeof languageId !== "number") return null;
  if (typeof objectId !== "number") return null;
  if (typeof objectType !== "string") return null;
  if (empty(languageId)) return null;
  if (empty(objectId)) return null;

  let CKEditor;
  let ClassicEditor;
  if (isset(window) && ["description"].includes(fieldName)) {
    CKEditor = require("@ckeditor/ckeditor5-react");
    ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
  }

  const handleField = (e) => {
      const v = e.target.value;
      updateField(v);
  };

  const updateField = (v) => {
      handler(v, fieldName);
      setValue(v);
      store.emit("field:update:" + `${form ?? "form"}` + ":" + fieldName, v);
      if (i) {
        clearTimeout(i);
        i = null;
      }
      i = setTimeout(() => {
        save(v);
      }, 1000);
  };

  const save = async (v) => {
    const formData = {};

    formData.languageId = parseInt(languageId);
    formData.objectId = parseInt(objectId);
    formData.objectType = objectType;
    formData[fieldName] = v;

    let result=null;
    if (
      isset(fn[`set${ucfirst(fieldName)}`]) &&
      typeof fn[`set${ucfirst(fieldName)}`] === "function"
    ) {
      result = await fn[`set${ucfirst(fieldName)}`](__id, formData);
    } else {
      //TODO: thrown error
    }
    
    store.emit(
      "field:saved:" + `${form ?? "form"}` + ":" + fieldName,
      result
    );
  };

  return (
    <FormGroup>
      <Label for={fieldName}>{label}</Label>
      {["title", "slug", "seoTitle"].includes(fieldName) && (
        <Input
          type="text"
          name={fieldName}
          id={fieldName + "_" + __id}
          languageid={`${languageId}`}
          objectid={`${objectId}`}
          objecttype={`${objectType}`}
          value={`${__value}`}
          onChange={handleField}
          placeholder={placeholder ?? ""}
          disabled={disabled ?? ""}
        />
      )}
      {["seoDescription"].includes(fieldName) && (
        <Input
          type="textarea"
          name={fieldName}
          id={fieldName + "_" + __id}
          languageid={`${languageId}`}
          objectid={`${objectId}`}
          objecttype={`${objectType}`}
          value={`${__value}`}
          onChange={handleField}
          placeholder={placeholder ?? ""}
          disabled={disabled ?? ""}
        />
      )}
      {w && CKEditor ? (
        <CKEditor
          editor={ClassicEditor}
          data={`${__value}`}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            updateField(data);
            console.log({ event, editor, data });
          }}
          onBlur={(event, editor) => {
            console.log("Blur.", editor);
          }}
          onFocus={(event, editor) => {
            console.log("Focus.", editor);
          }}
        />
      ) : (
        ""
      )}
    </FormGroup>
  );
}
