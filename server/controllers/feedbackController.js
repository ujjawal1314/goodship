const { Order } = require("../models/Order");

const roundToSingleDecimal = (value) => Math.round(value * 10) / 10;

const getFeedbackSummary = async (_req, res) => {
  try {
    const orders = await Order.find({
      "feedback.submittedAt": { $ne: null }
    })
      .sort({ "feedback.submittedAt": -1 })
      .select("orderId feedback");

    const totalFeedbacks = orders.length;

    if (!totalFeedbacks) {
      return res.json({
        totalFeedbacks: 0,
        avgOverallRating: null,
        avgDeliveryPartnerRating: null,
        recommendPercent: 0,
        recentComments: []
      });
    }

    const totals = orders.reduce(
      (acc, order) => {
        acc.overall += Number(order.feedback?.overallRating || 0);
        acc.delivery += Number(order.feedback?.deliveryPartnerRating || 0);
        if (order.feedback?.wouldRecommend === true) {
          acc.recommendYes += 1;
        }
        return acc;
      },
      { overall: 0, delivery: 0, recommendYes: 0 }
    );

    const recentComments = orders
      .filter((order) => order.feedback?.comment)
      .slice(0, 5)
      .map((order) => ({
        orderId: order.orderId,
        overallRating: order.feedback.overallRating,
        deliveryPartnerRating: order.feedback.deliveryPartnerRating,
        comment: order.feedback.comment,
        wouldRecommend: order.feedback.wouldRecommend
      }));

    return res.json({
      totalFeedbacks,
      avgOverallRating: roundToSingleDecimal(totals.overall / totalFeedbacks),
      avgDeliveryPartnerRating: roundToSingleDecimal(totals.delivery / totalFeedbacks),
      recommendPercent: roundToSingleDecimal((totals.recommendYes / totalFeedbacks) * 100),
      recentComments
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load feedback summary.", error: error.message });
  }
};

module.exports = {
  getFeedbackSummary
};
