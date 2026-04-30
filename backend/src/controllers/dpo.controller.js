import { supabase } from "../lib/supabaseClient.js";

const ROPA_SELECT = `
  *,
  obtaining_data:obtaining_data_id(*),
  obtaining_method_detail:obtaining_method(*),
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  minor_consent:minor_consent_id(*),
  policy:policy_id(*),
  security_measurement:security_measurement_id(*),
  international_transfers(*)
`;

const ROPA_LIST_SELECT = `
  activity_id,
  user_id,
  activity_name,
  activity_subject,
  purpose,
  approval_status,
  created_at,
  updated_at,
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  obtaining_data:obtaining_data_id(*),
  obtaining_method_detail:obtaining_method(*),
  policy:policy_id(*)
`;

const sendError = (res, status, message, detail = null) => {
  if (status >= 500) {
    console.error(message, detail);
  }

  return res.status(status).json({
    success: false,
    error: message,
    ...(detail ? { detail } : {}),
  });
};

const getActivityId = (req) => {
  return req.params.activity_id || req.query.activity_id || req.body.activity_id;
};

const getReviewerId = (req) => {
  return req.body.userId || req.body.user_id || req.body.updated_by || req.query.user_id;
};

const upsertDpoApproval = async ({ activityId, userId, status, comment = null }) => {
  const now = new Date().toISOString();
  const { data: existing, error: findError } = await supabase
    .from("dpo_ropa_approval")
    .select("ropa_approval_id")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (findError) {
    throw new Error(`dpo_ropa_approval lookup failed: ${findError.message}`);
  }

  const payload = {
    approval_status: status,
    comment,
    return_at: now,
    ...(userId ? { user_id: userId } : {}),
  };

  if (existing?.ropa_approval_id) {
    const { error: updateError } = await supabase
      .from("dpo_ropa_approval")
      .update(payload)
      .eq("ropa_approval_id", existing.ropa_approval_id);

    if (updateError) {
      throw new Error(`dpo_ropa_approval update failed: ${updateError.message}`);
    }

    return;
  }

  const { error: insertError } = await supabase
    .from("dpo_ropa_approval")
    .insert({
      activity_id: activityId,
      user_id: userId,
      approval_status: status,
      comment,
      return_at: now,
    });

  if (insertError) {
    throw new Error(`dpo_ropa_approval insert failed: ${insertError.message}`);
  }
};

// GET /api/dpo/ropa
// ดู ROPA ทั้งหมด หรือ filter ด้วย status ได้
export const getAllRopaForDpo = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from("activities")
      .select(ROPA_LIST_SELECT)
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("approval_status", status);
    }

    if (search) {
      query = query.ilike("activity_name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return sendError(res, 500, "Fetch ROPA list failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch ROPA list failed", err.message);
  }
};

// GET /api/dpo/ropa/pending
// ดูเฉพาะ ROPA ที่รอ DPO ตรวจ
export const getPendingRopaForDpo = async (req, res) => {
  try {
    const { data: pendingRows, error: pendingError } = await supabase
      .from("dpo_ropa_approval")
      .select("activity_id")
      .eq("approval_status", "pending");

    if (pendingError) {
      return sendError(res, 500, "Fetch pending ROPA failed", pendingError.message);
    }

    const activityIds = (pendingRows || []).map((row) => row.activity_id).filter(Boolean);

    if (activityIds.length === 0) {
      const { data: legacyPending, error: legacyError } = await supabase
        .from("activities")
        .select(ROPA_LIST_SELECT)
        .eq("approval_status", "pending")
        .neq("denial_details", "__DRAFT__")
        .order("created_at", { ascending: false });

      if (legacyError) {
        return sendError(res, 500, "Fetch pending ROPA failed", legacyError.message);
      }

      if ((legacyPending || []).length > 0) {
        const backfillRows = (legacyPending || [])
          .filter((row) => row.activity_id && row.user_id)
          .map((row) => ({
            activity_id: row.activity_id,
            user_id: row.user_id,
            approval_status: "pending",
            comment: null,
            return_at: null,
          }));

        if (backfillRows.length > 0) {
          await supabase
            .from("dpo_ropa_approval")
            .upsert(backfillRows, { onConflict: "activity_id" });
        }
      }

      return res.status(200).json({
        success: true,
        data: legacyPending || [],
      });
    }

    const { data, error } = await supabase
      .from("activities")
      .select(ROPA_LIST_SELECT)
      .in("activity_id", activityIds)
      .order("created_at", { ascending: false });

    if (error) {
      return sendError(res, 500, "Fetch pending ROPA failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch pending ROPA failed", err.message);
  }
};

// GET /api/dpo/ropa/:activity_id
// ดูรายละเอียด ROPA 1 อัน
export const getRopaDetailForDpo = async (req, res) => {
  try {
    const activityId = getActivityId(req);

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    const { data, error } = await supabase
      .from("activities")
      .select(ROPA_SELECT)
      .eq("activity_id", activityId)
      .single();

    if (error) {
      return sendError(res, 404, "ROPA not found", error.message);
    }

    const { data: reviewData } = await supabase
      .from("dpo_ropa_approval")
      .select("approval_status, comment, return_at, user_id")
      .eq("activity_id", activityId)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        dpo_review: reviewData || null,
      },
    });
  } catch (err) {
    return sendError(res, 500, "Fetch ROPA detail failed", err.message);
  }
};

// PATCH /api/dpo/ropa/:activity_id/approve
// DPO อนุมัติ ROPA
export const approveRopa = async (req, res) => {
  try {
    const activityId = getActivityId(req);
    const reviewerId = getReviewerId(req);

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    const updateData = {
      approval_status: "approved",
      updated_at: new Date().toISOString(),
    };

    if (reviewerId) {
      updateData.updated_by = reviewerId;
    }

    const { data, error } = await supabase
      .from("activities")
      .update(updateData)
      .eq("activity_id", activityId)
      .select(ROPA_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Approve ROPA failed", error.message);
    }

    await upsertDpoApproval({
      activityId,
      userId: reviewerId || data.user_id,
      status: "approved",
      comment: null,
    });

    return res.status(200).json({
      success: true,
      message: "ROPA approved successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Approve ROPA failed", err.message);
  }
};

// PATCH /api/dpo/ropa/:activity_id/reject
// DPO reject ROPA
export const rejectRopa = async (req, res) => {
  try {
    const activityId = getActivityId(req);
    const reviewerId = getReviewerId(req);
    const { reason } = req.body;

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    if (!String(reason || "").trim()) {
      return sendError(res, 400, "reason is required");
    }

    const updateData = {
      approval_status: "rejected",
      updated_at: new Date().toISOString(),
    };

    if (reviewerId) {
      updateData.updated_by = reviewerId;
    }

    const { data, error } = await supabase
      .from("activities")
      .update(updateData)
      .eq("activity_id", activityId)
      .select(ROPA_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Reject ROPA failed", error.message);
    }

    await upsertDpoApproval({
      activityId,
      userId: reviewerId || data.user_id,
      status: "rejected",
      comment: String(reason || "").trim(),
    });

    return res.status(200).json({
      success: true,
      message: "ROPA rejected successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Reject ROPA failed", err.message);
  }
};