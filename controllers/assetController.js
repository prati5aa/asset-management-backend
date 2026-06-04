const Asset = require('../models/asset');


const getAssets = async (req, res) => {
  try {
    const { item_name, category, manufacturer, department } = req.query;

    const filter = { status: 'available' }; // employees only see available items

    if (item_name)    filter.item_name    = { $regex: item_name, $options: 'i' };
    if (category)     filter.category     = category;
    if (manufacturer) filter.manufacturer = { $regex: manufacturer, $options: 'i' };
    if (department)   filter.department   = { $regex: department, $options: 'i' };

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.status(200).json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ message: 'Server error fetching assets' });
  }
};

module.exports = { getAssets };