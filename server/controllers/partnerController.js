const DeliveryPartner = require("../models/DeliveryPartner");

const getPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find()
      .select("_id name phone vehicleType available")
      .sort({ name: 1 });
    return res.json(partners);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch delivery partners.", error: error.message });
  }
};

module.exports = {
  getPartners
};
