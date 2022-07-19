import { isset, empty } from "../../../utils/common";
import { buildFiltersQueryString } from "../fragments/params";

export const getAll = async (data) => {
  const formData = {};

  if (!empty(data?.id)) formData.id = data.id;
  if (!empty(data?.uuid)) formData.uuid = data.uuid;
  if (!empty(data?.post_type)) formData.post_type = data.post_type;
  if (!empty(data?.parentId)) formData.parentId = data.parentId;
  if (!empty(data?.storeId)) formData.storeId = data.storeId;
  if (!empty(data?.authorId)) formData.authorId = data.authorId;
  if (!empty(data?.ref)) formData.ref = data.ref;
  if (!empty(data?.status)) formData.status = data.status;
  if (!empty(data?.deleted)) formData.deleted = data.deleted;
  if (!empty(data?.publishAt)) formData.publishAt = data.publishAt;
  if (!empty(data?.publishUntil)) formData.publishUntil = data.publishUntil;
  if (!empty(data?.createdAt)) formData.createdAt = data.createdAt;
  if (!empty(data?.updatedAt)) formData.updatedAt = data.updatedAt;

  const params = buildFiltersQueryString(formData);

  //get contents
  const res = await fetch("/api/posts?where=" + params);
  const json = await res.json();

  return json;
};

export default {
  getAll
};