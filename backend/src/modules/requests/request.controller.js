const AppError = require('../../utils/app-error');
const requestService = require('./request.service');

async function createRequest(req, res, next) {
  try {
    const { type, title, description, metadata } = req.body;

    const request = await requestService.createRequest(
      type,
      title,
      description || '',
      req.user.id,
      metadata || {}
    );
    res.status(201).json(request);
  } catch (error) {
    return next(error);
  }
}

async function getRequests(req, res, next) {
  try {
    const { status } = req.query;
    const requests = await requestService.getRequests(status || null);
    res.json(requests);
  } catch (error) {
    return next(error);
  }
}

async function approveRequest(req, res, next) {
  try {
    const requestId = req.params.id;

    const existingRequest = await requestService.getRequestById(requestId);
    if (!existingRequest) {
      return next(new AppError(404, 'Request not found'));
    }

    if (existingRequest.status !== 'PENDING') {
      return next(new AppError(400, 'Request has already been processed'));
    }

    const request = await requestService.approveRequest(requestId, req.user.id);
    res.json(request);
  } catch (error) {
    return next(error);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const { reason } = req.body;
    const requestId = req.params.id;

    const existingRequest = await requestService.getRequestById(requestId);
    if (!existingRequest) {
      return next(new AppError(404, 'Request not found'));
    }

    if (existingRequest.status !== 'PENDING') {
      return next(new AppError(400, 'Request has already been processed'));
    }

    const request = await requestService.rejectRequest(requestId, req.user.id, reason);
    res.json(request);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
};
