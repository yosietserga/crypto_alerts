import { isset, empty, log } from "../../../utils/common";

export function buildFiltersQueryString(f) {
  const params = {};

  if (isset(f.id) && !empty(f.id)) {
    params.id = !Array.isArray(f.id) ? { $in: [f.id] } : { $in: f.id };
  }

    const dateFields = ["createdAt", "updatedAt", "publishAt", "publishUntil"];

    dateFields.map((field) => {
      if (
        isset(f[`${field}From`]) &&
        !empty(f[`${field}From`]) &&
        isset(f[`${field}To`]) &&
        !empty(f[`${field}To`])
      ) {
        params[field] = { $gte: f[`${field}From`] };
        params.$and = params.$and ?? {};
        params.$and[field] = { $lte: f[`${field}To`] };
      } else if (isset(f[`${field}From`]) && !empty(f[`${field}From`])) {
        params[field] = { $gte: f[`${field}From`] };
      } else if (isset(f[`${field}To`]) && !empty(f[`${field}To`])) {
        params[field] = { $lte: f[`${field}To`] };
      }
    });

    const numberRangeFields = ["status", "deleted"];

    numberRangeFields.map((field) => {
      if (
        isset(f[`${field}From`]) &&
        !empty(f[`${field}From`]) &&
        isset(f[`${field}To`]) &&
        !empty(f[`${field}To`])
      ) {
        params[field] = { $gte: parseFloat(f[`${field}From`]) };
        params.$and = params.$and ?? {};
        params.$and[field] = { $lte: parseFloat(f[`${field}To`]) };
      } else if (isset(f[`${field}From`]) && !empty(f[`${field}From`])) {
        params[field] = { $gte: parseFloat(f[`${field}From`]) };
      } else if (isset(f[`${field}To`]) && !empty(f[`${field}To`])) {
        params[field] = { $lte: parseFloat(f[`${field}To`]) };
      }
    });

    const numbersAsArraysFields = ["storeId", "parentId", "authorId"];

    numbersAsArraysFields.map((field) => {
      if (
        isset(f[`${field}`]) &&
        !empty(f[`${field}`]) &&
        Array.isArray(f[`${field}`]) &&
        !empty(f[`${field}`][0]) &&
        !isNaN(f[`${field}`][0])
      ) {
        params[field] = { $in: f[`${field}`] };
      }
    });

    const stringsAsArraysFields = ["ref", "post_type", "image", "uuid"];

    stringsAsArraysFields.map((field) => {
      if (
        isset(f[`${field}`]) &&
        !empty(f[`${field}`]) &&
        !Array.isArray(f[`${field}`])
      ) {
        params[field] = { $cont: f[`${field}`] };
      } else if (Array.isArray(f[`${field}`]) && f[`${field}`].length > 1) {
        params[field] = {
          $search: f[`${field}`].join("|"),
        };
      } else if (Array.isArray(f[`${field}`]) && !empty(f[`${field}`][0])) {
        params[field] = { $cont: f[`${field}`][0] };
      }
    });

    if (isset(params.$and) && empty(params.$and)) delete params.$and;
    if (isset(params.$or) && empty(params.$or)) delete params.$or;

    return !empty(params) ? JSON.stringify(params) : JSON.stringify([]);
}