import { supabase } from "../lib/supabaseClient.js";

const LOOKUP_TABLES = {
  legalBasis: {
    table: "legal_basis",
    idColumn: "legal_basis_id",
    nameColumn: "name",
  },
  obtainingData: {
    table: "obtaining_data",
    idColumn: "obtaining_data_id",
    nameColumn: "name",
  },
  obtainingMethod: {
    table: "obtaining_method",
    idColumn: "obtaining_method_id",
    nameColumn: "name",
  },
};

const FORM_SELECT = `
  *,
  obtaining_data:obtaining_data_id(*),
  obtaining_method_data:obtaining_method(*),
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  minor_consent:minor_consent_id(*),
  policy:policy_id(*),
  security_measurement:security_measurement_id(*)
`;

const LIST_SELECT = `
  activity_id,
  user_id,
  activity_name,
  activity_subject,
  purpose,
  approval_status,
  created_at,
  updated_at,
  obtaining_data:obtaining_data_id(*),
  obtaining_method_data:obtaining_method(*),
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  policy:policy_id(*)
`;

const sendError = (res, status, message, detail = null) => {
  return res.status(status).json({
    success: false,
    error: message,
    ...(detail ? { detail } : {}),
  });
};

const firstValue = (value) => {
  return Array.isArray(value) ? value[0] : value;
};

const toNullable = (value) => {
  if (value === undefined || value === "") return null;
  return value;
};

const toOptional = (value) => {
  if (value === undefined || value === "") return undefined;
  return value;
};

const toText = (value) => {
  if (value === undefined || value === null) return "";
  return value;
};

const joinArray = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value;
};

const cleanObject = (object) => {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  );
};

const isUuid = (value) => {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value)
  );
};

const getActivityId = (req) => {
  return req.params.activity_id || req.query.activity_id || req.body.activity_id;
};

const findLookupId = async (config, value, fieldName) => {
  const selectedValue = firstValue(value);

  if (selectedValue === undefined || selectedValue === "") {
    return undefined;
  }

  if (isUuid(selectedValue)) {
    return selectedValue;
  }

  const { data, error } = await supabase
    .from(config.table)
    .select(config.idColumn)
    .eq(config.nameColumn, selectedValue)
    .single();

  if (error || !data) {
    throw new Error(`${fieldName} not found: ${selectedValue}`);
  }

  return data[config.idColumn];
};

const resolveLookupIds = async (body) => {
  const legalBasisId =
    body.legal_basis_id ||
    (await findLookupId(
      LOOKUP_TABLES.legalBasis,
      body.legalBasis,
      "legalBasis"
    ));

  const obtainingDataId =
    body.obtaining_data_id ||
    (await findLookupId(
      LOOKUP_TABLES.obtainingData,
      body.personalDataItems,
      "personalDataItems"
    ));

  const obtainingMethodId =
    body.obtaining_method ||
    body.obtaining_method_id ||
    (await findLookupId(
      LOOKUP_TABLES.obtainingMethod,
      body.collectionMethod,
      "collectionMethod"
    ));

  return {
    legal_basis_id: legalBasisId,
    obtaining_data_id: obtainingDataId,
    obtaining_method: obtainingMethodId,
  };
};

const getActivitySubject = (body) => {
  if (body.activity_subject) return body.activity_subject;

  if (body.formType === "controller") {
    return body.ownerName;
  }

  if (body.formType === "processor") {
    return body.processorName;
  }

  return body.ownerName || body.processorName;
};

const buildFormPayload = async (body, mode = "create") => {
  const finalUserId = body.userId || body.user_id;
  const lookupIds = await resolveLookupIds(body);

  const value = mode === "create" ? toNullable : toOptional;

  return {
    finalUserId,

    source: {
      name: value(body.sourceFromOwner || body.source_name),
    },

    minorConsent: {
      more_than_10_year: value(body.minorConsentUnder10),
      between_10_to_20: value(body.minorConsentAge10to20),
    },

    policy: {
      data_type: value(joinArray(body.storageType)),
      storage_method: value(body.storageMethod),
      retention_period: value(body.retentionPeriod),
      access_method: value(body.accessRights),
      deletion_method: value(body.deletionMethod),
    },

    security: {
      organizational_measures: value(body.secOrg),
      technical_measures: value(body.secTech),
      physical_measures: value(body.secPhysical),
      access_control: value(body.secAccess),
      define_responsibility: value(body.secUser),
      audit_trail: value(body.secAudit),
    },

    activity: {
      user_id: mode === "create" ? finalUserId : undefined,
      activity_name: value(body.mainActivity || body.activity_name),
      activity_subject: value(getActivitySubject(body)),
      purpose: value(body.purpose),

      obtaining_data_id: lookupIds.obtaining_data_id,
      obtaining_method: lookupIds.obtaining_method,
      legal_basis_id: lookupIds.legal_basis_id,

      consentless_data:
        mode === "create" ? toText(body.exemptDisclosure) : toOptional(body.exemptDisclosure),

      denial_details:
        mode === "create" ? toText(body.rightsDenial) : toOptional(body.rightsDenial),

      approval_status: body.approval_status || (mode === "create" ? "pending" : undefined),

      created_by: mode === "create" ? finalUserId : undefined,
      updated_by: finalUserId,
    },
  };
};

const validateCreatePayload = (payload) => {
  const errors = [];

  if (!payload.finalUserId) errors.push("userId is required");
  if (!payload.activity.activity_name) errors.push("mainActivity is required");
  if (!payload.activity.activity_subject) errors.push("activity_subject is required");
  if (!payload.activity.purpose) errors.push("purpose is required");

  if (!payload.activity.legal_basis_id) {
    errors.push("legalBasis is required");
  }

  if (!payload.activity.obtaining_data_id) {
    errors.push("personalDataItems is required");
  }

  if (!payload.activity.obtaining_method) {
    errors.push("collectionMethod is required");
  }

  if (!payload.source.name) {
    errors.push("sourceFromOwner is required");
  }

  return errors;
};

const insertRelatedTables = async (payload) => {
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert(payload.source)
    .select("source_id")
    .single();

  if (sourceError) {
    throw new Error(`sources: ${sourceError.message}`);
  }

  const { data: minorConsent, error: minorConsentError } = await supabase
    .from("minor_consent")
    .insert(payload.minorConsent)
    .select("minor_consent_id")
    .single();

  if (minorConsentError) {
    throw new Error(`minor_consent: ${minorConsentError.message}`);
  }

  const { data: policy, error: policyError } = await supabase
    .from("policies")
    .insert(payload.policy)
    .select("policy_id")
    .single();

  if (policyError) {
    throw new Error(`policies: ${policyError.message}`);
  }

  const { data: security, error: securityError } = await supabase
    .from("security_measurement")
    .insert(payload.security)
    .select("security_measurement_id")
    .single();

  if (securityError) {
    throw new Error(`security_measurement: ${securityError.message}`);
  }

  return {
    source_id: source.source_id,
    minor_consent_id: minorConsent.minor_consent_id,
    policy_id: policy.policy_id,
    security_measurement_id: security.security_measurement_id,
  };
};

const updateRelatedTable = async (table, idColumn, id, data) => {
  if (!id) return;

  const cleanData = cleanObject(data);

  if (Object.keys(cleanData).length === 0) return;

  const { error } = await supabase
    .from(table)
    .update(cleanData)
    .eq(idColumn, id);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
};

const deleteRelatedTable = async (table, idColumn, id) => {
  if (!id) return;

  const { error } = await supabase
    .from(table)
    .delete()
    .eq(idColumn, id);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
};

// CREATE
export const createForm = async (req, res) => {
  try {
    const payload = await buildFormPayload(req.body, "create");
    const errors = validateCreatePayload(payload);

    if (errors.length > 0) {
      return sendError(res, 400, "Invalid form data", errors);
    }

    const relatedIds = await insertRelatedTables(payload);

    const { data, error } = await supabase
      .from("activities")
      .insert({
        ...payload.activity,
        ...relatedIds,
      })
      .select("activity_id")
      .single();

    if (error) {
      return sendError(res, 500, "Create activity failed", error.message);
    }

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      activity_id: data.activity_id,
    });
  } catch (err) {
    return sendError(res, 500, "Create form failed", err.message);
  }
};

// READ ALL
export const getForms = async (req, res) => {
  try {
    const { user_id, status, search } = req.query;

    let query = supabase
      .from("activities")
      .select(LIST_SELECT)
      .order("created_at", { ascending: false });

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (status && status !== "ALL") {
      query = query.eq("approval_status", status);
    }

    if (search) {
      query = query.ilike("activity_name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return sendError(res, 500, "Fetch forms failed", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch forms failed", err.message);
  }
};

// READ ONE
export const getFormById = async (req, res) => {
  try {
    const activityId = getActivityId(req);

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    const { data, error } = await supabase
      .from("activities")
      .select(FORM_SELECT)
      .eq("activity_id", activityId)
      .single();

    if (error) {
      return sendError(res, 404, "Activity not found", error.message);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Fetch form failed", err.message);
  }
};

// UPDATE
export const updateForm = async (req, res) => {
  try {
    const activityId = getActivityId(req);

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    const { data: oldActivity, error: findError } = await supabase
      .from("activities")
      .select(`
        activity_id,
        user_id,
        source_id,
        minor_consent_id,
        policy_id,
        security_measurement_id
      `)
      .eq("activity_id", activityId)
      .single();

    if (findError) {
      return sendError(res, 404, "Activity not found", findError.message);
    }

    const payload = await buildFormPayload(req.body, "update");

    await updateRelatedTable(
      "sources",
      "source_id",
      oldActivity.source_id,
      payload.source
    );

    await updateRelatedTable(
      "minor_consent",
      "minor_consent_id",
      oldActivity.minor_consent_id,
      payload.minorConsent
    );

    await updateRelatedTable(
      "policies",
      "policy_id",
      oldActivity.policy_id,
      payload.policy
    );

    await updateRelatedTable(
      "security_measurement",
      "security_measurement_id",
      oldActivity.security_measurement_id,
      payload.security
    );

    const activityUpdate = cleanObject({
      activity_name: payload.activity.activity_name,
      activity_subject: payload.activity.activity_subject,
      purpose: payload.activity.purpose,

      obtaining_data_id: payload.activity.obtaining_data_id,
      obtaining_method: payload.activity.obtaining_method,
      legal_basis_id: payload.activity.legal_basis_id,

      consentless_data: payload.activity.consentless_data,
      denial_details: payload.activity.denial_details,

      approval_status: payload.activity.approval_status,
      updated_by: payload.finalUserId || oldActivity.user_id,
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from("activities")
      .update(activityUpdate)
      .eq("activity_id", activityId)
      .select(FORM_SELECT)
      .single();

    if (error) {
      return sendError(res, 500, "Update form failed", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data,
    });
  } catch (err) {
    return sendError(res, 500, "Update form failed", err.message);
  }
};

// DELETE
export const deleteForm = async (req, res) => {
  try {
    const activityId = getActivityId(req);

    if (!activityId) {
      return sendError(res, 400, "activity_id is required");
    }

    const { data: activity, error: findError } = await supabase
      .from("activities")
      .select(`
        activity_id,
        source_id,
        minor_consent_id,
        policy_id,
        security_measurement_id
      `)
      .eq("activity_id", activityId)
      .single();

    if (findError) {
      return sendError(res, 404, "Activity not found", findError.message);
    }

    const { error: deleteActivityError } = await supabase
      .from("activities")
      .delete()
      .eq("activity_id", activityId);

    if (deleteActivityError) {
      return sendError(
        res,
        500,
        "Delete activity failed",
        deleteActivityError.message
      );
    }

    await deleteRelatedTable("sources", "source_id", activity.source_id);

    await deleteRelatedTable(
      "minor_consent",
      "minor_consent_id",
      activity.minor_consent_id
    );

    await deleteRelatedTable("policies", "policy_id", activity.policy_id);

    await deleteRelatedTable(
      "security_measurement",
      "security_measurement_id",
      activity.security_measurement_id
    );

    return res.status(200).json({
      success: true,
      message: "Form deleted successfully",
      activity_id: activityId,
    });
  } catch (err) {
    return sendError(res, 500, "Delete form failed", err.message);
  }
};

// ชื่อเก่า เผื่อ frontend เดิมยังเรียกอยู่
export const submitRopaForm = createForm;
export const fetchAllForms = getForms;
export const fetchForm = getFormById;