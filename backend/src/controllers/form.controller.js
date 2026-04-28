import { supabase } from "../lib/supabaseClient.js";

const LEGAL_BASIS_MAP = {
  'ฐานความยินยอม (Consent)':                           '943360f0-b31e-4cb1-9504-064ae6eae907',
  'ฐานภารกิจสาธารณะ (Public Task)':                    'a1596d1a-73be-4409-85ba-66df9a7bbe04',
  'ฐานหน้าที่ตามกฎหมาย (Legal Obligation)':            'a823ad68-bddf-482a-94d1-6b64b13b2638',
  'ฐานสัญญา (Contract)':                               'e1f0f5d9-2cd4-48bd-ab4d-8ca325e2ece7',
  'ฐานประโยชน์โดยชอบด้วยกฎหมาย (Legitimate Interest)': 'e565376f-040b-48a4-892d-d6e49f1518cd',
  'ฐานประโยชน์สำคัญต่อชีวิต (Vital Interest)':         'fdccff23-1185-4adb-bcc5-855e4d2cadef',
}

const OBTAINING_DATA_MAP = {
  'ข้อมูลทางการเงิน':     '06abf677-72c9-4034-baab-460b1f0cdf8c',
  'ชื่อ-นามสกุล':         '0cfcdf30-cc71-43aa-9465-6d3aaf88da5e',
  'Cookie':               '11ba90bb-8052-4eb4-aecc-c6b3acbe7a26',
  'วันเดือนปีเกิด':       '1520ad27-8418-4c88-bf31-4bf2002f147a',
  'ภาพถ่าย':              '308857db-bc70-4dcd-83ba-ae16c8222fc7',
  'ที่อยู่':              '316d45ad-c5f3-44e2-a8ca-01b8f249412b',
  'ข้อมูลสุขภาพ':         '38505b0b-c053-474f-ab6b-43cf6af4ccf1',
  'อีเมล':                '5183146a-7d23-4d59-a85d-070e76fcabfe',
  'คลิปสัมภาษณ์':         '66a1c3c1-3fd6-4039-ba3e-01907a818641',
  'เบอร์โทรศัพท์':        '96246362-e82e-41fa-b1bb-9c154b9c352a',
  'เลขบัตรประชาชน':       'a40c1dcf-58c0-4fc6-b7c2-e738ce90eb9b',
  'IP Address':           'b42f133f-38b1-4d6e-8141-9f3cc93ad646',
  'ภาพเคลื่อนไหว/วิดีโอ': 'ba0f1e8a-cd50-48e8-b51e-959e11aa1321',
  'ข้อมูลชีวภาพ':         'fd36327c-b20e-4639-a52e-310ff4740072',
}

const OBTAINING_METHOD_MAP = {
  'Hard Copy (เอกสารกระดาษ)':        '02ef4c4e-6cda-44dd-beb7-ec146bd4ee52',
  'Soft File (ไฟล์อิเล็กทรอนิกส์)': '9ad84748-b6d3-4edc-80ac-304f7df05576',
}

// POST: Ropa form
export const submitRopaForm = async (req, res) => {
  const {
    userId,
    formType,
    mainActivity,
    ownerName,
    processorName,
    purpose,
    personalDataItems,
    collectionMethod,
    legalBasis,
    sourceFromOwner,
    minorConsentUnder10,
    minorConsentAge10to20,
    storageType,
    storageMethod,
    retentionPeriod,
    accessRights,
    deletionMethod,
    exemptDisclosure,
    rightsDenial,
    secOrg,
    secTech,
    secPhysical,
    secAccess,
    secUser,
    secAudit,
  } = req.body

  if (!userId || !formType || !mainActivity || !purpose) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const obtainingDataId   = OBTAINING_DATA_MAP[personalDataItems?.[0]]
  const obtainingMethodId = OBTAINING_METHOD_MAP[collectionMethod?.[0]]
  const legalBasisId      = LEGAL_BASIS_MAP[legalBasis?.[0]]

  if (!obtainingDataId)   return res.status(400).json({ error: 'Invalid personalDataItems' })
  if (!obtainingMethodId) return res.status(400).json({ error: 'Invalid collectionMethod' })
  if (!legalBasisId)      return res.status(400).json({ error: 'Invalid legalBasis' })

  const [
    { data: source,   error: e1 },
    { data: minor,    error: e2 },
    { data: policy,   error: e3 },
    { data: security, error: e4 },
  ] = await Promise.all([

    supabase
      .from('sources')
      .insert({ name: sourceFromOwner })
      .select('source_id')
      .single(),

    supabase
      .from('minor_consent')
      .insert({
        more_than_10_year: minorConsentUnder10   || null,
        between_10_to_20:  minorConsentAge10to20 || null,
      })
      .select('minor_consent_id')
      .single(),

    supabase
      .from('policies')
      .insert({
        data_type:        storageType?.join(', ') || null,
        storage_method:   storageMethod           || null,
        retention_period: retentionPeriod         || null,
        access_method:    accessRights            || null,
        deletion_method:  deletionMethod          || null,
      })
      .select('policy_id')
      .single(),

    supabase
      .from('security_measurement')
      .insert({
        organizational_measures: secOrg      || null,
        technical_measures:     secTech     || null,
        physical_measures:       secPhysical || null,
        access_control:          secAccess   || null,
        define_responsibility:   secUser     || null,
        audit_trail:             secAudit    || null,
      })
      .select('security_measurement_id')
      .single(),
  ])

  if (e1) return res.status(500).json({ error: `sources: ${e1.message}` })
  if (e2) return res.status(500).json({ error: `minor_consent: ${e2.message}` })
  if (e3) return res.status(500).json({ error: `policies: ${e3.message}` })
  if (e4) return res.status(500).json({ error: `security_measurement: ${e4.message}` })

  const { data: activity, error: actErr } = await supabase
    .from('activities')
    .insert({
      user_id:                 userId,
      activity_name:           mainActivity,
      activity_subject:        formType === 'controller' ? ownerName : processorName,
      purpose,

      obtaining_data_id:       obtainingDataId,
      obtaining_method:        obtainingMethodId,
      legal_basis_id:          legalBasisId,
      source_id:               source.source_id,
      minor_consent_id:        minor.minor_consent_id,
      policy_id:               policy.policy_id,
      security_measurement_id: security.security_measurement_id,

      consentless_data:        exemptDisclosure || '',
      denial_details:          rightsDenial     || '',

      approval_status:         'pending',
      created_by:              userId,
      updated_by:              userId,
    })
    .select('activity_id')
    .single()

  if (actErr) return res.status(500).json({ error: `activities: ${actErr.message}` })

  return res.status(201).json({ activity_id: activity.activity_id })
};

// GET: single activity by ID
export const fetchForm = async (req, res) => {
  try {
    const { activity_id } = req.query;

    if (!activity_id) {
      return res.status(400).json({ error: 'activity_id is required' });
    }

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        obtaining_data:obtaining_data_id(*),
        source:source_id(*),
        legal_basis:legal_basis_id(*),
        minor_consent:minor_consent_id(*),
        policy:policy_id(*),
        security_measurement:security_measurement_id(*)
      `)
      .eq('activity_id', activity_id)
      .single();

    if (error) return res.status(404).json({ error: 'Activity not found' });

    return res.status(200).json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// GET: all activities (for dashboard table)
export const fetchAllForms = async (req, res) => {
  try {
    const { user_id, status } = req.query;

    let query = supabase
      .from('activities')
      .select(`
        activity_id,
        activity_name,
        activity_subject,
        purpose,
        approval_status,
        created_at,
        updated_at,
        legal_basis:legal_basis_id(*),
        policy:policy_id(*)
      `)
      .order('created_at', { ascending: false });

    //if (user_id) query = query.eq('user_id', user_id);
    if (status && status !== 'ALL') query = query.eq('approval_status', status);  // ← 'approval_status' not 'status'

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// DELETE: 