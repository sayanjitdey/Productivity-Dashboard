const Task = require("../models/task.model");
const mongoose = require("mongoose");
const redisClient = require("../config/redis");

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `dashboard:${userId}`;

    // 1. Check cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("Dashboard Cache HIT");
      return res.json(JSON.parse(cached));
    }

    console.log("Dashboard Cache MISS");

    // 2. Aggregation (heavy query)
    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Format response
    let result = {
      total: 0,
      todo: 0,
      "in-progress": 0,
      done: 0,
    };

    stats.forEach((item) => {
      result[item._id] = item.count;
      result.total += item.count;
    });

    // 4. Cache result
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

    res.json(result);
  } catch (err) {
    next(err);
  }
};
