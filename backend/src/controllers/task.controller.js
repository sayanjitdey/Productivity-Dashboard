const redisClient = require("../config/redis");
const Task = require("../models/task.model");
const User = require("../models/user.model");

exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 1. Extract query params
    const { page = 1, limit = 10, status, search } = req.query;

    const cacheKey = `tasks:${userId}:${page}:${limit}:${status}:${search}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Cache HIT");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache MISS");

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const skip = (pageNum - 1) * limitNum;

    // 2. Build query dynamically
    let query = { userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.text = {
        $regex: search,
        $options: "i", // case-insensitive
      };
    }

    // 3. Execute queries in parallel
    const [tasks, total] = await Promise.all([
      Task.find(query).select("text status").skip(skip).limit(limitNum).lean(),

      Task.countDocuments(query),
    ]);

    // 4. Response format
    const response = {
      data: tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    // 5. Cache the response for 1 hour
    await redisClient.setEx(cacheKey, 60, JSON.stringify(response));
    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    if (title.length > 100) {
      return res
        .status(400)
        .json({ error: "Title must be less than 100 characters" });
    }
    const task = await Task.create({ title, status, userId: req.user.userId });
    const keys = await redisClient.keys(`tasks:${req.user.userId}:*`);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    const keys = await redisClient.keys(`tasks:${req.user.userId}:*`);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    const keys = await redisClient.keys(`tasks:${req.user.userId}:*`);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
