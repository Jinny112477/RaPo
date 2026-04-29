import { supabase } from "../lib/supabaseClient.js";

const APPROVED_ROPA_SELECT = `
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

const ACCESS_REQUEST_SELECT = `
  *,
  requester:requested_by(
    user_id,
    name,
    email
  ),
  approver:approve_by(
    user_id,
    name,
    email
  ),
  activity:activity_id(
    activity_id,
    activity_name,
    activity_subject,
    purpose,
    approval_status,
    source:source_id(*),
    legal_basis:legal_basis_id(*),
    obtaining_data:obtaining_data_id(*),
    obtaining_method_detail:obtaining_method(*),
    policy:policy_id(*)
  )
`;

const sendError = (res, status, message, detail = null) => {
  if (status >= 500) console.error(message, detail);

  return res.status(status).json({
    success: false,
    error: message,
    ...(detail ? { detail } : {}),
  });
};

const getUserId = (req) => {
  return (
    req.body.userId ||
    req.body.user_id ||
    req.body.requested_by ||
    req.query.user_id
  );
};

const getApproverId = (req) => {
  return (
    req.body.userId ||
    req.body.user_id ||
    req.body.approve_by ||
    req.query.user_id
  );
};

// GET /api/access/available
// Processor / DP ดู ROPA ที่ DPO approved แล้ว
export const getAvailableRopa = async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from("activities")
      .select(APPROVED_ROPA_SELECT)
      .eq("approval_status", "approved")
      .order("updated_at", { ascending: false });

    if (search) {
      query = query.ilike("activity_name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return sendError(res, 500, "Fetch available ROPA failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch available ROPA failed", err.message);
  }
};

// POST /api/access/request
// Processor / DP ขอใช้ข้อมูลจาก ROPA ที่ approved แล้ว
export const createAccessRequest = async (req, res) => {
  try {
    const {
      activity_id,
      purpose,
      scope,
      duration,
      processor_name,
      processor_address,
    } = req.body;
    const requestedBy = getUserId(req);

    if (!activity_id) {
      return sendError(res, 400, "activity_id is required");
    }

    if (!requestedBy) {
      return sendError(res, 400, "requested_by is required");
    }

    if (!purpose || !purpose.trim()) {
      return sendError(res, 400, "purpose is required");
    }

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("activity_id, approval_status")
      .eq("activity_id", activity_id)
      .single();

    if (activityError || !activity) {
      return sendError(res, 404, "ROPA not found", activityError?.message);
    }

    if (activity.approval_status !== "approved") {
      return sendError(res, 400, "This ROPA is not approved yet");
    }

    const { data: existing, error: existingError } = await supabase
      .from("access_requests")
      .select("request_id, approval_status")
      .eq("activity_id", activity_id)
      .eq("requested_by", requestedBy)
      .maybeSingle();

    if (existingError) {
      return sendError(res, 500, "Check existing request failed", existingError.message);
    }

    if (existing) {
      return sendError(res, 409, "You already requested access to this ROPA", {
        request_id: existing.request_id,
        approval_status: existing.approval_status,
      });
    }

    const { data, error } = await supabase
      .from("access_requests")
      .insert({
        activity_id,
        requested_by: requestedBy,
        purpose,
        scope: scope || null,
        duration: duration || null,
        processor_name: processor_name || null,
        processor_address: processor_address || null,
        approval_status: "pending",
      })
      .select(ACCESS_REQUEST_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Create access request failed", error.message);
    }

    return res.status(201).json({
      success: true,
      message: "Access request created successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Create access request failed", err.message);
  }
};

// GET /api/access/my-requests?user_id=...
// ผู้ขอดูคำขอ access ของตัวเอง
export const getMyAccessRequests = async (req, res) => {
  try {
    const requestedBy = getUserId(req);

    if (!requestedBy) {
      return sendError(res, 400, "user_id is required");
    }

    const { data, error } = await supabase
      .from("access_requests")
      .select(ACCESS_REQUEST_SELECT)
      .eq("requested_by", requestedBy)
      .order("created_at", { ascending: false });

    if (error) {
      return sendError(res, 500, "Fetch my access requests failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch my access requests failed", err.message);
  }
};

// GET /api/access/pending
// DPO ดูคำขอ access ที่รอตรวจ
export const getPendingAccessRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("access_requests")
      .select(ACCESS_REQUEST_SELECT)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return sendError(res, 500, "Fetch pending access requests failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch pending access requests failed", err.message);
  }
};

// GET /api/access
// ดู access request ทั้งหมด หรือ filter ด้วย status ได้
export const getAllAccessRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from("access_requests")
      .select(ACCESS_REQUEST_SELECT)
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("approval_status", status);
    }

    const { data, error } = await query;

    if (error) {
      return sendError(res, 500, "Fetch access requests failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch access requests failed", err.message);
  }
};

// PATCH /api/access/:request_id/approve
// DPO อนุมัติคำขอ access
export const approveAccessRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const approveBy = getApproverId(req);

    if (!request_id) {
      return sendError(res, 400, "request_id is required");
    }

    const updateData = {
      approval_status: "approved",
      updated_at: new Date().toISOString(),
    };

    if (approveBy) {
      updateData.approve_by = approveBy;
    }

    const { data, error } = await supabase
      .from("access_requests")
      .update(updateData)
      .eq("request_id", request_id)
      .select(ACCESS_REQUEST_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Approve access request failed", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Access request approved successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Approve access request failed", err.message);
  }
};

// PATCH /api/access/:request_id/reject
// DPO ปฏิเสธคำขอ access
export const rejectAccessRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const approveBy = getApproverId(req);

    if (!request_id) {
      return sendError(res, 400, "request_id is required");
    }

    const updateData = {
      approval_status: "rejected",
      updated_at: new Date().toISOString(),
    };

    if (approveBy) {
      updateData.approve_by = approveBy;
    }

    const { data, error } = await supabase
      .from("access_requests")
      .update(updateData)
      .eq("request_id", request_id)
      .select(ACCESS_REQUEST_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Reject access request failed", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Access request rejected successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Reject access request failed", err.message);
  }
};

// GET /api/access/:request_id
export const getAccessRequestById = async (req, res) => {
  try {
    const { request_id } = req.params;

    if (!request_id) {
      return sendError(res, 400, "request_id is required");
    }

    const { data, error } = await supabase
      .from("access_requests")
      .select(ACCESS_REQUEST_SELECT)
      .eq("request_id", request_id)
      .single();

    if (error) {
      return sendError(res, 404, "Access request not found", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch access request failed", err.message);
  }
};

// PUT /api/access/:request_id
export const updateAccessRequest = async (req, res) => {
  try {
    const { request_id } = req.params;
    const {
      purpose,
      scope,
      duration,
      approval_status,
      processor_name,
      processor_address,
    } = req.body;

    if (!request_id) {
      return sendError(res, 400, "request_id is required");
    }

    const updateData = {
      ...(purpose !== undefined ? { purpose } : {}),
      ...(scope !== undefined ? { scope } : {}),
      ...(duration !== undefined ? { duration } : {}),
      ...(processor_name !== undefined ? { processor_name } : {}),
      ...(processor_address !== undefined ? { processor_address } : {}),
      ...(approval_status !== undefined ? { approval_status } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("access_requests")
      .update(updateData)
      .eq("request_id", request_id)
      .select(ACCESS_REQUEST_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Update access request failed", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Access request updated successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Update access request failed", err.message);
  }
};

// DELETE /api/access/:request_id
export const deleteAccessRequest = async (req, res) => {
  try {
    const { request_id } = req.params;

    if (!request_id) {
      return sendError(res, 400, "request_id is required");
    }

    const { error } = await supabase
      .from("access_requests")
      .delete()
      .eq("request_id", request_id);

    if (error) {
      return sendError(res, 500, "Delete access request failed", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Access request deleted successfully",
      request_id,
    });
  } catch (err) {
    return sendError(res, 500, "Delete access request failed", err.message);
  }
};