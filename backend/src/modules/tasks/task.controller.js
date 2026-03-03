const AppError = require('../../utils/app-error');
const taskService = require('./task.service');

async function createTask(req, res, next) {
  try {
    const { title, description, assigned_to: assignedTo } = req.body;

    const taskId = await taskService.createTask(title, description || '', assignedTo, req.user.id);
    res.status(201).json({ id: taskId });
  } catch (error) {
    return next(error);
  }
}

async function searchTasks(req, res, next) {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const tasks = await taskService.searchTasks(q, pageNum, limitNum);
    const total = await taskService.getTotalSearchTasks(q);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return next(new AppError(404, 'Task not found'));
    }

    res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function getTaskDetails(req, res, next) {
  try {
    const result = await taskService.getTaskDetailsWithAudit(req.params.id);
    if (!result) {
      return next(new AppError(404, 'Task not found'));
    }

    res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getAssignedTasks(req, res, next) {
  try {
    const { page = 1, limit = 10, q, sortBy = 'created_at', order = 'DESC' } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const tasks = await taskService.getTasksByAssignee(
      req.user.id,
      pageNum,
      limitNum,
      q || null,
      sortBy,
      order
    );
    const total = await taskService.getTotalTasksByAssignee(req.user.id, q || null);

    res.json({
      tasks,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      sort: {
        sortBy,
        order,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      return next(new AppError(404, 'Task not found'));
    }

    if (req.user.role === 'WORKER') {
      if (task.assigned_to !== req.user.id) {
        return next(new AppError(403, 'Not assigned to this task'));
      }
      if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
        return next(new AppError(403, 'Invalid status for worker'));
      }
    } else if (!['MANAGER', 'OWNER', 'ADMIN'].includes(req.user.role)) {
      return next(new AppError(403, 'Unauthorized'));
    }

    await taskService.updateTaskStatus(taskId, status);
    res.json({ message: 'Status updated' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  searchTasks,
  getTaskById,
  getTaskDetails,
  getAssignedTasks,
  updateTaskStatus,
};
