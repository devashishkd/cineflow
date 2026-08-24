/**
 * Standardized JSON response helpers.
 * Keeps response shape consistent across all controllers.
 */

export const sendSuccess = (res, data, { message = 'Success', statusCode = 200, count } = {}) => {
  const body = { success: true, message };
  if (count !== undefined) body.count = count;
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

export const sendCreated = (res, data, message = 'Created successfully') => {
  return sendSuccess(res, data, { message, statusCode: 201 });
};

export const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
