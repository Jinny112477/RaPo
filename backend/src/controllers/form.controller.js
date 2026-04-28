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
  obtaining_method_detail:obtaining_method(*),
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  minor_consent:minor_consent_id(*),
  policy:policy_id(*),
  security_measurement:security_measurement_id(*),
  international_transfers(*)
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
  obtaining_method_detail:obtaining_method(*),
  source:source_id(*),
  legal_basis:legal_basis_id(*),
  policy:policy_id(*)
`;

const sendError = (res, status, message, detail = null) => {
  if (status >= 500) console.error(message, detail);

  return res.status(status).json({
    success: false,
    error: message,
    ...(detail ? { detail } : {}),
  });
};

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

const joinArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value;
};

const toNullable = (value) => {
  const finalValue = joinArray(value);
  if (finalValue === undefined || finalValue === null || finalValue === "") return null;
  return finalValue;
};

const toOptional = (value) => {
  const finalValue = joinArray(value);
  if (finalValue === undefined || finalValue === null || finalValue === "") return undefined;
  return finalValue;
};

const toRequiredText = (value, fallback = "-") => {
  const finalValue = joinArray(value);
  if (finalValue === undefined || finalValue === null || finalValue === "") return fallback;
  return finalValue;
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

const normalize = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()（）/,-]/g, "")
    .trim();
};

const getActivityId = (req) => {
  return req.params.activity_id || req.query.activity_id || req.body.activity_id;
};

const getUserId = (body) => {
  return body.userId || body.user_id || body.created_by || body.updated_by;
};

const getFirstSub = (body) => {
  if (Array.isArray(body.subs) && body.subs.length > 0) return body.subs[0];
  if (Array.isArray(body.subActivities) && body.subActivities.length > 0) return body.subActivities[0];
  return body;
};

const getActivityName = (body) => {
  return body.mainActivity || body.activityName || body.activity_name;
};

const getActivitySubject = (body) => {
  if (body.activity_subject) return body.activity_subject;
  if (body.ownerName) return body.ownerName;
  if (body.processorName) return body.processorName;
  if (body.dataOwner) return body.dataOwner;
  if (body.companyName) return body.companyName;
  if (body.department) return body.department;
  return null;
};

const getPurpose = (body, sub) => {
  return body.purpose || sub.purpose;
};

const getSourceName = (body, sub) => {
  return (
    body.sourceFromOwner ||
    body.source_name ||
    sub.sourceFromOwner ||
    body.dataOwner ||
    body.companyName ||
    "จากเจ้าของข้อมูลโดยตรง"
  );
};

const getRetentionPeriod = (body, sub) => {
  if (body.retentionPeriod) return body.retentionPeriod;
  if (sub.retentionPeriod) return sub.retentionPeriod;

  const value = body.retentionValue;
  const unit = body.retentionUnit;
  const criteria = body.retentionCriteria;

  return [value, unit, criteria].filter(Boolean).join(" - ");
};

const getLegalBasisInput = (body, sub) => {
  return body.legal_basis_id || body.legalBasis || sub.legalBasis;
};

const getObtainingDataInput = (body, sub) => {
  return body.obtaining_data_id || body.personalDataItems || body.personalDataTypes || sub.personalDataItems || sub.personalDataTypes;
};

const getObtainingMethodInput = (body, sub) => {
  return body.obtaining_method || body.obtaining_method_id || body.collectionMethod || body.collectionMethods || sub.collectionMethod || sub.collectionMethods;
};

const keywordHints = {
  legalBasis: [
    { keys: ["consent", "ความยินยอม"], value: "ฐานความยินยอม (Consent)" },
    { keys: ["contract", "สัญญา"], value: "ฐานสัญญา (Contract)" },
    { keys: ["legalobligation", "กฎหมาย", "หน้าที่ตามกฎหมาย"], value: "ฐานหน้าที่ตามกฎหมาย (Legal Obligation)" },
    { keys: ["vital", "ชีวิต"], value: "ฐานประโยชน์สำคัญต่อชีวิต (Vital Interest)" },
    { keys: ["publictask", "สาธารณะ"], value: "ฐานภารกิจสาธารณะ (Public Task)" },
    { keys: ["legitimate", "ชอบด้วยกฎหมาย"], value: "ฐานประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)" },
  ],
  obtainingData: [
    { keys: ["ชื่อ", "นามสกุล", "ระบุตัวตน"], value: "ชื่อ-นามสกุล" },
    { keys: ["email", "อีเมล"], value: "อีเมล" },
    { keys: ["โทร", "เบอร์"], value: "เบอร์โทรศัพท์" },
    { keys: ["ประชาชน"], value: "เลขบัตรประชาชน" },
    { keys: ["การเงิน", "เงินเดือน", "บัญชี"], value: "ข้อมูลทางการเงิน" },
    { keys: ["สุขภาพ"], value: "ข้อมูลสุขภาพ" },
    { keys: ["ชีวภาพ", "ลายนิ้วมือ", "ใบหน้า"], value: "ข้อมูลชีวภาพ" },
    { keys: ["วันเดือนปีเกิด", "เกิด"], value: "วันเดือนปีเกิด" },
    { keys: ["ภาพเคลื่อนไหว", "วิดีโอ"], value: "ภาพเคลื่อนไหว/วิดีโอ" },
    { keys: ["ภาพ", "รูป"], value: "ภาพถ่าย" },
    { keys: ["ip"], value: "IP Address" },
    { keys: ["cookie"], value: "Cookie" },
  ],
  obtainingMethod: [
    { keys: ["hardcopy", "กระดาษ", "เอกสาร"], value: "Hard Copy (เอกสารกระดาษ)" },
    { keys: ["softfile", "ออนไลน์", "ระบบ", "api", "crm", "hr", "อิเล็กทรอนิกส์"], value: "Soft File (ไฟล์อิเล็กทรอนิกส์)" },
  ],
};

const getHintValue = (fieldName, rawValue) => {
  const selectedValue = normalize(rawValue);
  const hints = keywordHints[fieldName] || [];

  const found = hints.find((hint) =>
    hint.keys.some((key) => selectedValue.includes(normalize(key)))
  );

  return found?.value;
};

const findLookupId = async (config, value, fieldName) => {
  const selectedValue = firstValue(value);

  if (selectedValue === undefined || selectedValue === null || selectedValue === "") {
    return undefined;
  }

  if (isUuid(selectedValue)) return selectedValue;

  const { data: rows, error } = await supabase
    .from(config.table)
    .select(`${config.idColumn}, ${config.nameColumn}`);

  if (error) throw new Error(`${fieldName} lookup failed: ${error.message}`);

  const selectedNormalized = normalize(selectedValue);

  let matched = rows.find((row) => normalize(row[config.nameColumn]) === selectedNormalized);

  if (!matched) {
    matched = rows.find((row) => {
      const rowName = normalize(row[config.nameColumn]);
      return selectedNormalized.includes(rowName) || rowName.includes(selectedNormalized);
    });
  }

  if (!matched) {
    const hintedName = getHintValue(fieldName, selectedValue);
    matched = rows.find((row) => normalize(row[config.nameColumn]) === normalize(hintedName));
  }

  if (!matched) {
    throw new Error(`${fieldName} not found: ${selectedValue}`);
  }

  return matched[config.idColumn];
};

const resolveLookupIds = async (body, sub) => {
  const legalBasisId = await findLookupId(
    LOOKUP_TABLES.legalBasis,
    getLegalBasisInput(body, sub),
    "legalBasis"
  );

  const obtainingDataId = await findLookupId(
    LOOKUP_TABLES.obtainingData,
    getObtainingDataInput(body, sub),
    "obtainingData"
  );

  const obtainingMethodId = await findLookupId(
    LOOKUP_TABLES.obtainingMethod,
    getObtainingMethodInput(body, sub),
    "obtainingMethod"
  );

  return {
    legal_basis_id: legalBasisId,
    obtaining_data_id: obtainingDataId,
    obtaining_method: obtainingMethodId,
  };
};

const buildFormPayload = async (body, mode = "create") => {
  const sub = getFirstSub(body);
  const finalUserId = getUserId(body);
  const lookupIds = await resolveLookupIds(body, sub);
  const value = mode === "create" ? toNullable : toOptional;

  return {
    finalUserId,

    source: {
      name: mode === "create" ? toRequiredText(getSourceName(body, sub)) : toOptional(getSourceName(body, sub)),
    },

    minorConsent: {
      more_than_10_year: value(body.minorConsentUnder10 || sub.minorConsentUnder10),
      between_10_to_20: value(body.minorConsentAge10to20 || sub.minorConsentAge10to20),
    },

    policy: {
      data_type: value(body.storageType || body.personalDataTypes || sub.storageType || sub.dataType),
      storage_method: value(body.storageMethod || sub.storageMethod),
      retention_period: value(getRetentionPeriod(body, sub)),
      access_method: value(body.accessRights || sub.accessRights),
      deletion_method: value(body.deletionMethod || body.deletionMethods || sub.deletionMethod),
    },

    security: {
      organizational_measures: value(body.secOrg),
      technical_measures: value(body.secTech),
      physical_measures: value(body.secPhysical),
      access_control: value(body.secAccess),
      define_responsibility: value(body.secUser || body.secResponsibility),
      audit_trail: value(body.secAudit),
    },

    activity: {
      user_id: mode === "create" ? finalUserId : undefined,
      activity_name: value(getActivityName(body)),
      activity_subject: value(getActivitySubject(body)),
      purpose: value(getPurpose(body, sub)),

      obtaining_data_id: lookupIds.obtaining_data_id,
      obtaining_method: lookupIds.obtaining_method,
      legal_basis_id: lookupIds.legal_basis_id,

      consentless_data:
        mode === "create"
          ? toRequiredText(body.exemptDisclosure || sub.exemptDisclosure)
          : toOptional(body.exemptDisclosure || sub.exemptDisclosure),

      denial_details:
        mode === "create"
          ? toRequiredText(body.rightsDenial || sub.rightsDenial)
          : toOptional(body.rightsDenial || sub.rightsDenial),

      approval_status: body.approval_status || (mode === "create" ? "pending" : undefined),
      created_by: mode === "create" ? finalUserId : undefined,
      updated_by: finalUserId,
    },

    internationalTransfer: {
      is_transfer: (body.transferAbroad || sub.transferAbroad) === "มี",
      destination: value(body.transferCountry || sub.transferCountry),
      affiliate_name: value(body.transferAffiliateCompany || sub.transferAffiliateCompany),
      transfer_method: value(body.transferMethod || sub.transferMethod),
      destination_data_policies: value(body.transferStandard || sub.transferStandard),
      exceptions: value(body.transferException28 || sub.transferException28),
    },
  };
};

const validateCreatePayload = (payload) => {
  const errors = [];

  if (!payload.finalUserId) errors.push("userId is required");
  if (!payload.activity.activity_name) errors.push("activityName/mainActivity is required");
  if (!payload.activity.activity_subject) errors.push("activity subject is required");
  if (!payload.activity.purpose) errors.push("purpose is required");
  if (!payload.activity.legal_basis_id) errors.push("legalBasis is required");
  if (!payload.activity.obtaining_data_id) errors.push("personal data is required");
  if (!payload.activity.obtaining_method) errors.push("collection method is required");
  if (!payload.source.name) errors.push("source is required");

  return errors;
};

const insertRelatedTables = async (payload) => {
  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert(payload.source)
    .select("source_id")
    .single();

  if (sourceError) throw new Error(`sources: ${sourceError.message}`);

  const { data: minorConsent, error: minorConsentError } = await supabase
    .from("minor_consent")
    .insert(payload.minorConsent)
    .select("minor_consent_id")
    .single();

  if (minorConsentError) throw new Error(`minor_consent: ${minorConsentError.message}`);

  const { data: policy, error: policyError } = await supabase
    .from("policies")
    .insert(payload.policy)
    .select("policy_id")
    .single();

  if (policyError) throw new Error(`policies: ${policyError.message}`);

  const { data: security, error: securityError } = await supabase
    .from("security_measurement")
    .insert(payload.security)
    .select("security_measurement_id")
    .single();

  if (securityError) throw new Error(`security_measurement: ${securityError.message}`);

  return {
    source_id: source.source_id,
    minor_consent_id: minorConsent.minor_consent_id,
    policy_id: policy.policy_id,
    security_measurement_id: security.security_measurement_id,
  };
};

const insertInternationalTransfer = async (activityId, payload) => {
  const { error } = await supabase.from("international_transfers").insert({
    activity_id: activityId,
    ...payload.internationalTransfer,
  });

  if (error) throw new Error(`international_transfers: ${error.message}`);
};

const updateRelatedTable = async (table, idColumn, id, data) => {
  if (!id) return;

  const cleanData = cleanObject(data);
  if (Object.keys(cleanData).length === 0) return;

  const { error } = await supabase.from(table).update(cleanData).eq(idColumn, id);
  if (error) throw new Error(`${table}: ${error.message}`);
};

const upsertInternationalTransfer = async (activityId, payload) => {
  const { data: existing, error: findError } = await supabase
    .from("international_transfers")
    .select("international_transfer_id")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (findError) throw new Error(`international_transfers: ${findError.message}`);

  const data = cleanObject({ activity_id: activityId, ...payload.internationalTransfer });

  if (existing?.international_transfer_id) {
    const { error } = await supabase
      .from("international_transfers")
      .update(data)
      .eq("international_transfer_id", existing.international_transfer_id);
    if (error) throw new Error(`international_transfers: ${error.message}`);
    return;
  }

  const { error } = await supabase.from("international_transfers").insert(data);
  if (error) throw new Error(`international_transfers: ${error.message}`);
};

const deleteRelatedTable = async (table, idColumn, id) => {
  if (!id) return;

  const { error } = await supabase.from(table).delete().eq(idColumn, id);
  if (error) throw new Error(`${table}: ${error.message}`);
};

export const createForm = async (req, res) => {
  try {
    const payload = await buildFormPayload(req.body, "create");
    const errors = validateCreatePayload(payload);

    if (errors.length > 0) return sendError(res, 400, "Invalid form data", errors);

    const relatedIds = await insertRelatedTables(payload);

    const { data, error } = await supabase
      .from("activities")
      .insert({ ...payload.activity, ...relatedIds })
      .select("activity_id")
      .single();

    if (error) return sendError(res, 500, "Create activity failed", error.message);

    await insertInternationalTransfer(data.activity_id, payload);

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      activity_id: data.activity_id,
    });
  } catch (err) {
    return sendError(res, 500, "Create form failed", err.message);
  }
};

export const getForms = async (req, res) => {
  try {
    const { user_id, status, search } = req.query;

    let query = supabase
      .from("activities")
      .select(LIST_SELECT)
      .order("created_at", { ascending: false });

    if (user_id) query = query.eq("user_id", user_id);
    if (status && status !== "ALL") query = query.eq("approval_status", status);
    if (search) query = query.ilike("activity_name", `%${search}%`);

    const { data, error } = await query;
    if (error) return sendError(res, 500, "Fetch forms failed", error.message);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return sendError(res, 500, "Fetch forms failed", err.message);
  }
};

export const getFormById = async (req, res) => {
  try {
    const activityId = getActivityId(req);
    if (!activityId) return sendError(res, 400, "activity_id is required");

    const { data, error } = await supabase
      .from("activities")
      .select(FORM_SELECT)
      .eq("activity_id", activityId)
      .single();

    if (error) return sendError(res, 404, "Activity not found", error.message);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return sendError(res, 500, "Fetch form failed", err.message);
  }
};

export const updateForm = async (req, res) => {
  try {
    const activityId = getActivityId(req);
    if (!activityId) return sendError(res, 400, "activity_id is required");

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

    if (findError) return sendError(res, 404, "Activity not found", findError.message);

    const payload = await buildFormPayload(req.body, "update");

    await updateRelatedTable("sources", "source_id", oldActivity.source_id, payload.source);
    await updateRelatedTable("minor_consent", "minor_consent_id", oldActivity.minor_consent_id, payload.minorConsent);
    await updateRelatedTable("policies", "policy_id", oldActivity.policy_id, payload.policy);
    await updateRelatedTable("security_measurement", "security_measurement_id", oldActivity.security_measurement_id, payload.security);
    await upsertInternationalTransfer(activityId, payload);

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

    if (error) return sendError(res, 500, "Update form failed", error.message);

    return res.status(200).json({ success: true, message: "Form updated successfully", data });
  } catch (err) {
    return sendError(res, 500, "Update form failed", err.message);
  }
};

export const deleteForm = async (req, res) => {
  try {
    const activityId = getActivityId(req);
    if (!activityId) return sendError(res, 400, "activity_id is required");

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

    if (findError) return sendError(res, 404, "Activity not found", findError.message);

    const { error: deleteTransferError } = await supabase
      .from("international_transfers")
      .delete()
      .eq("activity_id", activityId);

    if (deleteTransferError) return sendError(res, 500, "Delete transfer failed", deleteTransferError.message);

    const { error: deleteActivityError } = await supabase
      .from("activities")
      .delete()
      .eq("activity_id", activityId);

    if (deleteActivityError) return sendError(res, 500, "Delete activity failed", deleteActivityError.message);

    await deleteRelatedTable("sources", "source_id", activity.source_id);
    await deleteRelatedTable("minor_consent", "minor_consent_id", activity.minor_consent_id);
    await deleteRelatedTable("policies", "policy_id", activity.policy_id);
    await deleteRelatedTable("security_measurement", "security_measurement_id", activity.security_measurement_id);

    return res.status(200).json({
      success: true,
      message: "Form deleted successfully",
      activity_id: activityId,
    });
  } catch (err) {
    return sendError(res, 500, "Delete form failed", err.message);
  }
};

export const submitRopaForm = createForm;
export const fetchAllForms = getForms;
export const fetchForm = getFormById;
