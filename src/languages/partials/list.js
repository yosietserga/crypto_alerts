import React from "react";
import DataGrid, {
  SelectColumn,
  TextEditor,
  SelectCellFormatter,
} from "react-data-grid";
import { StoreContext } from "../../../context/store";
import { buildFiltersQueryString } from "../fragments/params";
import { isset, empty, log } from "../../../utils/common";
import { exportToCsv } from "../../../utils/exportFile.ts";
import { Form, Button, Collapse, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

import { ExportCSVButton } from "../exportButtons";

import FilterName from "../filters/name";
import FilterStatus from "../filters/status";
import FilterCreatedAt from "../filters/createdAt";

function rowKeyGetter(row) {
  if (isset(row?.id)) return `profilegroup_${row.id}`;
}

const risks = {
  1:"Bajo",
  2:"Medio",
  3:"Medio Alto",
  4:"Alto",
  5:"Muy Alto",
};

let controlInput = null;

export default function ProfileGroupList( props ) {
  const { filters, data } = props;
  const [toggle, setToggle] = React.useState();
  const [columns, setColumns] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [records, setRecords] = React.useState(data ?? []);
  const [profilegroups, setProfileGroups] = React.useState(data ?? []);
  const [sortColumns, setSortColumns] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  const [__filters, setFilters] = React.useState({});
  
  const store = React.useContext(StoreContext);

  const memoRows = rows => {
    const memo = [];
    const resp = [];

    for (let i in rows) {
      if (isNaN(i)) continue;

      const r = rows[i];
      if (!memo.includes(r.uuid)) { 
          memo.push(r.uuid);
          resp.push(r);
      }
    }
    return resp;
  }

  const handleRowChange = (v, k, p) => {
      let body = {};
      body.name = k==="name" ? v : p.row?.name;
      body.status = k === "status" ? parseInt(v) : parseInt(p.row?.status);

      //POST form values
      fetch(`/api/profilegroups/${p.row.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((res) => {
          log(res);
        });
  }

  store.set("profilegroups", []);

  store.on("updateProfileGroup", (o) => {
      if (empty(o)) {
        setRecords([]);
        setRows([]);
        setTotals({});
      } else {
        let firstRow = o[0];
        let cols = Object.keys(firstRow).map((item) => {
          let colObject = { key: item, name: item };
          
          switch (item) {
            case "status":
              colObject.width = 90;

              colObject.formatter = (p) => {
                return <>{`${p.row.status ? "Activado" : "Desactivado"}`}</>;
              };

              colObject.editor = (p) => (
                <Input
                  type="select"
                  autoFocus
                  value={p.row.status ?? 0}
                  onChange={(e) => {
                    handleRowChange(e.target.value, "status", p);

                    p.onRowChange({ ...p.row, status: e.target.value }, true);
                  }}
                >
                  <option key={0} value={0}>
                    Desactivado
                  </option>
                  <option key={1} value={1}>
                    Activado
                  </option>
                </Input>
              );

              colObject.editorOptions = {
                editOnClick: true,
              };
              break;
            case "profileTypeId":
              colObject.width = 180;

              colObject.formatter = (p) => {
                return (
                  <>{`${
                    p.row.profile_type ? p.row.profile_type.name : "Ninguno"
                  }`}</>
                );
              };

              colObject.editor = (p) => (
                <Input
                  type="select"
                  autoFocus
                  value={
                    profiletypes.map((group) => {
                      return p.row.profileTypeId === group.id
                        ? group.name
                        : "Ninguno";
                    })[0]
                  }
                  onChange={(e) => {
                    handleRowChange(e.target.value, "profileTypeId", p);
                    p.onRowChange(
                      { ...p.row, profileTypeId: e.target.value },
                      true
                    );
                  }}
                >
                  {profiletypes.map((group) => {
                    return (
                      <option
                        key={group.uuid}
                        value={group.id}
                        selected={p.row.profileTypeId === group.id}
                      >
                        {group.name}
                      </option>
                    );
                  })}
                </Input>
              );

              colObject.editorOptions = {
                editOnClick: true,
              };
              break;
            case "name":
              colObject.width = 180;

              colObject.editor = (p) => (
                <Input
                  type="text"
                  autoFocus
                  value={p.row[item] ?? ""}
                  onChange={(e) => {
                    if (controlInput) {
                      clearTimeout(controlInput);
                      controlInput = null;
                    } else {
                      controlInput = setTimeout(() => {
                        handleRowChange(e.target.value, item, p);
                      }, 1000);
                    }
                    p.onRowChange({ ...p.row, [item]: e.target.value }, true);
                  }}
                />
              );

              colObject.editorOptions = {
                editOnClick: true,
              };
              break;
          }
          return colObject;
        });        
        cols.unshift(SelectColumn);
        cols.pop();
        setColumns(cols);
        setRecords(o);
        setRows(memoRows([...rows, ...o]));
      }
  });

  React.useEffect(() => {
    const query = buildFiltersQueryString({...filters, ...__filters}) ?? "";

    fetch("/api/profilegroups?include=profiletype&where=" + query, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r) => {
        if (!empty(r)) {
          store.set("profilegroups", r);
          store.emit("updateProfileGroups", r);
        } else {
          store.set("profilegroups", []);
          store.emit("updateProfileGroups", []);
        }
      });

    try {
      fetch("/api/profilegroups", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((r) => r.json())
        .then((r) => {
          if (!empty(r)) {
            store.set("profilegroups", r);
            store.emit("updateProfileGroups", r);
            setProfileGroups(r);
          } else {
            store.set("profilegroups", []);
            store.emit("updateProfileGroups", []);
            setProfileGroups([]);
          }
        });
    } catch (err) {
      console.log(err);
    }
  }, [store, filters, __filters]);

  const handleRowsChange = (r) => {
    const __ids = Array.from(r).map(rowKey => {
      return parseInt(rowKey.split("_")[1]);
    });

    store.emit("profileGroup:selected", __ids);

    setFilters({
      ...__filters,
      ...{ id: __ids },
    });

    setSelectedRows(r);
  }

  const gridElement = (
    <DataGrid
      columns={columns}
      rows={rows}
      rowKeyGetter={rowKeyGetter}
      defaultColumnOptions={{
        sortable: true,
      }}
      onRowsChange={setRows}
      selectedRows={selectedRows}
      onSelectedRowsChange={handleRowsChange}
      sortColumns={sortColumns}
      onSortColumnsChange={setSortColumns}
      className="fill-grid rdg-light"
    />
  );
  
  const handleStrAsArray = (v, k) => {
    const tsquerySpecialChars = /[()|&:*!]/g;

    const getQueryFromSearchPhrase = (searchPhrase) =>
      searchPhrase.replace(tsquerySpecialChars, ",").trim().split(",");
    let strAsArray =
      typeof v === "string"
        ? getQueryFromSearchPhrase(v).map((val) => {
            if (!empty(val.trim())) return val.trim();
          })
        : Array.isArray(v) && !empty(v)
        ? v
        : [];

    if (strAsArray.length > 0 && !empty(strAsArray[0])) {
      setFilters({
        ...__filters,
        ...{ [k]: strAsArray },
      });
    } else {
      setFilters({
        ...__filters,
        ...{ [k]: null },
      });
    }
  };
  
  const handleDateISO = (v,k) => {
    setFilters({
      ...__filters,
      ...{ [k]:v },
    });
  };
  
  const handleNumbersAsArray = (v,k) => {
    let numbersArray =
      typeof v === "string"
        ? v.split(",").map((item) => {
            return parseInt(item.trim().replace(/\D/gi, ""));
          })
        : Array.isArray(v) && !empty(v)
        ? v
        : [];
    if (
      numbersArray.length > 0 &&
      !empty(numbersArray[0]) &&
      !isNaN(numbersArray[0])
    ) {
      setFilters({
        ...__filters,
        ...{ [k]: numbersArray },
      });
    } else {
      setFilters({
        ...__filters,
        ...{ [k]: null },
      });
    }
  };
  
  const handleNumberRange = (v,k) => {
    setFilters({
      ...__filters,
      ...{ [k]: v },
    });
  };

  return (
    <>
      <div className="block">
        <h1>Profile Groups</h1>
        <h2>
          Filtros{" "}
          <Button onClick={() => setToggle(!toggle)} className="h-10 w-10">
            <FontAwesomeIcon icon={faFilter} />
          </Button>
        </h2>
        <Collapse isOpen={toggle}>
          <Form>
            <FilterName setFilter={handleStrAsArray} />
            <FilterCreatedAt setFilter={handleDateISO} />
          </Form>
        </Collapse>
        <hr />
        <ExportCSVButton
          onExport={() => exportToCsv(gridElement, "profilegroups.csv")}
        >
          Export to CSV
        </ExportCSVButton>

        {gridElement}
      </div>
    </>
  );
}