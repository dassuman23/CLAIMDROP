import supabase from '../config/supabase.js';
import crypto from 'crypto';

export const createDrop = async (req, res) => {
  console.log("------------------- NEW DROP REQUEST -------------------");
  
  try {
    // 1. LOG: Data received from the Frontend
    console.log("RAW FRONTEND DATA (req.body):", JSON.stringify(req.body, null, 2));
    console.log("AUTHENTICATED USER ID (req.user.id):", req.user?.id);

    const { title, quantity, expiry_hours, image_url } = req.body;
    const donor_id = req.user.id;

    // 2. LOG: Server-side logic generation
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log("GENERATED PICKUP_CODE (OTP):", otp);

    const expiry_time = new Date();
    expiry_time.setHours(expiry_time.getHours() + parseInt(expiry_hours || 0));
    const isoExpiry = expiry_time.toISOString();
    console.log("CALCULATED EXPIRY TIME:", isoExpiry);

    // 3. LOG: The exact object being sent to Supabase
    const payload = {
      donor_id,
      title,
      quantity,
      expiry_time: isoExpiry,
      image_url,
      pickup_code: otp,
      status: 'AVAILABLE'
    };
    
    console.log("FINAL PAYLOAD FOR DATABASE INSERT:", JSON.stringify(payload, null, 2));

    // 4. Database Operation
    const { data, error } = await supabase
      .from('drops')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // 5. LOG: Detailed Database Error
      console.error("SUPABASE DATABASE ERROR:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    // 6. LOG: Success - Data actually stored and returned by DB
    console.log("DATABASE CONFIRMATION (STORED ROW):", JSON.stringify(data, null, 2));
    console.log("--------------------------------------------------------");

    res.status(201).json({
      success: true,
      message: "Drop created successfully",
      drop: data
    });

  } catch (error) {
    console.error("CRITICAL CONTROLLER ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDonorStats = async (req, res) => {
  // Logic to calculate total weight and meals saved
  // This is great for your "Impact Tracking" feature
  res.status(200).json({ message: "Stats endpoint placeholder" });
};