import {
  ucfirst,
  isset,
  empty,
  getVar,
  nonceGenerator,
} from "../../../utils/common";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getProperties, setProperty, deleteProperty } from "../../../libs/services/properties";
import CheckIcon from "../../../components/ui/icons/check";
import LoadingIcon from "../../../components/ui/icons/loading";
import InputSelect from "../../../components/layout/fields/inputSelect";
import InputText from "../../../components/layout/fields/inputText";
import { Row, Col, Form, Button } from "reactstrap";

import FieldStatus from "../../posts/fields/status";
import FieldRef from "../../posts/fields/ref";
import FieldStore from "../../posts/fields/storeId";
import FieldSymbol from "../fields/symbol";

const POST_TYPE = "cryptoalert";
const OBJECT_TYPE = "cryptoalert";
const GROUP = "data";
const timeframes = ["1m","5m", "15m", "30m", "1h", "4h", "1d", "1w"];
let i = null;

const memo = [];

const CriteriaRow = (props) => {
  const { indicators, k, deleteHandler, data, symbol } = props;
  const [criteria, setCriteria] = useState({
    tempo: data?.value?.tempo ?? "",
    type: data?.value?.type ?? "",
    group: data?.value?.group ?? "",
    comparator: data?.value?.comparator ?? "",
    indicator: data?.value?.indicator ?? "",
    option: data?.value?.option ?? "",
    trigger: data?.value?.trigger ?? "",
    symbol: data?.value?.symbol ?? symbol ?? "",
  });
  const [showPriceForm, setPriceFormVisible] = useState(false);
  const [showIndicatorForm, setIndicatorFormVisible] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState();
  const [propertyId, setID] = useState(data?.id??null);
  const [status, setStatus] = useState("UNSAVED");

  useEffect(() => {
    if (!empty(data?.value)) {
      setCriteria(data?.value);
      setID(data?.id);
      setStatus("SAVED!");
      setSelectedIndicator(indicators[data?.value?.indicator]);
      handler(data?.value?.type, "type");
    }
  }, [setCriteria, data, setSelectedIndicator, indicators]);

  /******* HANDLERS *********/
  const handler = (value, key) => {
    const c = { ...criteria, ...{ [key]: value } };
    setCriteria(c);

    if (key === "indicator") {
      setSelectedIndicator(indicators[value]);
      c["option"] = "";
      c["group"] = "";
      c["trigger"] = "";
    }

    if (key === "type" && value === "price") {
      //show price ui logic
      setPriceFormVisible(true);
      setIndicatorFormVisible(false);
    }

    if (key === "type" && value === "indicator") {
      //show indicator ui logic
      setPriceFormVisible(false);
      setIndicatorFormVisible(true);
    }

    if (i) {
      clearTimeout(i);
      i = null;
    }
    i = setTimeout(() => {
      saveCriteria(c);
    }, 1000);
  };

  const saveCriteria = (c) => {
    //TODO: emit store events when validation fails and why 
    if (
      empty(c.tempo) ||
      empty(c.type) ||
      empty(c.trigger) ||
      empty(c.symbol)
    ) {
      return false;
    }

    if (c.type === "indicator" && (empty(c.indicator) || empty(c.option))) {
      return false;
    }

    if (
      c.type === "indicator" &&
      c.group === "outputs" &&
      empty(c.comparator)
    ) {
      return false;
    }

    setStatus("SAVING...");

    setProperty(propertyId, {
      objectId: props?.id,
      objectType: OBJECT_TYPE,
      group: `criteria:${c.symbol}:${c.tempo}`.toUpperCase(),
      key: JSON.stringify(c),
      value: c,
    }).then((resp) => {
      if (isset(resp?.id)) {
        setID(resp.id);
        setStatus("SAVED!");
      } else {
        setStatus("An error has ocurred while saving!");
      }
    });
  };

  const removeCriteria = (__k, __id) => {
    setStatus("DELETING...");
    if (__id) {
      deleteProperty(__id).then(() => {
        deleteHandler(__k);
      });
    } else {
      deleteHandler(__k);
    }
  };

  /***** CONSTANTS *****/
  const alertTypes = [
    {
      label: "Precio",
      key: "price",
      value: "price",
    },
    {
      label: "Indicador",
      key: "indicator",
      value: "indicator",
    },
  ];

  /**** COMPONENTS *****/
  const comparatorInput = (
    <InputSelect
      handler={handler}
      value={criteria.comparator}
      options={[
        {
          label: "Igual A",
          key: "equal",
          value: "equal",
        },
        {
          label: "Mayor o igual que",
          key: "gte",
          value: "gte",
        },
        {
          label: "Menor o igual que",
          key: "lte",
          value: "lte",
        },
      ]}
      form={OBJECT_TYPE}
      label=""
      fieldName="comparator"
    />
  );

  /**** STYLES *****/
  const bgBorderColor =
    status.includes("DELET")
      ? "#900" //deleting
      : status === "SAVED!"
      ? "#5bbb15" //saved
      : status.includes("SAVING")
      ? "#ffe200" //saving
      : "#bb7815"; //unsaved

  const bgColor = status.includes("DELET")
    ? "#900" //deleting
    : status.includes("SAVING")
    ? "#5bbb15" //saving
    : "var(--background2)"; //unsaved

  const rowStyle = {
    overflow:"hidden",
    marginBottom:"2px",
    padding: "20px 10px 10px",
    borderLeft: `solid 4px ${bgBorderColor}`,
    backgroundColor: `${bgColor}`,
  };

  return (
    <Row style={rowStyle}>
      <Col sm={10}>
        <Col sm={12}>
          <strong>hash: {k}</strong>
          <InputSelect
            handler={handler}
            value={criteria.tempo}
            options={timeframes.map((t) => {
              return {
                label: t,
                key: `${t}`,
                value: t,
              };
            })}
            form={OBJECT_TYPE}
            label=""
            fieldName="tempo"
          />
        </Col>
        <Col sm={12}>
          <InputSelect
            handler={handler}
            value={criteria.type}
            options={alertTypes}
            form={OBJECT_TYPE}
            label=""
            fieldName="type"
          />
        </Col>

        {showPriceForm && (
          <>
            <Col sm={12}>{comparatorInput}</Col>
            <Col sm={12}>
              <InputText
                handler={handler}
                value={criteria.trigger}
                form={OBJECT_TYPE}
                label=""
                fieldName="trigger"
                placeholder="Value of Trigger"
              />
            </Col>
          </>
        )}

        {showIndicatorForm && (
          <Col sm={12}>
            <InputSelect
              handler={handler}
              value={criteria.indicator}
              options={
                !empty(indicators)
                  ? Object.values(indicators).map((item) => {
                      return {
                        label:
                          item.full_name +
                          " ( " +
                          item.name.toUpperCase() +
                          " )",
                        key: item.name,
                        value: item.name,
                      };
                    })
                  : []
              }
              form={OBJECT_TYPE}
              label=""
              fieldName="indicator"
            />
          </Col>
        )}
        {selectedIndicator && (
          <>
            <Col sm={12}>
              <InputSelect
                handler={handler}
                value={criteria.group}
                options={[
                  {
                    label: "INPUTS",
                    key: "inputs",
                    value: "inputs",
                  },
                  {
                    label: "OPTIONS",
                    key: "options",
                    value: "options",
                  },
                  {
                    label: "OUTPUTS",
                    key: "outputs",
                    value: "outputs",
                  },
                ]}
                form={OBJECT_TYPE}
                label=""
                fieldName="group"
              />
            </Col>

            {criteria.group === "inputs" && (
              <Col sm={12}>
                <InputSelect
                  handler={handler}
                  value={criteria.option}
                  options={selectedIndicator?.input_names?.map((item) => {
                    const cleaned = `${item}`.replace(/[^A-Za-z\d\s]/gi, "");
                    return {
                      label: ucfirst(item.replace("_", " ")),
                      key: `${cleaned}`,
                      value: `${cleaned}`,
                    };
                  })}
                  form={OBJECT_TYPE}
                  label=""
                  fieldName="option"
                />
              </Col>
            )}

            {criteria.group === "options" && (
              <Col sm={12}>
                <InputSelect
                  handler={handler}
                  value={criteria.option}
                  options={selectedIndicator?.option_names?.map((item) => {
                    const cleaned = `${item}`.replace(/[^A-Za-z\d\s]/gi, "");
                    return {
                      label: ucfirst(item.replace("_", " ")),
                      key: `${cleaned}`,
                      value: `${cleaned}`,
                    };
                  })}
                  form={OBJECT_TYPE}
                  label=""
                  fieldName="option"
                />
              </Col>
            )}

            {criteria.group === "outputs" && (
              <Col sm={12}>
                <InputSelect
                  handler={handler}
                  value={criteria.option}
                  options={selectedIndicator?.output_names?.map((item) => {
                    const cleaned = `${item}`.replace(/[^A-Za-z\d\s]/gi, "");
                    return {
                      label: ucfirst(item.replace("_", " ")),
                      key: `${cleaned}`,
                      value: `${cleaned}`,
                    };
                  })}
                  form={OBJECT_TYPE}
                  label=""
                  fieldName="option"
                />
              </Col>
            )}

            {criteria.group === "outputs" && !empty(criteria.option) && (
              <>{comparatorInput}</>
            )}

            {!empty(criteria.option) && (
              <>
                <Col sm={12}>
                  <InputText
                    handler={handler}
                    value={criteria.trigger}
                    form={OBJECT_TYPE}
                    label=""
                    fieldName="trigger"
                    placeholder="Value of Trigger"
                  />
                </Col>
              </>
            )}
          </>
        )}
      </Col>
      <Col sm={2}>
        <Row>
          <Col sm={12}>
            <Button
              variant="danger"
              onClick={(e) => {
                removeCriteria(k, data?.value?.id ?? propertyId);
              }}
            >
              DELETE
            </Button>
          </Col>
          <Col sm={12}>{status}</Col>
        </Row>
      </Col>
    </Row>
  );
};

const actions = {
  create: {
    children: function UIForm(props) {
      const [rows, setRows] = useState([]);
      const [savedRows, setSavedRows] = useState([]);
      const [loaded, setLoaded] = useState(false);
      const [symbol, setSymbol] = useState(props.symbol);

      const handler = (value, key) => {
        if (
          isset(props[`set${ucfirst(key)}`]) &&
          typeof props[`set${ucfirst(key)}`] === "function"
        ) {
          props[`set${ucfirst(key)}`](value);
          if (key === "symbol") setSymbol(value);
        } else {
          //TODO: thrown error
        }
      };

      const addCriteriaRow = () => {
        setRows([...rows, ...[nonceGenerator()]]);
      };

      const deleteCriteria = useCallback((k) => {
        console.log(k,rows, savedRows);
        if (!rows.includes(k)) return false;
        setRows(rows.filter((nonce) => nonce !== k));
        setSavedRows(savedRows.filter((item) => item.key !== k));
      }, [setRows, rows, setSavedRows, savedRows]);

      const loadSavedRows = useCallback(async () => {
        if (loaded) return false;
        const properties = await getProperties({
          objectId: props.data.id,
          objectType: OBJECT_TYPE,
        });

        if (Array.isArray(properties)) {
          const rendered = properties
            .filter((item) => {
              return item.group.includes("CRITERIA");
            })
            .map((item) => {
              if (!memo.includes(item.uuid)) {
                memo.push(item.uuid);
                setRows([...rows, ...[item.uuid]]);
                
                return (
                <CriteriaRow
                  key={item.uuid}
                  k={item.uuid}
                  id={props?.data?.id}
                  data={item}
                  symbol={symbol}
                  indicators={props.indicators}
                  deleteHandler={deleteCriteria}
                />);
              } else {
                return "";
              }
            });

          setSavedRows([...savedRows, ...rendered]);
        } else if (properties.group.includes("CRITERIA") && !memo.includes(properties.uuid)) {
          setRows([...rows, ...[properties.uuid]]);
          memo.push(properties.uuid);

          const rendered = (
            <CriteriaRow
              key={properties.uuid}
              k={properties.uuid}
              id={props?.data?.id}
              data={properties}
              symbol={symbol}
              indicators={props.indicators}
              deleteHandler={deleteCriteria}
            />
          );
          setSavedRows([...savedRows, ...[rendered]]);
        }
        setLoaded(true);
      }, [rows, setRows, savedRows, setSavedRows, deleteCriteria, props, setLoaded, loaded, symbol]);

      useEffect(()=>{
        loadSavedRows();
      }, [loadSavedRows]);
      return (
        <Form>
          <h2>{props.title}</h2>
          {props.action == "update" && !!props?.data?.uuid && (
            <>
              <br />
              <small>UUID: {props.data.uuid}</small>
            </>
          )}
          <hr />
          <FieldStore value={props.storeId} handler={handler} />
          <FieldSymbol
            value={symbol}
            objectId={props.data.id}
            objectType={OBJECT_TYPE}
            group="data"
            __key="symbol"
            handler={handler}
          />
          <FieldRef value={props.ref} handler={handler} />
          <FieldStatus value={props.status} handler={handler} />

          <hr />
          <h2>Criterios</h2>
          <Row>
            <Col sm={12}>
              <Button onClick={addCriteriaRow}>Agregar Criterio</Button>
            </Col>
          </Row>
          <br />
          <Row>
            <Col sm={12}>
              {savedRows}
              {rows.map((nonce) => {
                if (!memo.includes(nonce)) {
                  return (
                    <CriteriaRow
                      key={nonce}
                      k={nonce}
                      id={props?.data?.id}
                      symbol={symbol}
                      indicators={props.indicators}
                      deleteHandler={deleteCriteria}
                    />
                  );
                } else {
                  return "";
                }
                })}
            </Col>
          </Row>

          <Row>
            <Col sm={12}>
              {props.flag == "error" && (
                <>
                  <span className="warning">{props.error}</span>
                  <hr />
                </>
              )}
              <Button
                color="primary"
                onClick={(e) => {
                  actions[props.action].onSubmit(e, props);
                }}
              >
                Aceptar
              </Button>{" "}
              <Link href="/panel/alerts" passHref={true}>
                <Button className="btn btn-default">Cancelar</Button>
              </Link>
            </Col>
          </Row>
        </Form>
      );
    },
    onSubmit: async (e, props) => {
      e.preventDefault();

      const { ref, storeId, status, setFlag, router } = props;

      props.setModalContent(<LoadingIcon />);
      props.setModal(true);

      setFlag("none");

      const formData = {};

      if (!empty(ref)) formData.ref = ref;
      if (!empty(storeId)) formData.storeId = parseInt(storeId);
      if (!empty(status)) formData.status = parseInt(status);

      formData.post_type = POST_TYPE;

      //POST form values
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      //workflow success or fail
      if (res.status < 300) {
        //Await for data for any desirable next steps
        const r = await res.json();

        //some data process flow controls
        props.setModalContent(<CheckIcon />);
        setTimeout(() => {
          router.push("/panel/alerts");
          props.setModal(false);
        }, 1200);
      } else {
        setFlag("error");
        props.setModalContent("No se pudo crear, por favor intente de nuevo");
      }
    },
  },
  update: {},
};

actions.update.onSubmit = async (e, props) => {
  e.preventDefault();

  const { ref, storeId, status, setFlag, router } = props;

  props.setModalContent(<LoadingIcon />);
  props.setModal(true);

  setFlag("none");

  const formData = {};

  if (!empty(ref)) formData.ref = ref;
  if (!empty(storeId)) formData.storeId = parseInt(storeId);
  if (!empty(status)) formData.status = parseInt(status);

  formData.post_type = POST_TYPE;

  //POST form values
  const res = await fetch(`/api/posts/${props.data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  //workflow success or fail
  if (res.status < 300) {
    //Await for data for any desirable next steps
    const r = await res.json();

    //some data process flow controls
    props.setModalContent(<CheckIcon />);
    setTimeout(() => {
      router.push("/panel/alerts");
      props.setModal(false);
    }, 1200);
  } else {
    setFlag("error");
    props.setModalContent("No se pudo actualizar, por favor intente de nuevo");
  }
};

actions.update.children = actions.create.children;

actions.getVar = getVar;

export default actions;
