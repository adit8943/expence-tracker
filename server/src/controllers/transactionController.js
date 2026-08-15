const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

const getFilters = (query, user) => {
  const filters = { user };
  if (query.type) filters.type = query.type;
  if (query.category) filters.category = query.category;
  if (query.startDate || query.endDate) filters.date = {};
  if (query.startDate) filters.date.$gte = new Date(query.startDate);
  if (query.endDate) filters.date.$lte = new Date(`${query.endDate}T23:59:59.999Z`);
  if (query.search) filters.title = { $regex: query.search, $options: 'i' };
  return filters;
};

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const filters = getFilters(req.query, req.user._id);
    const [transactions, total] = await Promise.all([
      Transaction.find(filters).sort({ date: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(filters),
    ]);
    res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ message: errors.array()[0].msg });
    res.status(201).json({ transaction: await Transaction.create({ ...req.body, user: req.user._id }) });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ transaction });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.status(204).send();
  } catch (error) { next(error); }
};

exports.summary = async (req, res, next) => {
  try {
    const match = { user: req.user._id };
    const totals = await Transaction.aggregate([{ $match: match }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]);
    const byCategory = await Transaction.aggregate([{ $match: { ...match, type: 'expense' } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }]);
    const monthly = await Transaction.aggregate([{ $match: match }, { $group: { _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' }, total: { $sum: '$amount' } } }, { $sort: { '_id.month': 1 } }]);
    const income = totals.find((item) => item._id === 'income')?.total || 0;
    const expense = totals.find((item) => item._id === 'expense')?.total || 0;
    res.json({ totals: { income, expense, balance: income - expense }, byCategory, monthly });
  } catch (error) { next(error); }
};

exports.categories = async (req, res, next) => {
  try {
    const categories = await Transaction.distinct('category', { user: req.user._id });
    res.json({ categories });
  } catch (error) { next(error); }
};
