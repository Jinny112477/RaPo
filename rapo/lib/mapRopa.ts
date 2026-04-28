export type ApiRopa = {
  activity_id: string;
  user_id?: string;
  activity_name?: string;
  activity_subject?: string;
  purpose?: string;
  approval_status?: string;
  created_at?: string;
  updated_at?: string | null;
  source?: {
    name?: string;
  };
  legal_basis?: {
    name?: string;
  };
  obtaining_data?: {
    name?: string;
  };
  obtaining_method_detail?: {
    name?: string;
  };
  policy?: {
    retention_period?: string;
  };
};

export const mapStatus = (status?: string) => {
  if (status === "approved") return "ACTIVE";
  if (status === "rejected") return "REJECTED";
  if (status === "pending") return "REVIEW";
  if (status === "draft") return "DRAFT";
  return "REVIEW";
};

export const mapApiRopaToActivity = (item: ApiRopa) => {
  return {
    id: item.activity_id,
    user_id: item.user_id,
    activityName: item.activity_name || "-",
    department: item.activity_subject || item.source?.name || "-",
    owner: item.activity_subject || item.source?.name || "-",
    status: mapStatus(item.approval_status),
    riskLevel: "LOW",
    legalBasis: item.legal_basis?.name || "-",
    retentionPeriod: item.policy?.retention_period || "-",
    dataSubject: [item.source?.name || "-"],
    personalData: [item.obtaining_data?.name || "-"],
    processing: [item.obtaining_method_detail?.name || "-"],
    purpose: item.purpose || "-",
    updatedAt: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString("th-TH")
      : item.created_at
        ? new Date(item.created_at).toLocaleDateString("th-TH")
        : "-",
  };
};