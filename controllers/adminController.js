const Asset = require('../models/asset');
const Transaction = require('../models/transaction');

// @route GET /api/admin/metrics
const getMetrics = async (req, res) => {
  try {
    const [total, checkedOut] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'checked_out' }),
    ]);

    res.status(200).json({
      totalAssets:    total,
      checkedOut:     checkedOut,
      available:      total - checkedOut,
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
};

// @route POST /api/admin/assets
const createAsset = async (req, res) => {
  try {
    const { item_name, image, category, serial_number, manufacturer, department } = req.body;

    const duplicate = await Asset.findOne({ serial_number });
    if (duplicate)
      return res.status(409).json({ message: 'An asset with that serial number already exists' });

    const asset = await Asset.insertMany({
      item_name,
      image,
      category,
      serial_number,
      manufacturer,
      department,
    });

    res.status(201).json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ message: 'Server error creating asset' });
  }
};


const getAllAssets = async (req, res) => {
  try {
    const { item_name, category, department, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (item_name)  filter.item_name  = { $regex: item_name, $options: 'i' };
    if (category)   filter.category   = category;
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (status)     filter.status     = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assets, total] = await Promise.all([
      Asset.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Asset.countDocuments(filter),
    ]);

    res.status(200).json({
      assets,
      pagination: {
        total,
        page:       parseInt(page),
        pages:      Math.ceil(total / parseInt(limit)),
        limit:      parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all assets error:', error);
    res.status(500).json({ message: 'Server error fetching assets' });
  }
};


const updateAsset = async (req, res) => {
  try {
    const { serial_number } = req.body;

    if (serial_number) {
      const duplicate = await Asset.findOne({
        serial_number,
        _id: { $ne: req.params.id },
      });
      if (duplicate)
        return res.status(409).json({ message: 'Serial number already in use by another asset' });
    }

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!asset)
      return res.status(404).json({ message: 'Asset not found' });

    res.status(200).json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ message: 'Server error updating asset' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset)
      return res.status(404).json({ message: 'Asset not found' });

    // Block deletion if the asset is currently checked out
    if (asset.status === 'checked_out')
      return res.status(400).json({
        message: 'Cannot delete an asset that is currently checked out. Wait for it to be returned first.',
      });

    await asset.deleteOne();
    res.status(200).json({ message: 'Asset deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Server error deleting asset' });
  }
};

module.exports = { getMetrics, createAsset, getAllAssets, updateAsset, deleteAsset };