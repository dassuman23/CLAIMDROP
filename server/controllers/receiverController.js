import supabase from '../config/supabase.js';

export const getAvailableDrops = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('drops')
      .select(`
        *,
        profiles:donor_id (business_name, address)
      `)
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flattening the response for easier frontend consumption
    const formattedData = data.map(drop => ({
      ...drop,
      business_name: drop.profiles?.business_name || 'Verified Store',
      address: drop.profiles?.address || 'Location provided upon claim'
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const claimDrop = async (req, res) => {
  const { drop_id } = req.body;
  const claimer_id = req.user?.id;

  if (!claimer_id) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    // 1. EXECUTE THE ACTION: Call the RPC to lock the drop
    const { error: rpcError } = await supabase.rpc('claim_drop', {
      p_drop_id: drop_id,
      p_claimer_id: claimer_id
    });

    if (rpcError) throw new Error(rpcError.message);

    // 2. FETCH THE DATA: Now perform a standard select on the 'drops' table
    // PostgREST knows the relationship between 'drops' and 'profiles'
    const { data: dropData, error: fetchError } = await supabase
      .from('drops')
      .select(`
        *,
        profiles:donor_id (
          business_name,
          address,
          phone
        )
      `)
      .eq('id', drop_id)
      .single();

    if (fetchError || !dropData) {
      throw new Error("Drop claimed, but failed to fetch details.");
    }

    res.status(200).json({ 
      success: true, 
      message: "Drop claimed successfully!",
      drop: dropData 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


export const getImpactStats = async (req, res) => {
  const userId = req.user.id;

  try {
    // Aggregate completed drops for this specific receiver
    const { data, error } = await supabase
      .from('drops')
      .select('quantity, created_at')
      .eq('claimer_id', userId) // Assuming you added this column to drops on claim
      .eq('status', 'COMPLETED');

    if (error) throw error;

    // Logic: 1kg of food ≈ 2.5kg of CO2 avoided and ~2 meals
    // This is a "Proven Concept" for hackathon storytelling
    const totalDrops = data.length;
    const mealsSaved = totalDrops * 5; // Simplified multiplier for demo
    const co2Saved = (totalDrops * 1.5).toFixed(1); 

    res.status(200).json({
      success: true,
      stats: {
        totalDrops,
        mealsSaved,
        co2Saved,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPickup = async (req, res) => {
  const { drop_id, otp } = req.body;
  const claimer_id = req.user.id;

  console.log("Verifying Drop ID:", drop_id, "with OTP:", otp);

  try {
    // 1. Fetch the drop details
    const { data: drop, error: fetchError } = await supabase
      .from('drops')
      .select('pickup_code, status, claimer_id')
      .eq('id', drop_id)
      .single();

    if (fetchError || !drop) {
      console.error("Fetch Error:", fetchError);
      return res.status(404).json({ success: false, error: "Drop not found." });
    }

    // 2. Validate OTP and Claimer ID
    if (drop.pickup_code !== otp) {
      return res.status(401).json({ success: false, error: "Invalid verification code." });
    }

    if (drop.claimer_id !== claimer_id) {
      return res.status(403).json({ success: false, error: "Unauthorized receiver." });
    }

    // 3. Update status to COMPLETED
    const { error: updateError } = await supabase
      .from('drops')
      .update({ status: 'COMPLETED' })
      .eq('id', drop_id);

    if (updateError) {
      console.error("Update Error:", updateError);
      throw updateError;
    }

    // CRITICAL: You must return this response to stop the "Verifying..." state
    return res.status(200).json({ 
      success: true, 
      message: "Handover verified successfully!" 
    });

  } catch (error) {
    console.error("Controller Error:", error.message);
    // CRITICAL: Always return a response in the catch block
    return res.status(500).json({ success: false, error: error.message });
  }
};