const Transaction = require('../models/transaction');
const Asset = require('../models/asset');

const CHECKOUT_LIMIT = 3;


const checkoutAsset = async (req, res) => {
  try {
    const { assetId } = req.body;
    const userId = req.user._id;

    const asset = await Asset.findById(assetId);
    if (!asset)
      return res.status(404).json({ message: 'Asset not found' });

    if (asset.status === 'checked_out')
      return res.status(400).json({ message: 'Asset is already checked out' });

    
    const activeCount = await Transaction.countDocuments({ userId, return_date: null });
    if (activeCount >= CHECKOUT_LIMIT)
      return res.status(400).json({
        message: `Checkout limit reached. You may hold a maximum of ${CHECKOUT_LIMIT} assets at a time.`,
      });

    const [transaction] = await Promise.all([
      Transaction.create({ assetId, userId }),
      Asset.findByIdAndUpdate(assetId, { status: 'checked_out' }),
    ]);

    const populated = await transaction.populate('assetId');
    res.status(201).json({ message: 'Asset checked out successfully', transaction: populated });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
};

// @route PUT /api/transactions/return/:id
const returnAsset = async (req, res) => {
  try {
    const { condition_rating } = req.body;
    const userId = req.user._id;

    const rating = parseInt(condition_rating, 10);
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({
        message: 'A condition rating between 1 and 5 is required.',
      });

    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
      return_date: null,
    });
 console.log('Return transaction:', transaction);
   
 if (!transaction)
      return res.status(404).json({
        message: 'Active transaction not found or does not belong to you',
      });

    const [updated] = await Promise.all([
      Transaction.findByIdAndUpdate(
        req.params.id,
        { return_date: new Date(), condition_rating: rating },
        { new: true }
      ).populate('assetId'),
      Asset.findByIdAndUpdate(transaction.assetId, { status: 'available' }),
    ]);

    res.status(200).json({ message: 'Asset returned successfully', transaction: updated });
  } catch (error) {
    console.error('Return error:', error);
    res.status(500).json({ message: 'Server error during return' });
  }
};

// @route GET /api/transactions/my-active
const getMyActiveTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      return_date: null,
    })
      .populate('assetId')
      .sort({ checkout_date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching active transactions' });
  }
};

// @route GET /api/transactions/history
// @desc  Full transaction history for the logged-in employee
const getMyHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('assetId')
      .sort({ checkout_date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

// @route GET /api/transactions/admin/all  (admin only)
// @desc  Full transaction log across all users with populated refs
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate('assetId', 'item_name category serial_number')
        .populate('userId', 'name email')
        .sort({ checkout_date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page:  parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching all transactions' });
  }
};

module.exports = {
  checkoutAsset,
  returnAsset,
  getMyActiveTransactions,
  getMyHistory,
  getAllTransactions,
};