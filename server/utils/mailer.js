const buildDeliveryPartnerEmailHtml = (partnerName, partnerPhone, vehicleType, deliveryOTP) => `
  <div style="background:#0a0812;padding:24px;font-family:Arial,sans-serif;color:#f5f3ff;">
    <div style="max-width:640px;margin:0 auto;background:#130d24;border:1px solid rgba(124,58,237,0.35);border-radius:16px;overflow:hidden;">
      <div style="padding:18px 22px;border-bottom:1px solid rgba(124,58,237,0.22);">
        <h1 style="margin:0;font-size:24px;color:#f5f3ff;">GoodShip</h1>
        <p style="margin:8px 0 0;color:#c4b5fd;">Your order is Out for Delivery!</p>
      </div>
      <div style="padding:22px;">
        <h2 style="margin:0 0 14px;font-size:18px;color:#f5f3ff;">Delivery Partner</h2>
        <p style="margin:0 0 8px;color:#e9d5ff;"><strong>Name:</strong> ${partnerName}</p>
        <p style="margin:0 0 8px;color:#e9d5ff;"><strong>Phone:</strong> ${partnerPhone}</p>
        <p style="margin:0 0 20px;color:#e9d5ff;"><strong>Vehicle Type:</strong> ${vehicleType}</p>
        <div style="padding:18px;border-radius:14px;background:rgba(124,58,237,0.12);border:1px solid rgba(6,182,212,0.35);text-align:center;">
          <p style="margin:0 0 8px;color:#c4b5fd;">Show this OTP to your delivery partner to receive your parcel:</p>
          <div style="font-size:34px;font-weight:700;letter-spacing:6px;color:#ffffff;">${deliveryOTP}</div>
        </div>
        <p style="margin:20px 0 0;color:#fda4af;">Do not share this OTP with anyone except your delivery partner.</p>
      </div>
    </div>
  </div>
`;

const sendDeliveryPartnerEmail = async (
  toEmail,
  partnerName,
  partnerPhone,
  vehicleType,
  deliveryOTP
) => {
  const emailPreview = {
    toEmail,
    subject: "GoodShip — Your Delivery is On the Way!",
    html: buildDeliveryPartnerEmailHtml(partnerName, partnerPhone, vehicleType, deliveryOTP)
  };

  console.log("Delivery OTP email preview:", emailPreview);
  return emailPreview;
};

module.exports = {
  sendDeliveryPartnerEmail
};
