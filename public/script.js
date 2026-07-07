const STORAGE_KEY = "directory-management-records-v1";
const THEME_KEY = "directory-management-theme";
const LOGIN_ATTEMPTS_KEY = "login-attempts-v1";
const REMEMBER_ME_KEY = "remember-me-v1";
const AUTH_SESSION_KEY = "auth-session-v1";
const THEMES = ["maroonWhite", "maroonBlack", "blackWhite", "darkMode", "midnightSlate"];
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "Project@2026";
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const REMEMBER_ME_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const AUTH_SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const CLOUD_DATA_ENDPOINT = "/api/data";
const CLOUD_SAVE_DELAY_MS = 800;
const CLOUD_POLL_INTERVAL_MS = 3000;
const CLOUD_CLIENT_ID_KEY = "directory-management-client-id";
let cloudSyncReady = false;
let cloudSaveTimer = null;
let cloudPollTimer = null;
let cloudLastUpdatedAt = null;
let cloudApplyingRemoteData = false;
let saveMessageTimer = null;
let approvalRouteProject = null;
let approvalFormViewed = false;
const EXPANDABLE_DETAILS_LINE_LIMIT = 4;
const EXPANDABLE_DETAILS_CHAR_LIMIT = 160;

const calendarTaskSeed = [];

const directoryViews = {
  modification: {
    label: "Project Modification",
    title: "Project Modification",
    idLabel: "Project Modification ID",
    generatedDateLabel: "",
    generatedDateKey: "",
    fields: [
      { key: "projectName", label: "Project Name", placeholder: "Project name", required: true },
      { key: "requested", label: "Requestor", placeholder: "Requested by", required: true },
      { key: "details", label: "Details", placeholder: "Modification details", type: "textarea" },
      { key: "remarks", label: "Remarks", placeholder: "Remarks", type: "textarea" },
      { key: "dateRequested", label: "Date Requested", type: "date" },
      { key: "dateModified", label: "Date Modified", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["To Do", "In Progress", "For Review", "Complete"],
        required: true
      },
      { key: "attachmentName", label: "Attachment", type: "file", accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", table: false }
    ],
    seed: []
  },
  modificationForm: {
    label: "Modification Form",
    title: "Modification Form",
    idLabel: "Modification Form ID",
    generatedDateLabel: "",
    generatedDateKey: "",
    fields: [
      { key: "projectName", label: "Project Name", placeholder: "Project name", required: true },
      { key: "requested", label: "Requestor Name", placeholder: "Requested by", required: true },
      { key: "clientDepartment", label: "Client / Department", placeholder: "Client or department" },
      { key: "targetCompletionDate", label: "Target Completion Date", type: "date" },
      { key: "details", label: "Modification Details", placeholder: "Modification details", type: "textarea", required: true },
      { key: "remarks", label: "Remarks", placeholder: "Remarks", type: "textarea" },
      { key: "approvedBy", label: "Name and Signature", placeholder: "Name and signature" },
      { key: "approvedPosition", label: "Position", placeholder: "Approver position" },
      { key: "approvedDateTime", label: "Approved Date / Time", type: "datetime-local" }
    ],
    seed: []
  },
  userManagement: {
    label: "User Management",
    title: "User Management",
    idLabel: "User Management ID",
    generatedDateLabel: "Created Date",
    generatedDateKey: "createdDate",
    fields: [
      { key: "fullName", label: "Full Name", placeholder: "Full name", required: true },
      { key: "userName", label: "Username", placeholder: "Username", required: true },
      { key: "password", label: "Password", placeholder: "Password", type: "password", required: true, table: false },
      {
        key: "role",
        label: "Role",
        type: "select",
        options: ["User", "Developer", "Administrator"],
        required: true
      },
      { key: "department", label: "Department", placeholder: "Department", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Inactive", "Pending"],
        required: true
      },
      { key: "attachmentName", label: "Photo", type: "file", accept: "image/*", table: false }
    ],
    seed: []
  },
  assignee: {
    label: "Assignee",
    title: "Assignee Enrollment",
    idLabel: "Assignee ID",
    generatedDateLabel: "Enrollment Date",
    generatedDateKey: "enrollmentDate",
    fields: [
      { key: "employeeName", label: "Employee Name", placeholder: "Employee name", required: true },
      { key: "position", label: "Position", placeholder: "Position", required: true },
      { key: "projectName", label: "Project Name", placeholder: "Project name", required: true }
    ],
    seed: []
  },
  project: {
    label: "Project",
    title: "Project Enrollment",
    idLabel: "Project ID",
    generatedDateLabel: "Enrollment Date",
    generatedDateKey: "enrollmentDate",
    fields: [
      { key: "projectName", label: "Project Name", placeholder: "Project name", required: true },
      { key: "department", label: "Department", placeholder: "Department", required: true }
    ],
    seed: []
  },
  requestor: {
    label: "Requestor",
    title: "Requestor Enrollment",
    idLabel: "Requestor ID",
    generatedDateLabel: "Enrollment Date",
    generatedDateKey: "enrollmentDate",
    fields: [
      { key: "requestorName", label: "Requestor Name", placeholder: "Requestor name", required: true },
      { key: "department", label: "Department", placeholder: "Department", required: true },
      { key: "projectName", label: "Project Name", placeholder: "Project name", required: true }
    ],
    seed: []
  },
  testCases: {
    label: "Test Cases",
    title: "Test Case Management",
    idLabel: "Test Case ID",
    generatedDateLabel: "Date Tested",
    generatedDateKey: "dateTested",
    fields: [
      { key: "projectName", label: "Project Name", placeholder: "Select project", required: true },
      { key: "details", label: "Test Details", placeholder: "Test case details", type: "textarea", required: true },
      { key: "qaRemarks", label: "QA Remarks", placeholder: "QA remarks", type: "textarea" },
      { key: "developerRemarks", label: "Developer Remarks", placeholder: "Developer remarks", type: "textarea", minLength: 15 },
      { key: "qa", label: "QA", placeholder: "Assigned QA", required: true, table: false, form: false },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["To Do", "In Work", "Error", "Passed"],
        required: true
      },
      { key: "attachmentName", label: "Attachment", type: "file", accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", table: false }
    ],
    seed: []
  }
};

const state = {
  isAuthenticated: false,
  currentUser: null,
  activeView: "dashboard",
  editId: "",
  calendarEditId: "",
  pendingDeleteId: "",
  pendingDeleteAction: null,
  calendarDate: new Date(),
  calendarSelectedDate: new Date(),
  calendarMode: "month",
  calendarProject: "All",
  dashboardProject: "All",
  modificationProject: "All",
  data: loadData()
};

const elements = {
  appLayout: document.querySelector(".app-layout"),
  navButtons: document.querySelectorAll("[data-directory]"),
  pageTitle: document.querySelector("#pageTitle"),
  todayText: document.querySelector("#todayText"),
  clockText: document.querySelector("#clockText"),
  createBtn: document.querySelector("#createBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  loginBtn: document.querySelector("#loginBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  userProfile: document.querySelector("#userProfile"),
  userProfileSummary: document.querySelector(".user-profile-summary"),
  userProfileAvatar: document.querySelector("#userProfileAvatar"),
  userProfileName: document.querySelector("#userProfileName"),
  userProfileRole: document.querySelector("#userProfileRole"),
  dashboardUserName: document.querySelector("#dashboardUserName"),
  loginModal: document.querySelector("#loginModal"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  togglePassword: document.querySelector("#togglePassword"),
  rememberMe: document.querySelector("#rememberMe"),
  loginMessage: document.querySelector("#loginMessage"),
  loginLockMessage: document.querySelector("#loginLockMessage"),
  cancelLoginBtn: document.querySelector("#cancelLoginBtn"),
  deleteModal: document.querySelector("#deleteModal"),
  deleteRecordName: document.querySelector("#deleteRecordName"),
  cancelDeleteBtn: document.querySelector("#cancelDeleteBtn"),
  confirmDeleteBtn: document.querySelector("#confirmDeleteBtn"),
  deleteTitle: document.querySelector("#deleteTitle"),
  deleteMessage: document.querySelector("#deleteMessage"),
  deleteRecordLabel: document.querySelector("#deleteRecordLabel"),
  messageModal: document.querySelector("#messageModal"),
  messageModalTitle: document.querySelector("#messageModalTitle"),
  messageModalMessage: document.querySelector("#messageModalMessage"),
  messageModalFieldWrap: document.querySelector("#messageModalFieldWrap"),
  messageModalFieldLabel: document.querySelector("#messageModalFieldLabel"),
  messageModalField: document.querySelector("#messageModalField"),
  messageModalCopyBtn: document.querySelector("#messageModalCopyBtn"),
  messageModalCopyStatus: document.querySelector("#messageModalCopyStatus"),
  closeMessageModalBtn: document.querySelector("#closeMessageModalBtn"),
  dashboardPanel: document.querySelector("#dashboardPanel"),
  dashboardSubtitle: document.querySelector("#dashboardSubtitle"),
  dashboardTaskMonthLabel: document.querySelector("#dashboardTaskMonthLabel"),
  dashboardTaskMonthCount: document.querySelector("#dashboardTaskMonthCount"),
  dashboardMeetingDayCount: document.querySelector("#dashboardMeetingDayCount"),
  dashboardStatusCounts: document.querySelector("#dashboardStatusCounts"),
  dashboardTestCaseStatusCounts: document.querySelector("#dashboardTestCaseStatusCounts"),
  dashboardMiniCalendar: document.querySelector("#dashboardMiniCalendar"),
  dashboardDonut: document.querySelector("#dashboardDonut"),
  dashboardDistributionTotal: document.querySelector("#dashboardDistributionTotal"),
  dashboardDistributionLegend: document.querySelector("#dashboardDistributionLegend"),
  dashboardRecentActivity: document.querySelector("#dashboardRecentActivity"),
  dashboardProjectHealth: document.querySelector("#dashboardProjectHealth"),
  dashboardProjectSelect: document.querySelector("#dashboardProjectSelect"),
  dashboardThemeSelect: document.querySelector("#dashboardThemeSelect"),
  dashboardDetailModal: document.querySelector("#dashboardDetailModal"),
  dashboardDetailTitle: document.querySelector("#dashboardDetailTitle"),
  dashboardDetailBody: document.querySelector("#dashboardDetailBody"),
  closeDashboardDetailBtn: document.querySelector("#closeDashboardDetailBtn"),
  attachmentPreviewModal: document.querySelector("#attachmentPreviewModal"),
  attachmentPreviewTitle: document.querySelector("#attachmentPreviewTitle"),
  attachmentPreviewImage: document.querySelector("#attachmentPreviewImage"),
  closeAttachmentPreviewBtn: document.querySelector("#closeAttachmentPreviewBtn"),
  calendarPanel: document.querySelector("#calendarPanel"),
  modificationFilterPanel: document.querySelector("#modificationFilterPanel"),
  modificationProjectFilter: document.querySelector("#modificationProjectFilter"),
  calendarProjectFilter: document.querySelector("#calendarProjectFilter"),
  calendarProjectText: document.querySelector("#calendarProjectText"),
  addCalendarTaskBtn: document.querySelector("#addCalendarTaskBtn"),
  calendarTaskForm: document.querySelector("#calendarTaskForm"),
  calendarTaskProject: document.querySelector("#calendarTaskProject"),
  calendarTaskTitle: document.querySelector("#calendarTaskTitle"),
  calendarTaskDate: document.querySelector("#calendarTaskDate"),
  cancelCalendarTaskBtn: document.querySelector("#cancelCalendarTaskBtn"),
  calendarGrid: document.querySelector("#calendarGrid"),
  calendarTitle: document.querySelector("#calendarTitle"),
  selectedDateText: document.querySelector("#selectedDateText"),
  selectedActivityCount: document.querySelector("#selectedActivityCount"),
  selectedActivityList: document.querySelector("#selectedActivityList"),
  weekViewBtn: document.querySelector("#weekViewBtn"),
  monthViewBtn: document.querySelector("#monthViewBtn"),
  prevCalendarBtn: document.querySelector("#prevCalendarBtn"),
  nextCalendarBtn: document.querySelector("#nextCalendarBtn"),
  todayCalendarBtn: document.querySelector("#todayCalendarBtn"),
  recordFormPanel: document.querySelector("#recordFormPanel"),
  recordForm: document.querySelector("#recordForm"),
  saveToast: document.querySelector("#saveToast"),
  formTitle: document.querySelector("#formTitle"),
  formFields: document.querySelector("#formFields"),
  editId: document.querySelector("#editId"),
  saveBtn: document.querySelector("#saveBtn"),
  cancelEditBtn: document.querySelector("#cancelEditBtn"),
  tableHead: document.querySelector("#tableHead"),
  recordRows: document.querySelector("#recordRows"),
  exportWordBtn: document.querySelector("#exportWordBtn"),
  exportPdfBtn: document.querySelector("#exportPdfBtn"),
  approvalProjectLinkBtn: document.querySelector("#approvalProjectLinkBtn"),
  approvalPanel: document.querySelector("#approvalPanel"),
  approvalTitle: document.querySelector("#approvalTitle"),
  approvalNameInput: document.querySelector("#approvalNameInput"),
  approvalPositionInput: document.querySelector("#approvalPositionInput"),
  approvalRemarksList: document.querySelector("#approvalRemarksList"),
  approvalStatus: document.querySelector("#approvalStatus"),
  approveFormBtn: document.querySelector("#approveFormBtn"),
  approvalPdfPrompt: document.querySelector("#approvalPdfPrompt"),
  approvalPreviewPdfBtn: document.querySelector("#approvalPreviewPdfBtn")
};

function loadData() {
  const cloneRecords = records => JSON.parse(JSON.stringify(records));
  const createSeedData = () => {
    const data = Object.fromEntries(
      Object.keys(directoryViews).map(key => [key, cloneRecords(directoryViews[key].seed)])
    );
    data.calendarTasks = cloneRecords(calendarTaskSeed);
    return data;
  };

  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return createSeedData();
  }
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const viewData = Object.fromEntries(
        Object.keys(directoryViews).map(key => [
          key,
          Array.isArray(parsed[key]) ? parsed[key] : cloneRecords(directoryViews[key].seed)
        ])
      );
      viewData.calendarTasks = Array.isArray(parsed.calendarTasks)
        ? parsed.calendarTasks
        : cloneRecords(calendarTaskSeed);
      return viewData;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return createSeedData();
}

function normalizeDataShape(input) {
  const cloneRecords = records => JSON.parse(JSON.stringify(records));
  const source = input && typeof input === "object" ? input : {};
  const data = Object.fromEntries(
    Object.keys(directoryViews).map(key => [
      key,
      Array.isArray(source[key]) ? source[key] : cloneRecords(directoryViews[key].seed)
    ])
  );
  data.calendarTasks = Array.isArray(source.calendarTasks)
    ? source.calendarTasks
    : cloneRecords(calendarTaskSeed);
  return data;
}

function saveLocalData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (error) {
    console.warn("Changes could not be saved in this browser session.", error);
  }
}

function currentCloudClientId() {
  try {
    let id = localStorage.getItem(CLOUD_CLIENT_ID_KEY);
    if (!id) {
      id = window.crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(CLOUD_CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return "client-transient";
  }
}

function formHasUnsavedInput() {
  return !elements.recordFormPanel.classList.contains("hidden") ||
    (isCalendarView() && Boolean(state.calendarEditId));
}

async function saveCloudData() {
  try {
    window.clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    const response = await fetch(CLOUD_DATA_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: state.data,
        updatedBy: currentCloudClientId()
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Cloud sync failed with status ${response.status}`);
    }
    const payload = await response.json();
    cloudLastUpdatedAt = payload.updatedAt || cloudLastUpdatedAt;
  } catch (error) {
    console.warn("Cloud sync is unavailable. Local changes are still saved.", error);
  }
}

function scheduleCloudSave() {
  if (!cloudSyncReady) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(saveCloudData, CLOUD_SAVE_DELAY_MS);
}

function saveData() {
  saveLocalData();
  if (!cloudApplyingRemoteData) scheduleCloudSave();
}

async function fetchCloudDataPayload() {
  const response = await fetch(CLOUD_DATA_ENDPOINT, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error(`Cloud load failed with status ${response.status}`);
  return response.json();
}

async function mergeModificationFormProjectFromCloud(projectName) {
  if (!projectName || projectName === "All") return false;

  const payload = await fetchCloudDataPayload();
  if (!payload?.data) return false;

  const remoteData = normalizeDataShape(payload.data);
  const remoteProjectRecords = (remoteData.modificationForm || [])
    .filter(record => record.projectName === projectName);
  if (!remoteProjectRecords.length) return false;

  state.data.modificationForm = [
    ...state.data.modificationForm.filter(record => record.projectName !== projectName),
    ...remoteProjectRecords
  ];
  cloudLastUpdatedAt = payload.updatedAt || cloudLastUpdatedAt;
  saveLocalData();
  return true;
}

async function refreshModificationFormProjectFromCloud(projectName) {
  if (!projectName || projectName === "All") return;

  try {
    const didMerge = await mergeModificationFormProjectFromCloud(projectName);
    if (didMerge) render({ keepFormOpen: !elements.recordFormPanel.classList.contains("hidden") });
  } catch (error) {
    console.warn("Could not refresh Modification Form approvals before export.", error);
  }
}

function applyRemoteData(payload) {
  if (!payload?.data) return;
  if (formHasUnsavedInput()) return;

  cloudApplyingRemoteData = true;
  try {
    state.data = normalizeDataShape(payload.data);
    normalizeTestCaseStatuses();
    normalizeUserRoles();
    const authSession = getAuthSession();
    state.currentUser = authSession ? userByUsername(authSession.username) : null;
    saveLocalData();
    cloudLastUpdatedAt = payload.updatedAt || cloudLastUpdatedAt;
    render();
  } finally {
    cloudApplyingRemoteData = false;
  }
}

async function pollCloudData() {
  if (!cloudSyncReady) return;

  try {
    const payload = await fetchCloudDataPayload();
    if (!payload.updatedAt || payload.updatedAt === cloudLastUpdatedAt) return;
    if (formHasUnsavedInput()) return;

    cloudLastUpdatedAt = payload.updatedAt;
    if (payload.updatedBy === currentCloudClientId()) return;
    applyRemoteData(payload);
  } catch (error) {
    console.warn("Realtime cloud refresh is unavailable.", error);
  }
}

function startCloudPolling() {
  window.clearInterval(cloudPollTimer);
  cloudPollTimer = window.setInterval(pollCloudData, CLOUD_POLL_INTERVAL_MS);
}

async function hydrateCloudData() {
  try {
    const payload = await fetchCloudDataPayload();
    cloudLastUpdatedAt = payload.updatedAt || cloudLastUpdatedAt;
    if (payload.data) {
      state.data = normalizeDataShape(payload.data);
      normalizeTestCaseStatuses();
      normalizeUserRoles();
      const authSession = getAuthSession();
      state.currentUser = authSession ? userByUsername(authSession.username) : null;
      saveLocalData();
      render();
    } else {
      cloudSyncReady = true;
      await saveCloudData();
      startCloudPolling();
      return;
    }
  } catch (error) {
    console.warn("Cloud data is unavailable. Using local browser data.", error);
  }

  cloudSyncReady = true;
  startCloudPolling();
}

function updateClock() {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  elements.todayText.textContent = formattedDate;
  elements.clockText.textContent = formattedTime;
}

function enrollmentDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
}

function idPrefix(viewKey) {
  return {
    modification: "PM",
    modificationForm: "MF",
    userManagement: "USR",
    assignee: "ASG",
    project: "PRJ",
    requestor: "REQ",
    testCases: "TC"
  }[viewKey];
}

function nextId(viewKey) {
  const prefix = idPrefix(viewKey);
  const maxNumber = state.data[viewKey].reduce((max, record) => {
    const number = Number(String(record.id).replace(`${prefix}-`, ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `${prefix}-${String(maxNumber + 1).padStart(3, "0")}`;
}

function projectSequenceCode(projectName) {
  const project = state.data.project.find(record => record.projectName === projectName);
  const idNumber = Number(String(project?.id || "").replace("PRJ-", ""));
  if (!Number.isNaN(idNumber) && idNumber > 0) {
    return String(idNumber).padStart(3, "0");
  }

  const projectNames = [...new Set([
    ...state.data.project.map(record => record.projectName),
    ...state.data.modification.map(record => record.projectName)
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const fallbackIndex = projectNames.indexOf(projectName);
  return String(fallbackIndex + 1 || 1).padStart(3, "0");
}

function nextModificationId(projectName) {
  const projectCode = projectSequenceCode(projectName);
  const prefix = `PM-${projectCode}-`;
  const maxNumber = state.data.modification.reduce((max, record) => {
    if (record.projectName !== projectName || !String(record.id).startsWith(prefix)) return max;
    const number = Number(String(record.id).replace(prefix, ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

function nextTestCaseId(projectName) {
  const projectCode = projectSequenceCode(projectName);
  const prefix = `TC-${projectCode}-`;
  const maxNumber = state.data.testCases.reduce((max, record) => {
    if (record.projectName !== projectName || !String(record.id).startsWith(prefix)) return max;
    const number = Number(String(record.id).replace(prefix, ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

function visibleRecords(viewKey = state.activeView) {
  const records = state.data[viewKey] || [];
  if (
    viewKey !== "modification" &&
    viewKey !== "modificationForm" &&
    viewKey !== "testCases"
  ) return records;
  if (state.modificationProject === "All") return records;
  return records.filter(record => record.projectName === state.modificationProject);
}

function transactionSequence(record) {
  const match = String(record?.id || "").match(/^[A-Z]+-(\d{3})(?:-(\d{3}))?$/);
  if (!match) return null;
  return {
    project: Number(match[1]),
    sequence: Number(match[2] || match[1])
  };
}

function compareTransactionSequence(a, b) {
  const left = transactionSequence(a);
  const right = transactionSequence(b);
  if (!left && !right) return String(a?.id || "").localeCompare(String(b?.id || ""));
  if (!left) return 1;
  if (!right) return -1;
  return left.sequence - right.sequence || left.project - right.project || String(a.id).localeCompare(String(b.id));
}

function sortedVisibleRecords(viewKey = state.activeView) {
  const records = visibleRecords(viewKey);
  return [...records].sort(compareTransactionSequence);
}

function firstProjectRecord(viewKey, projectName, excludeId = "") {
  const records = state.data[viewKey] || [];
  return records
    .filter(record => record.projectName === projectName && record.id !== excludeId)
    .at(-1) || null;
}

function firstSavedProjectRecord(viewKey, projectName, excludeId = "") {
  const records = state.data[viewKey] || [];
  return [...records]
    .filter(record => record.projectName === projectName && record.id !== excludeId)
    .sort(compareTransactionSequence)
    .at(0) || null;
}

function projectDepartment(projectName) {
  const project = state.data.project.find(record => record.projectName === projectName);
  return project?.department || "";
}

function firstProjectDefaults(viewKey, projectName, excludeId = "") {
  const firstRecord = firstProjectRecord(viewKey, projectName, excludeId);

  if (viewKey === "modification") {
    if (!firstRecord) return {};
    return {
      requested: firstRecord.requested || "",
      dateRequested: firstRecord.dateRequested || ""
    };
  }

  if (viewKey === "modificationForm") {
    const defaultRecord = firstSavedProjectRecord(viewKey, projectName);
    if (defaultRecord) {
      return {
        requested: defaultRecord.requested || "",
        clientDepartment: recordClientDepartment(defaultRecord),
        targetCompletionDate: defaultRecord.targetCompletionDate || "",
        approvedBy: defaultRecord.approvedBy || "",
        approvedPosition: defaultRecord.approvedPosition || "",
        approvedDateTime: defaultRecord.approvedDateTime || ""
      };
    }

    return {
      clientDepartment: projectDepartment(projectName)
    };
  }

  if (viewKey === "testCases") {
    const loggedInQaName = currentLoggedInQaName();
    if (!firstRecord) {
      return {
        qa: loggedInQaName
      };
    }

    return {
      qa: loggedInQaName || firstRecord.qa || "",
      dateTested: firstRecord.dateTested || ""
    };
  }

  return {};
}

function defaultedRecordFieldValue(record, field) {
  const recordValue = recordFieldValue(record, field);
  if (state.activeView === "testCases" && field.key === "qa") {
    return currentLoggedInQaName() || recordValue;
  }

  if (
    record ||
    (state.activeView !== "modification" &&
      state.activeView !== "modificationForm" &&
      state.activeView !== "testCases")
  ) return recordValue;

  const projectName = state.modificationProject === "All" ? "" : state.modificationProject;
  if (!projectName) return recordValue;

  const defaults = firstProjectDefaults(state.activeView, projectName);
  return defaults[field.key] || recordValue;
}

function formControlValue(field, value) {
  if (field.type === "date") return parseDateKey(value);
  if (field.type === "datetime-local") return formatDateTimeLocalValue(value);
  return value || "";
}

function formatDateTimeLocalValue(value) {
  if (!value) return "";
  const text = String(value).trim();
  const localMatch = text.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (localMatch) return `${localMatch[1]}T${localMatch[2]}`;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return "";
  const offsetMs = parsed.getTimezoneOffset() * 60000;
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
}

function applyFirstProjectDefaultsToForm() {
  if (
    state.activeView !== "modification" &&
    state.activeView !== "modificationForm" &&
    state.activeView !== "testCases"
  ) return {};

  const projectField = elements.formFields.querySelector('[name="projectName"]');
  const projectName = String(projectField?.value || "").trim();
  if (!projectName) return {};

  const defaults = firstProjectDefaults(state.activeView, projectName, state.editId);

  Object.entries(defaults).forEach(([key, value]) => {
    const field = elements.formFields.querySelector(`[name="${key}"]`);
    if (!field) return;
    if (field.value) return;
    if (!value && !(state.activeView === "modificationForm" && key === "clientDepartment")) return;
    if (field.tagName === "SELECT" && ![...field.options].some(option => option.value === value)) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      field.append(option);
    }
    const fieldDefinition = directoryViews[state.activeView].fields.find(item => item.key === key) || {};
    field.value = formControlValue(fieldDefinition, value);
  });

  const dateNote = elements.formFields.querySelector("[data-generated-date-note]");
  if (dateNote && state.activeView === "testCases") {
    dateNote.textContent = `Date Tested: ${defaults.dateTested || enrollmentDate()} (system generated)`;
  }

  return defaults;
}

function projectOptions() {
  return [...new Set(
    state.data.project
      .map(record => String(record.projectName || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function updateDashboardProjectSelect() {
  const projects = projectOptions();
  const current = state.dashboardProject;

  elements.dashboardProjectSelect.innerHTML = '<option value="All">All Projects</option>';
  projects.forEach(projectName => {
    const option = document.createElement("option");
    option.value = projectName;
    option.textContent = projectName;
    elements.dashboardProjectSelect.append(option);
  });

  state.dashboardProject = projects.includes(current) ? current : "All";
  elements.dashboardProjectSelect.value = state.dashboardProject;
}

function updateModificationProjectFilter() {
  const projects = projectOptions();
  const current = state.modificationProject;

  elements.modificationProjectFilter.innerHTML = '<option value="All">All Project</option>';
  projects.forEach(projectName => {
    const option = document.createElement("option");
    option.value = projectName;
    option.textContent = projectName;
    elements.modificationProjectFilter.append(option);
  });

  state.modificationProject = projects.includes(current) ? current : "All";
  elements.modificationProjectFilter.value = state.modificationProject;
}

function syncModificationProjectField() {
  if (
    state.activeView !== "modification" &&
    state.activeView !== "modificationForm" &&
    state.activeView !== "testCases"
  ) return;
  if (state.modificationProject === "All") return;

  const projectField = elements.formFields.querySelector('[name="projectName"]');
  if (!projectField) return;

  projectField.value = state.modificationProject;
}

function normalizeModificationIds() {
  const projectCounters = {};
  let changed = false;

  state.data.modification.forEach(record => {
    const projectCode = projectSequenceCode(record.projectName);
    const match = String(record.id || "").match(/^PM-(\d{3})-(\d{3})$/);
    if (match) {
      const sequence = Number(match[2]);
      projectCounters[projectCode] = Math.max(projectCounters[projectCode] || 0, sequence);
    }
  });

  state.data.modification = state.data.modification.map(record => {
    if (/^PM-\d{3}-\d{3}$/.test(String(record.id || ""))) return record;

    const projectCode = projectSequenceCode(record.projectName);
    projectCounters[projectCode] = (projectCounters[projectCode] || 0) + 1;
    changed = true;

    return {
      ...record,
      id: `PM-${projectCode}-${String(projectCounters[projectCode]).padStart(3, "0")}`
    };
  });

  return changed;
}

function normalizeTestCaseIds() {
  const projectCounters = {};
  let changed = false;

  state.data.testCases.forEach(record => {
    const projectCode = projectSequenceCode(record.projectName);
    const match = String(record.id || "").match(/^TC-(\d{3})-(\d{3})$/);
    if (match) {
      const sequence = Number(match[2]);
      projectCounters[projectCode] = Math.max(projectCounters[projectCode] || 0, sequence);
    }
  });

  state.data.testCases = state.data.testCases.map(record => {
    if (/^TC-\d{3}-\d{3}$/.test(String(record.id || ""))) return record;

    const projectCode = projectSequenceCode(record.projectName);
    projectCounters[projectCode] = (projectCounters[projectCode] || 0) + 1;
    changed = true;

    return {
      ...record,
      id: `TC-${projectCode}-${String(projectCounters[projectCode]).padStart(3, "0")}`
    };
  });

  return changed;
}

function isCalendarView() {
  return state.activeView === "calendar";
}

function applyTheme(theme) {
  const selectedTheme = THEMES.includes(theme) ? theme : "maroonWhite";
  document.body.dataset.theme = selectedTheme;
  elements.dashboardThemeSelect.value = selectedTheme;
  localStorage.setItem(THEME_KEY, selectedTheme);
}

function statusClass(value) {
  const status = String(value || "").trim().toLowerCase() === "done" ? "Complete" : value;
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "empty";
}

function normalizeStatusValues() {
  let changed = false;
  ["modification"].forEach(viewKey => {
    (state.data[viewKey] || []).forEach(record => {
      if (record.status !== "Done") return;
      record.status = "Complete";
      changed = true;
    });
  });
  return changed;
}

function normalizeTestCaseStatuses() {
  let changed = false;
  const replacements = {
    "In Progress": "In Work",
    "For Review": "Error"
  };

  (state.data.testCases || []).forEach(record => {
    const nextStatus = replacements[record.status];
    if (!nextStatus) return;
    record.status = nextStatus;
    changed = true;
  });

  return changed;
}

function normalizeUserRoles() {
  let changed = false;

  (state.data.userManagement || []).forEach(record => {
    if (String(record.role || "").trim().toLowerCase() !== "admin") return;
    record.role = "Administrator";
    changed = true;
  });

  return changed;
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: dateKey(start),
    end: dateKey(end),
    label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  };
}

function recordsInMonth(records, key, date = new Date()) {
  const { start, end } = monthBounds(date);
  return records.filter(record => {
    const recordDate = parseDateKey(record[key]);
    return recordDate && recordDate >= start && recordDate <= end;
  });
}

function showLoginModal() {
  elements.loginForm.reset();
  elements.loginForm.classList.remove("has-error");
  elements.loginMessage.textContent = "";
  elements.loginLockMessage.textContent = "";
  elements.loginPassword.type = "password";
  elements.togglePassword?.classList.remove("password-visible");
  elements.togglePassword?.setAttribute("aria-label", "Show password");
  if (elements.togglePassword) elements.togglePassword.title = "Show password";
  elements.loginModal.classList.remove("hidden");
  elements.loginUsername.focus();
}

function hideLoginModal() {
  if (!state.isAuthenticated && !approvalRouteProject) return;
  elements.loginModal.classList.add("hidden");
}

function closeUserProfileMenu() {
  elements.userProfile.classList.remove("is-open");
  elements.userProfileSummary?.setAttribute("aria-expanded", "false");
}

function toggleUserProfileMenu() {
  if (!state.isAuthenticated) return;
  const isOpen = elements.userProfile.classList.toggle("is-open");
  elements.userProfileSummary?.setAttribute("aria-expanded", String(isOpen));
}

function setAuthenticated(isAuthenticated) {
  state.isAuthenticated = isAuthenticated;
  const isGuestApprovalRoute = Boolean(approvalRouteProject);

  elements.appLayout.classList.toggle("hidden", !state.isAuthenticated && !isGuestApprovalRoute);
  elements.loginModal.classList.toggle("hidden", state.isAuthenticated || isGuestApprovalRoute);
  elements.loginBtn.classList.toggle("hidden", state.isAuthenticated || isGuestApprovalRoute);
  elements.logoutBtn.classList.toggle("hidden", !state.isAuthenticated);
  if (!state.isAuthenticated) {
    closeUserProfileMenu();
    state.currentUser = null;
    elements.loginForm.reset();
    elements.loginForm.classList.remove("has-error");
    elements.loginMessage.textContent = "";
    elements.loginLockMessage.textContent = "";
    elements.rememberMe.checked = false;
    elements.loginPassword.type = "password";
    elements.togglePassword?.classList.remove("password-visible");
    if (!isGuestApprovalRoute) {
      requestAnimationFrame(() => elements.loginUsername.focus());
    }
  }
  renderUserProfile();
}

function isCurrentAdmin() {
  const username = String(state.currentUser?.userName || "").trim().toLowerCase();
  const role = String(state.currentUser?.role || "").trim().toLowerCase();
  return username === DEFAULT_ADMIN_USERNAME.toLowerCase() ||
    ["admin", "administrator"].includes(role);
}

function isCurrentDeveloper() {
  const role = String(state.currentUser?.role || "").trim().toLowerCase();
  return ["developer", "dev"].includes(role);
}

function isDeveloperRestricted() {
  return isCurrentDeveloper() && !isCurrentAdmin();
}

function canViewUserManagement() {
  return isCurrentAdmin();
}

function isDeveloperTestCaseRemarksOnly() {
  return state.activeView === "testCases" && isDeveloperRestricted();
}

function canCreateInCurrentView() {
  if (state.activeView === "userManagement") return isCurrentAdmin();
  if (isDeveloperRestricted()) return false;
  return true;
}

function canEditCurrentRecord() {
  if (!isDeveloperRestricted()) return true;
  return state.activeView === "testCases";
}

function canDeleteCurrentRecord() {
  return !isDeveloperRestricted();
}

function currentUserDisplayName() {
  const name = String(
    state.currentUser?.fullName ||
    state.currentUser?.userName ||
    DEFAULT_ADMIN_USERNAME ||
    "User"
  ).trim() || "User";
  return name.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase() ? "Admin" : name;
}

function currentLoggedInAccountName() {
  return state.isAuthenticated && state.currentUser ? currentUserDisplayName() : "";
}

function currentLoggedInQaName() {
  return currentLoggedInAccountName();
}

function currentUserRole() {
  const role = String(state.currentUser?.role || "User").trim() || "User";
  return role.toLowerCase() === "admin" ? "Administrator" : role;
}

function userInitials(name) {
  const parts = String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function renderUserProfile() {
  const isLoggedIn = state.isAuthenticated && Boolean(state.currentUser);
  elements.userProfile.classList.toggle("hidden", !isLoggedIn);

  if (!isLoggedIn) {
    closeUserProfileMenu();
    elements.userProfileName.textContent = "";
    elements.userProfileRole.textContent = "";
    elements.userProfileAvatar.textContent = "";
    elements.userProfileAvatar.style.backgroundImage = "";
    elements.dashboardUserName.textContent = "Admin";
    return;
  }

  const name = currentUserDisplayName();
  const role = currentUserRole();
  const canUsePhoto = isImageAttachment(state.currentUser);

  elements.userProfileName.textContent = name;
  elements.userProfileRole.textContent = role;
  elements.dashboardUserName.textContent = name;
  elements.userProfileAvatar.textContent = canUsePhoto ? "" : userInitials(name);
  elements.userProfileAvatar.style.backgroundImage = canUsePhoto
    ? `url("${state.currentUser.attachmentData}")`
    : "";
}

function recordDisplayName(record) {
  return [
    record?.id,
    record?.projectName,
    record?.presentationTitle,
    record?.userName,
    record?.employeeName,
    record?.requestorName
  ].filter(Boolean).join(" - ") || "Directory record";
}

function showDeleteModal({
  id = "",
  title = "Delete Record",
  message = "This action cannot be undone.",
  label = "Selected record",
  name = "Directory record",
  confirmText = "Delete",
  onConfirm = null
} = {}) {
  state.pendingDeleteId = id;
  state.pendingDeleteAction = typeof onConfirm === "function" ? onConfirm : null;
  elements.deleteTitle.textContent = title;
  elements.deleteMessage.textContent = message;
  elements.deleteRecordLabel.textContent = label;
  elements.deleteRecordName.textContent = name;
  elements.confirmDeleteBtn.textContent = confirmText;
  elements.deleteModal.classList.remove("hidden");
  elements.cancelDeleteBtn.focus();
}

function hideDeleteModal() {
  state.pendingDeleteId = "";
  state.pendingDeleteAction = null;
  elements.deleteModal.classList.add("hidden");
  elements.confirmDeleteBtn.textContent = "Delete";
}

function showMessageModal({
  title = "Notice",
  message = "",
  fieldLabel = "",
  fieldValue = "",
  primaryText = "OK"
} = {}) {
  elements.messageModalTitle.textContent = title;
  elements.messageModalMessage.textContent = message;
  elements.closeMessageModalBtn.textContent = primaryText;
  elements.messageModalCopyStatus.textContent = "";

  const hasField = Boolean(fieldValue);
  elements.messageModalFieldWrap.classList.toggle("hidden", !hasField);
  elements.messageModalField.value = fieldValue || "";
  elements.messageModalFieldLabel.textContent = fieldLabel || "Value";

  elements.messageModal.classList.remove("hidden");
  requestAnimationFrame(() => {
    if (hasField) {
      elements.messageModalField.focus();
      elements.messageModalField.select();
      return;
    }
    elements.closeMessageModalBtn.focus();
  });
}

function hideMessageModal() {
  elements.messageModal.classList.add("hidden");
  elements.messageModalField.value = "";
  elements.messageModalCopyStatus.textContent = "";
  elements.closeMessageModalBtn.textContent = "OK";
}

async function copyMessageModalField() {
  const value = elements.messageModalField.value;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    elements.messageModalCopyStatus.textContent = "Copied.";
    showSaveMessage("Link copied.");
  } catch {
    elements.messageModalField.focus();
    elements.messageModalField.select();
    elements.messageModalCopyStatus.textContent = "Select the link and copy it manually.";
  }
}

function hideDashboardDetailModal() {
  elements.dashboardDetailModal.classList.add("hidden");
}

function showAttachmentPreview(src, name = "Attachment Preview") {
  if (!src) return;
  elements.attachmentPreviewTitle.textContent = name || "Attachment Preview";
  elements.attachmentPreviewImage.src = src;
  elements.attachmentPreviewImage.alt = name || "Attachment preview";
  elements.attachmentPreviewModal.classList.remove("hidden");
}

function hideAttachmentPreview() {
  elements.attachmentPreviewModal.classList.add("hidden");
  elements.attachmentPreviewImage.removeAttribute("src");
  elements.attachmentPreviewImage.alt = "";
}

function isImageAttachment(record) {
  if (!record?.attachmentData) return false;

  const type = String(record.attachmentType || "").toLowerCase();
  const name = String(record.attachmentName || "").toLowerCase();

  return type.startsWith("image/") || /\.(avif|bmp|gif|jpe?g|jfif|png|webp|svg)$/i.test(name);
}

function detailDateLabel(value) {
  const key = parseDateKey(value);
  if (!key) return "-";
  return formatDateForDisplay(key);
}

function recordFieldValue(record, fieldOrKey) {
  const key = typeof fieldOrKey === "string" ? fieldOrKey : fieldOrKey?.key;
  if (key === "dateRequested") return record?.dateRequested || record?.dateReported || "";
  if (key === "qaRemarks") return record?.qaRemarks || record?.remarks || "";
  return record?.[key] || "";
}

function remarkAuthorName(record, textKey, authorKey, fallbackAuthor = "") {
  const text = String(recordFieldValue(record, textKey) || "").trim();
  if (!text) return "";

  return String(record?.[authorKey] || fallbackAuthor || currentLoggedInAccountName() || "User").trim();
}

function remarkAuthorTooltip(record, textKey, authorKey, fallbackAuthor = "", label = "Added by") {
  const author = remarkAuthorName(record, textKey, authorKey, fallbackAuthor);
  return author ? `${label} ${author}` : "";
}

function testCaseRemarkTooltip(record, key) {
  if (key === "qaRemarks") return remarkAuthorTooltip(record, "qaRemarks", "qaRemarksBy", record?.qa || "QA", "QA by:");
  if (key === "developerRemarks") {
    return remarkAuthorTooltip(
      record,
      "developerRemarks",
      "developerRemarksBy",
      record?.developer || currentLoggedInAccountName() || "Developer",
      "Developer by:"
    );
  }
  return "";
}

function setCellTooltip(cell, text, visibleText = "") {
  const tooltip = String(text || "").trim();
  if (!tooltip) return;

  cell.classList.add("ui-tooltip-cell");
  cell.dataset.tooltip = tooltip;
  cell.setAttribute("aria-label", [String(visibleText || "").trim(), tooltip].filter(Boolean).join(". "));
}

function currentUserAuthorNames() {
  if (!state.isAuthenticated || !state.currentUser) return [];
  return [
    currentUserDisplayName(),
    state.currentUser.fullName,
    state.currentUser.userName
  ]
    .map(name => String(name || "").trim().toLowerCase())
    .filter(Boolean);
}

function isCurrentUserAuthor(authorName) {
  const normalizedAuthor = String(authorName || "").trim().toLowerCase();
  return Boolean(normalizedAuthor && currentUserAuthorNames().includes(normalizedAuthor));
}

function renderAddedByRemarksContent(content, text) {
  const lines = String(text || "").split(/\r\n|\r|\n/);
  const addedByPattern = /^Added by\s+([^:]+):\s*(.*)$/i;

  lines.forEach((line, index) => {
    if (index > 0) content.append(document.createElement("br"));

    const match = line.match(addedByPattern);
    if (!match) {
      content.append(document.createTextNode(line));
      return;
    }

    const [, , remarkText] = match;
    content.append(document.createTextNode(remarkText));
  });
}

function addedByTooltipText(value) {
  const addedByPattern = /^Added by\s+([^:]+):/i;
  return String(value || "")
    .split(/\r\n|\r|\n/)
    .map(line => line.match(addedByPattern)?.[1])
    .filter(Boolean)
    .map(authorName => `Added by ${authorName.trim()}`)
    .filter((label, index, labels) => labels.indexOf(label) === index)
    .join("\n");
}

function tableFieldValue(record, field) {
  const value = recordFieldValue(record, field);
  if (field?.key === "remarks") return approvalRemarksText(record) || value;
  if (field?.key === "approvedBy") return approvalList([record]).map(approval => approval.name).join(", ") || value;
  if (field?.key === "approvedPosition") return approvalList([record]).map(approval => approval.position).join(", ") || value;
  if (field?.key === "approvedDateTime") return formatApprovalTimestamp(value);
  return field?.type === "date" ? formatDateForDisplay(value) : value;
}

function tableFieldGroups(viewKey, view) {
  const fields = view.fields.filter(field => field.table !== false);
  if (viewKey !== "testCases") {
    return { beforeGenerated: fields, afterGenerated: [] };
  }

  return {
    beforeGenerated: fields.filter(field => ["projectName", "details"].includes(field.key)),
    afterGenerated: fields.filter(field => ["qaRemarks", "developerRemarks", "status"].includes(field.key))
  };
}

function detailColumns(type) {
  if (type === "modification") {
    return [
      { key: "id", label: "Project Modification ID", value: record => record.id },
      { key: "projectName", label: "Project Name", value: record => record.projectName },
      { key: "requested", label: "Requestor", value: record => record.requested },
      { key: "details", label: "Details", value: record => record.details },
      { key: "remarks", label: "Remarks", value: record => record.remarks },
      { key: "dateRequested", label: "Date Requested", value: record => detailDateLabel(recordFieldValue(record, "dateRequested")) },
      { key: "dateModified", label: "Date Modified", value: record => detailDateLabel(record.dateModified) },
      { key: "status", label: "Status", value: record => record.status },
      { key: "attachment", label: "Attachment", value: record => record.attachmentName }
    ];
  }
  
  if (type === "testCases") {
    return [
      { key: "id", label: "Test Case ID", value: record => record.id },
      { key: "projectName", label: "Project Name", value: record => record.projectName },
      { key: "details", label: "Test Details", value: record => record.details },
      { key: "dateTested", label: "Date Tested", value: record => detailDateLabel(record.dateTested) },
      {
        key: "qaRemarks",
        label: "QA Remarks",
        value: record => recordFieldValue(record, "qaRemarks"),
        title: record => testCaseRemarkTooltip(record, "qaRemarks")
      },
      {
        key: "developerRemarks",
        label: "Developer Remarks",
        value: record => recordFieldValue(record, "developerRemarks"),
        title: record => testCaseRemarkTooltip(record, "developerRemarks")
      },
      { key: "status", label: "Status", value: record => record.status },
      { key: "attachment", label: "Attachment", value: record => record.attachmentName }
    ];
  }

  if (type === "project") {
    return [
      { key: "id", label: "Project ID", value: record => record.id },
      { key: "projectName", label: "Project Name", value: record => record.projectName },
      { key: "department", label: "Department", value: record => record.department },
      { key: "enrollmentDate", label: "Enrollment Date", value: record => record.enrollmentDate }
    ];
  }

  return [
    { key: "id", label: "Task ID", value: record => record.id },
    { key: "projectName", label: "Project Name", value: record => record.projectName },
    { key: "details", label: "Details", value: record => record.title },
    { key: "date", label: "Date", value: record => detailDateLabel(record.date) }
  ];
}

function appendAttachmentContent(cell, record) {
  const isImage = isImageAttachment(record);

  if (isImage) {
    const link = document.createElement("a");
    const image = document.createElement("img");

    link.className = "attachment-preview-link";
    link.href = "#";
    link.title = record.attachmentName;
    link.addEventListener("click", event => {
      event.preventDefault();
      showAttachmentPreview(record.attachmentData, record.attachmentName);
    });

    image.className = "attachment-preview";
    image.src = record.attachmentData;
    image.alt = record.attachmentName;

    link.append(image);
    cell.append(link);
    return;
  }

  const attachment = record.attachmentData
    ? document.createElement("a")
    : document.createElement("span");
  attachment.className = record.attachmentData ? "attachment-link" : "attachment-empty";
  attachment.textContent = record.attachmentName || "No attachment";
  if (record.attachmentData) {
    attachment.href = record.attachmentData;
    attachment.target = "_blank";
  }
  cell.append(attachment);
}

function hasDetailValue(record, type) {
  if (type === "project") return Boolean(String(record.projectName || "").trim());
  const value = type === "modification" || type === "testCases" ? record.details : record.title;
  return Boolean(String(value || "").trim());
}

function showDashboardDetailModal(title, records, type = "task") {
  const detailRecords = Array.isArray(records) ? records : [];
  elements.dashboardDetailTitle.textContent = title;
  elements.dashboardDetailBody.innerHTML = "";

  if (!detailRecords.length) {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = "No details found for this count.";
    elements.dashboardDetailBody.append(empty);
  } else {
    const columns = detailColumns(type);
    const tableWrap = document.createElement("div");
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    const body = document.createElement("tbody");

    tableWrap.className = "detail-table-wrap";
    table.className = "detail-table";

    columns.forEach(column => {
      const th = document.createElement("th");
      th.textContent = column.label;
      headRow.append(th);
    });
    head.append(headRow);

    const sortedDetailRecords = [...detailRecords].sort(compareTransactionSequence);

    sortedDetailRecords.forEach(record => {
      const row = document.createElement("tr");
      row.className = "detail-row";

      if (hasDetailValue(record, type)) {
        row.tabIndex = 0;
        row.setAttribute("aria-selected", "false");
        row.title = "Select row to highlight details";
        row.addEventListener("click", () => {
          body.querySelectorAll(".selected-detail-row").forEach(selectedRow => {
            selectedRow.classList.remove("selected-detail-row");
            selectedRow.setAttribute("aria-selected", "false");
          });
          row.classList.add("selected-detail-row");
          row.setAttribute("aria-selected", "true");
        });
        row.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          row.click();
        });
      }

      columns.forEach(column => {
        const cell = document.createElement("td");
        const value = column.value(record) || "-";
        const title = typeof column.title === "function" ? column.title(record) : "";

        if (["details", "remarks", "qaRemarks", "developerRemarks", "featureDetails", "oldValue", "newValue"].includes(column.key)) {
          cell.classList.add("detail-text-cell", "multiline-text-cell");
          cell.classList.toggle("has-detail-value", value !== "-");
        }
        setCellTooltip(cell, title, value);

        if (column.key === "attachment") {
          appendAttachmentContent(cell, record);
        } else if (column.key === "status") {
          const badge = document.createElement("span");
          badge.className = `status-badge status-${statusClass(value)}`;
          badge.textContent = value;
          cell.append(badge);
        } else if (column.key === "details") {
          const detailValue = document.createElement("span");
          detailValue.className = "detail-value-highlight";
          detailValue.textContent = value;
          cell.append(detailValue);
        } else {
          cell.textContent = value;
        }

        row.append(cell);
      });
      body.append(row);
    });

    table.append(head, body);
    tableWrap.append(table);
    elements.dashboardDetailBody.append(tableWrap);
  }

  elements.dashboardDetailModal.classList.remove("hidden");
  elements.closeDashboardDetailBtn.focus();
}

function directoryLookupOptions(fieldKey, recordValue = "") {
  const lookupMap = {
    projectName: {
      viewKey: "project",
      valueKey: "projectName",
      placeholder: "Select project"
    },
    requested: {
      viewKey: "requestor",
      valueKey: "requestorName",
      placeholder: "Select requestor"
    },
    clientDepartment: {
      viewKey: "project",
      valueKey: "department",
      placeholder: "Select department"
    }
  };
  const shouldUseDirectoryLookup =
    state.activeView !== "project" &&
    Boolean(lookupMap[fieldKey]);
  const lookup = shouldUseDirectoryLookup ? lookupMap[fieldKey] : null;
  if (!lookup) return null;

  const values = [...new Set(
    (state.data[lookup.viewKey] || [])
      .map(record => String(record[lookup.valueKey] || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
  const currentValue = String(recordValue || "").trim();

  if (currentValue && !values.includes(currentValue)) {
    values.unshift(currentValue);
  }

  return {
    placeholder: lookup.placeholder,
    values
  };
}

function showForm(record = null) {
  const view = directoryViews[state.activeView];
  if (!record && state.activeView === "userManagement" && !isCurrentAdmin()) {
    showMessageModal({
      title: "Admin Access Required",
      message: "Only the admin can add User Management records."
    });
    return;
  }
  if (isDeveloperRestricted() && state.activeView !== "testCases") {
    showMessageModal({
      title: "Developer Remarks Only",
      message: "Developers can edit Developer Remarks on existing test cases only."
    });
    return;
  }
  if (!record && isDeveloperTestCaseRemarksOnly()) {
    showMessageModal({
      title: "Developer Remarks Only",
      message: "Developers can update Developer Remarks on existing test cases only."
    });
    return;
  }

  state.editId = record?.id || "";
  elements.editId.value = state.editId;
  elements.formTitle.textContent = record ? `Edit ${view.label} Record` : `Create ${view.label} Record`;
  elements.saveBtn.textContent = record ? "Save Changes" : "Save Record";
  elements.formFields.innerHTML = "";

  view.fields.filter(field => field.form !== false).forEach(field => {
    const label = document.createElement("label");
    const span = document.createElement("span");
    const recordValue = defaultedRecordFieldValue(record, field);
    const isLoggedInQaField = state.activeView === "testCases" && field.key === "qa";
    const isDeveloperLockedField = isDeveloperTestCaseRemarksOnly() && record && field.key !== "developerRemarks";
    const lookupOptions = isLoggedInQaField ? null : directoryLookupOptions(field.key, recordValue);
    let input;

    label.className = `form-field field-${field.key}`;

    span.textContent = field.label;
    if (isLoggedInQaField) {
      input = document.createElement("input");
      input.type = "text";
      input.readOnly = true;
      input.className = "static-login-field";
      input.setAttribute("aria-readonly", "true");
    } else if (lookupOptions) {
      input = document.createElement("select");

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = lookupOptions.values.length
        ? lookupOptions.placeholder
        : `No ${field.label.toLowerCase()} records yet`;
      placeholder.disabled = true;
      input.append(placeholder);

      lookupOptions.values.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        input.append(option);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        input.append(option);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
    }

    input.name = field.key;
    if (field.type !== "file") input.value = formControlValue(field, recordValue);
    input.maxLength = field.type === "textarea" ? 1000 : 120;
    if (field.minLength) input.minLength = field.minLength;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.accept) input.accept = field.accept;
    input.required = Boolean(field.required);
    if (isDeveloperLockedField) {
      if (["select", "file"].includes(input.type) || input.tagName === "SELECT") {
        input.disabled = true;
      } else {
        input.readOnly = true;
        input.setAttribute("aria-readonly", "true");
      }
      input.classList.add("static-login-field");
      label.title = "Developer role can edit Developer Remarks only.";
    }

    label.append(span);
    if (state.activeView === "userManagement" && field.key === "password" && isCurrentAdmin()) {
      const passwordWrap = document.createElement("div");
      const revealBtn = document.createElement("button");

      passwordWrap.className = "record-password-wrapper";
      revealBtn.type = "button";
      revealBtn.className = "record-password-toggle";
      revealBtn.textContent = "Show";
      revealBtn.setAttribute("aria-label", "Show password");
      revealBtn.addEventListener("click", () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        revealBtn.textContent = isPassword ? "Hide" : "Show";
        revealBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      });

      passwordWrap.append(input, revealBtn);
      label.append(passwordWrap);
    } else {
      label.append(input);
    }
    elements.formFields.append(label);
  });

  if (view.generatedDateKey) {
    const dateNote = document.createElement("p");
    dateNote.className = "generated-date-note";
    dateNote.dataset.generatedDateNote = "true";
    const projectForGeneratedDate = state.modificationProject === "All" ? "" : state.modificationProject;
    const generatedDate = record?.[view.generatedDateKey] ||
      firstProjectDefaults(state.activeView, projectForGeneratedDate).dateTested ||
      enrollmentDate();
    dateNote.textContent = `${view.generatedDateLabel}: ${generatedDate} (system generated)`;
    elements.formFields.append(dateNote);
  }

  if (record?.attachmentName) {
    const attachmentNote = document.createElement("div");
    attachmentNote.className = "current-attachment";
    if (record.attachmentData) {
      const link = document.createElement("a");
      link.href = record.attachmentData;
      link.target = "_blank";
      link.textContent = `View Current Attachment: ${record.attachmentName}`;
      attachmentNote.append(link);
    } else {
      attachmentNote.textContent = `Attachment: ${record.attachmentName}`;
    }
    elements.formFields.append(attachmentNote);
  }

  elements.recordFormPanel.classList.remove("hidden");
  if (!record) syncModificationProjectField();
  applyFirstProjectDefaultsToForm();
  elements.formFields.querySelector('[name="projectName"]')?.addEventListener("change", applyFirstProjectDefaultsToForm);
  elements.formFields
    .querySelector("input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly])")
    ?.focus();
}

function hideForm() {
  state.editId = "";
  elements.recordForm.reset();
  elements.editId.value = "";
  elements.recordFormPanel.classList.add("hidden");
}

function switchView(viewKey) {
  if (viewKey === "userManagement" && !canViewUserManagement()) {
    showMessageModal({
      title: "Admin Access Required",
      message: "Only the admin can view User Management."
    });
    viewKey = "dashboard";
  }

  state.activeView = viewKey;
  hideForm();
  render();
}

function deleteRecord(id) {
  if (!canDeleteCurrentRecord()) {
    showMessageModal({
      title: "Developer Remarks Only",
      message: "Developers can edit Developer Remarks only and cannot delete records."
    });
    return;
  }

  const record = state.data[state.activeView].find(item => item.id === id);
  showDeleteModal({
    id,
    title: "Delete Record",
    message: "This record will be permanently removed from the directory.",
    label: "Selected record",
    name: recordDisplayName(record),
    confirmText: "Delete record",
    onConfirm: () => {
      state.data[state.activeView] = state.data[state.activeView]
        .filter(item => item.id !== id);
      saveData();
      render();
    }
  });
}

function confirmDeleteRecord() {
  if (!state.pendingDeleteAction) return;

  const deleteAction = state.pendingDeleteAction;
  hideDeleteModal();
  deleteAction();
}

function editRecord(id) {
  if (!canEditCurrentRecord()) {
    showMessageModal({
      title: "Developer Remarks Only",
      message: "Developers can edit Developer Remarks on existing test cases only."
    });
    return;
  }

  const record = state.data[state.activeView].find(item => item.id === id);
  if (record) showForm(record);
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDateForDisplay(value) {
  const key = parseDateKey(value);
  if (!key) return value || "";
  const [year, month, day] = key.split("-");
  return `${month}/${day}/${year}`;
}

function parseDateKey(value) {
  if (!value) return "";
  const text = String(value).trim();
  const usMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const date = new Date(`${text}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : dateKey(date);
}

function updateCalendarProjects() {
  const projects = projectOptions();
  const current = state.calendarProject;

  elements.calendarProjectFilter.innerHTML = '<option value="All">All Projects</option>';
  elements.calendarTaskProject.innerHTML = "";
  projects.forEach(projectName => {
    const option = document.createElement("option");
    option.value = projectName;
    option.textContent = projectName;
    elements.calendarProjectFilter.append(option);
    elements.calendarTaskProject.append(option.cloneNode(true));
  });

  if (!projects.length) {
    elements.calendarTaskProject.innerHTML = '<option value="" selected disabled>No project records yet</option>';
  }

  state.calendarProject = projects.includes(current) ? current : "All";
  elements.calendarProjectFilter.value = state.calendarProject;
  elements.calendarProjectText.textContent = "";
}

function showCalendarTaskForm(date = new Date()) {
  updateCalendarProjects();
  state.calendarEditId = "";
  elements.calendarTaskForm.reset();
  state.calendarSelectedDate = new Date(date);
  elements.calendarTaskDate.value = dateKey(date);
  elements.calendarTaskProject.value = state.calendarProject === "All"
    ? elements.calendarTaskProject.value
    : state.calendarProject;
  if (!elements.calendarTaskProject.value && elements.calendarTaskProject.options.length) {
    elements.calendarTaskProject.value = elements.calendarTaskProject.options[0].value;
  }
  elements.addCalendarTaskBtn.textContent = "Add task";
  elements.cancelCalendarTaskBtn.classList.add("hidden");
  elements.calendarTaskTitle.focus();
  renderSelectedDatePanel();
}

function hideCalendarTaskForm() {
  state.calendarEditId = "";
  elements.calendarTaskForm.reset();
  elements.calendarTaskDate.value = dateKey(state.calendarSelectedDate);
  if (!elements.calendarTaskProject.value && elements.calendarTaskProject.options.length) {
    elements.calendarTaskProject.value = elements.calendarTaskProject.options[0].value;
  }
  elements.addCalendarTaskBtn.textContent = "Add task";
  elements.cancelCalendarTaskBtn.classList.add("hidden");
}

function nextCalendarTaskId() {
  const maxNumber = state.data.calendarTasks.reduce((max, task) => {
    const number = Number(String(task.id).replace("CAL-", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `CAL-${String(maxNumber + 1).padStart(3, "0")}`;
}

function saveCalendarTask(event) {
  event.preventDefault();
  const projectName = elements.calendarTaskProject.value;
  const title = elements.calendarTaskTitle.value.trim();
  const date = elements.calendarTaskDate.value;

  if (!projectName || !title || !date) return;

  const wasEditing = Boolean(state.calendarEditId);

  if (state.calendarEditId) {
    state.data.calendarTasks = state.data.calendarTasks.map(task =>
      task.id === state.calendarEditId
        ? {
          ...task,
          projectName,
          title,
          date
        }
        : task
    );
  } else {
    state.data.calendarTasks.unshift({
      id: nextCalendarTaskId(),
      projectName,
      title,
      date
    });
  }

  state.calendarDate = new Date(`${date}T00:00:00`);
  state.calendarSelectedDate = new Date(`${date}T00:00:00`);
  saveData();
  showSaveMessage(wasEditing ? "Task successfully saved." : "Task successfully added.");
  hideCalendarTaskForm();
  renderCalendar();
}

function editCalendarTask(id) {
  const task = state.data.calendarTasks.find(record => record.id === id);
  if (!task) return;
  const taskDate = parseDateKey(task.date) || dateKey(new Date());

  updateCalendarProjects();
  state.calendarEditId = id;
  state.calendarSelectedDate = new Date(`${taskDate}T00:00:00`);
  state.calendarDate = new Date(state.calendarSelectedDate);
  elements.calendarTaskProject.value = task.projectName;
  elements.calendarTaskDate.value = taskDate;
  elements.calendarTaskTitle.value = task.title || "";
  elements.addCalendarTaskBtn.textContent = "Save task";
  elements.cancelCalendarTaskBtn.classList.remove("hidden");
  renderCalendar();
  elements.calendarTaskTitle.focus();
}

function editCalendarActivity(activity) {
  if (activity.source === "Calendar Task") {
    editCalendarTask(activity.id);
    return;
  }

  if (activity.source !== "Modification") return;

  const record = state.data.modification.find(item => item.id === activity.id);
  if (!record) return;

  state.activeView = "modification";
  state.modificationProject = "All";
  render({ keepFormOpen: true });
  showForm(record);
}

function deleteCalendarTask(id) {
  const task = state.data.calendarTasks.find(record => record.id === id);
  if (!task) return;

  showDeleteModal({
    id,
    title: "Delete Calendar Task",
    message: "This task will be removed from the calendar.",
    label: "Task",
    name: task.title || "Untitled task",
    confirmText: "Delete task",
    onConfirm: () => {
      state.data.calendarTasks = state.data.calendarTasks.filter(record => record.id !== id);
      if (state.calendarEditId === id) hideCalendarTaskForm();
      saveData();
      renderCalendar();
    }
  });
}

function deleteCalendarActivity(activity) {
  if (activity.source === "Calendar Task") {
    deleteCalendarTask(activity.id);
    return;
  }

  if (activity.source !== "Modification") return;

  const record = state.data.modification.find(item => item.id === activity.id);
  if (!record) return;

  showDeleteModal({
    id: activity.id,
    title: "Delete Activity",
    message: "This activity will be removed from the modification records.",
    label: "Activity",
    name: record.details || record.projectName || "Untitled activity",
    confirmText: "Delete activity",
    onConfirm: () => {
      state.data.modification = state.data.modification.filter(item => item.id !== activity.id);
      if (state.editId === activity.id && state.activeView === "modification") hideForm();
      saveData();
      renderCalendar();
    }
  });
}

function setActionButtonContent(button, icon, label) {
  const iconEl = document.createElement("span");

  iconEl.className = "btn-symbol";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = icon;
  button.replaceChildren(iconEl);
  button.setAttribute("aria-label", label);
  button.title = label;
}

function calendarActivities(projectName = state.calendarProject) {
  const parseIdNumber = id => Number(String(id).replace(/^[A-Z]+-/, "")) || 0;
  const calendarTasks = state.data.calendarTasks
    .filter(record => projectName === "All" || record.projectName === projectName)
    .map(record => ({
      id: record.id,
      projectName: record.projectName,
      title: record.title,
      source: "Calendar Task",
      editable: true,
      date: parseDateKey(record.date)
    }))
    .filter(activity => activity.date);

  return calendarTasks.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return parseIdNumber(a.id) - parseIdNumber(b.id);
  });
}

function weekStart(date) {
  const start = new Date(date);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

function calendarRange() {
  const base = new Date(state.calendarDate);
  if (state.calendarMode === "week") {
    return { start: weekStart(base), days: 7 };
  }

  const firstOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
  const start = weekStart(firstOfMonth);
  return { start, days: 42 };
}

function renderCalendar() {
  updateCalendarProjects();

  const monthLabel = state.calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  const activities = calendarActivities();
  const activityMap = activities.reduce((map, activity) => {
    map[activity.date] = map[activity.date] || [];
    map[activity.date].push(activity);
    return map;
  }, {});
  const today = dateKey(new Date());
  const currentMonth = state.calendarDate.getMonth();
  const { start, days } = calendarRange();

  elements.calendarTitle.textContent = state.calendarMode === "week"
    ? `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : monthLabel;
  elements.weekViewBtn.classList.toggle("primary", state.calendarMode === "week");
  elements.weekViewBtn.classList.toggle("secondary", state.calendarMode !== "week");
  elements.monthViewBtn.classList.toggle("primary", state.calendarMode === "month");
  elements.monthViewBtn.classList.toggle("secondary", state.calendarMode !== "month");

  elements.calendarGrid.innerHTML = "";
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(dayName => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-day-name";
    dayHeader.textContent = dayName;
    elements.calendarGrid.append(dayHeader);
  });

  for (let index = 0; index < days; index += 1) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + index);
    const key = dateKey(cellDate);
    const dayActivities = activityMap[key] || [];
    const cell = document.createElement("div");
    const dateNumber = document.createElement("strong");

    cell.className = "calendar-day";
    cell.classList.toggle("outside-month", state.calendarMode === "month" && cellDate.getMonth() !== currentMonth);
    cell.classList.toggle("today", key === today);
    cell.classList.toggle("selected", key === dateKey(state.calendarSelectedDate));
    cell.addEventListener("click", () => {
      state.calendarSelectedDate = new Date(cellDate);
      elements.calendarTaskDate.value = key;
      renderCalendar();
    });
    dateNumber.textContent = cellDate.getDate();
    cell.append(dateNumber);

    dayActivities.slice(0, 3).forEach(activity => {
      const chip = document.createElement(activity.editable ? "button" : "span");
      chip.className = "calendar-activity";
      chip.title = `${activity.source}: ${activity.projectName}`;
      chip.textContent = activity.title || activity.projectName;

      if (activity.editable) {
        chip.type = "button";
        chip.classList.add("is-editable");
        chip.setAttribute("aria-label", `Edit ${activity.title}`);
        chip.addEventListener("click", event => {
          event.stopPropagation();
          editCalendarActivity(activity);
        });
      }

      cell.append(chip);
    });

    if (dayActivities.length > 3) {
      const extra = document.createElement("span");
      extra.className = "calendar-more";
      extra.textContent = `+${dayActivities.length - 3} more`;
      cell.append(extra);
    }

    elements.calendarGrid.append(cell);
  }

  renderSelectedDatePanel();
}

function renderSelectedDatePanel() {
  const selectedKey = dateKey(state.calendarSelectedDate);
  const activities = calendarActivities().filter(activity => activity.date === selectedKey);

  elements.selectedDateText.textContent = state.calendarSelectedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
  elements.selectedActivityCount.textContent = `${activities.length} Activit${activities.length === 1 ? "y" : "ies"}`;
  elements.calendarTaskDate.value = selectedKey;
  if (state.calendarProject !== "All") {
    elements.calendarTaskProject.value = state.calendarProject;
  }
  if (!elements.calendarTaskProject.value && elements.calendarTaskProject.options.length) {
    elements.calendarTaskProject.value = elements.calendarTaskProject.options[0].value;
  }
  elements.selectedActivityList.innerHTML = "";

  if (!activities.length) {
    const empty = document.createElement("p");
    empty.textContent = "No activities yet.";
    elements.selectedActivityList.append(empty);
    return;
  }

  activities.forEach(activity => {
    const item = document.createElement("article");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");

    item.className = "selected-activity-item";
    content.className = "selected-activity-content";
    title.textContent = activity.title;
    meta.textContent = activity.projectName;

    content.append(title, meta);
    item.append(content);

    if (activity.editable) {
      const actions = document.createElement("div");
      const editBtn = document.createElement("button");
      const deleteBtn = document.createElement("button");

      item.classList.add("is-editable");
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Edit ${activity.title}`);
      item.addEventListener("click", () => editCalendarActivity(activity));
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          editCalendarActivity(activity);
        }
      });

      actions.className = "selected-activity-actions";
      editBtn.type = "button";
      editBtn.className = "secondary";
      setActionButtonContent(editBtn, "✎", "Edit");
      editBtn.addEventListener("click", event => {
        event.stopPropagation();
        editCalendarActivity(activity);
      });
      editBtn.querySelector(".btn-symbol").textContent = "E";

      deleteBtn.type = "button";
      deleteBtn.className = "danger";
      setActionButtonContent(deleteBtn, "×", "Delete");
      deleteBtn.addEventListener("click", event => {
        event.stopPropagation();
        deleteCalendarActivity(activity);
      });
      deleteBtn.querySelector(".btn-symbol").textContent = "X";

      actions.append(editBtn);
      actions.append(deleteBtn);
      item.append(actions);
    }

    elements.selectedActivityList.append(item);
  });
}

function fileToAttachment(file) {
  return new Promise((resolve, reject) => {
    if (!file?.name) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      attachmentName: file.name,
      attachmentType: file.type,
      attachmentData: reader.result
    });
    reader.onerror = () => reject(new Error("Attachment could not be read."));
    reader.readAsDataURL(file);
  });
}

function recordSaveMessage(viewKey) {
  if (viewKey === "project") return "Project record successfully saved.";
  if (viewKey === "testCases") return "Test case record successfully saved.";
  return `${directoryViews[viewKey].label} record successfully saved.`;
}

function showSaveMessage(message) {
  if (!elements.saveToast) return;
  window.clearTimeout(saveMessageTimer);
  elements.saveToast.textContent = message;
  elements.saveToast.classList.remove("hidden");
  saveMessageTimer = window.setTimeout(() => {
    elements.saveToast.classList.add("hidden");
    elements.saveToast.textContent = "";
  }, 3200);
}

function minimumLengthMessage(view, payload) {
  const developerRemarksRequired = state.activeView === "testCases" && isDeveloperTestCaseRemarksOnly();
  const field = view.fields.find(item => item.minLength && (
    String(payload[item.key] || "").length > 0 ||
    (developerRemarksRequired && item.key === "developerRemarks")
  ));
  if (!field) return "";

  const value = String(payload[field.key] || "");
  if (value.length >= field.minLength) return "";
  return `${field.label} must be at least ${field.minLength} characters.`;
}

async function handleSave(event) {
  event.preventDefault();
  const view = directoryViews[state.activeView];
  if (!state.editId && state.activeView === "userManagement" && !isCurrentAdmin()) {
    showMessageModal({
      title: "Admin Access Required",
      message: "Only the admin can add User Management records."
    });
    hideForm();
    return;
  }

  const formData = new FormData(elements.recordForm);
  const payload = {};
  const attachmentFile = formData.get("attachmentName");

  view.fields.filter(field => field.form !== false).forEach(field => {
    if (field.type === "file") return;
    payload[field.key] = String(formData.get(field.key) || "").trim();
  });

  const lengthMessage = minimumLengthMessage(view, payload);
  if (lengthMessage) {
    showMessageModal({
      title: "Minimum Characters Required",
      message: lengthMessage
    });
    elements.formFields.querySelector(`[name="developerRemarks"]`)?.focus();
    return;
  }

  const baselineDefaults = firstProjectDefaults(state.activeView, payload.projectName, state.editId);
  if (state.activeView === "modification") {
    if (baselineDefaults.requested) payload.requested = baselineDefaults.requested;
    if (baselineDefaults.dateRequested) payload.dateRequested = parseDateKey(baselineDefaults.dateRequested) || baselineDefaults.dateRequested;
  }
  if (state.activeView === "modificationForm" && baselineDefaults.clientDepartment && !payload.clientDepartment) {
    payload.clientDepartment = baselineDefaults.clientDepartment;
  }
  if (state.activeView === "modificationForm" && baselineDefaults.requested && !payload.requested) {
    payload.requested = baselineDefaults.requested;
  }
  if (state.activeView === "modificationForm" && baselineDefaults.targetCompletionDate && !payload.targetCompletionDate) {
    payload.targetCompletionDate = parseDateKey(baselineDefaults.targetCompletionDate) || baselineDefaults.targetCompletionDate;
  }
  if (state.activeView === "testCases") {
    const existingRecord = state.editId
      ? state.data.testCases.find(record => record.id === state.editId)
      : null;
    const developerRemarksOnly = isDeveloperTestCaseRemarksOnly();
    const submittedDeveloperRemarks = payload.developerRemarks;

    if (developerRemarksOnly && !existingRecord) {
      showMessageModal({
        title: "Developer Remarks Only",
        message: "Developers can update Developer Remarks on existing test cases only."
      });
      return;
    }

    if (developerRemarksOnly) {
      Object.keys(payload).forEach(key => delete payload[key]);
      Object.assign(payload, existingRecord, {
        developerRemarks: submittedDeveloperRemarks
      });
    } else {
      payload.qa = currentLoggedInQaName() || payload.qa || baselineDefaults.qa;
    }

    const currentUserName = currentLoggedInAccountName();
    const existingQaRemarks = String(existingRecord?.qaRemarks || existingRecord?.remarks || "").trim();
    const existingDeveloperRemarks = String(existingRecord?.developerRemarks || "").trim();

    if (!developerRemarksOnly && payload.qaRemarks) {
      payload.qaRemarksBy = payload.qaRemarks === existingQaRemarks
        ? existingRecord?.qaRemarksBy || existingRecord?.qa || currentUserName
        : currentUserName;
    }

    if (payload.developerRemarks) {
      payload.developer = payload.developerRemarks === existingDeveloperRemarks
        ? existingRecord?.developer || existingRecord?.developerRemarksBy || currentUserName
        : currentUserName;
      payload.developerRemarksBy = payload.developerRemarks === existingDeveloperRemarks
        ? existingRecord?.developerRemarksBy || existingRecord?.developer || currentUserName
        : currentUserName;
    }
  }

  try {
    const attachment = await fileToAttachment(attachmentFile);
    if (attachment) Object.assign(payload, attachment);
  } catch (error) {
    showMessageModal({
      title: "Attachment Error",
      message: error.message
    });
    return;
  }

  if (view.fields.some(field => field.required && !payload[field.key])) return;

  const wasEditing = Boolean(state.editId);

  if (wasEditing) {
    state.data[state.activeView] = state.data[state.activeView].map(record => {
      if (record.id !== state.editId) return record;
      
      let newId = record.id;
      if (record.projectName !== payload.projectName) {
        if (state.activeView === "modification") newId = nextModificationId(payload.projectName);
        if (state.activeView === "testCases") newId = nextTestCaseId(payload.projectName);
      }

      return {
        ...record,
        ...payload,
        id: newId,
        ...(state.activeView === "testCases" && baselineDefaults.dateTested ? { dateTested: baselineDefaults.dateTested } : {})
      };
    });
  } else {
    let id;
    if (state.activeView === "modification") id = nextModificationId(payload.projectName);
    else if (state.activeView === "testCases") id = nextTestCaseId(payload.projectName);
    else id = nextId(state.activeView);

    const record = { id, ...payload };
    if (view.generatedDateKey) record[view.generatedDateKey] =
      state.activeView === "testCases" && baselineDefaults.dateTested
        ? baselineDefaults.dateTested
        : enrollmentDate();
    state.data[state.activeView].unshift(record);
  }

  saveData();
  showSaveMessage(recordSaveMessage(state.activeView));
  if (wasEditing) {
    hideForm();
    render();
  } else {
    state.editId = "";
    elements.editId.value = "";
    render({ keepFormOpen: true });
    showForm();
  }
}

function renderTableHeader(view) {
  elements.tableHead.innerHTML = "";
  const row = document.createElement("tr");
  const fieldGroups = tableFieldGroups(state.activeView, view);
  const hasAttachments = view.fields.some(f => f.type === "file");
  const columns = [view.idLabel, ...fieldGroups.beforeGenerated.map(field => field.label)];
  if (view.generatedDateKey) columns.push(view.generatedDateLabel);
  columns.push(...fieldGroups.afterGenerated.map(field => field.label));
  if (hasAttachments) columns.push("Attachment");
  columns.push("Action");

  columns.forEach(column => {
    const th = document.createElement("th");
    th.textContent = column;
    row.append(th);
  });

  elements.tableHead.append(row);
}

function shouldCollapseDetails(value) {
  const text = String(value || "").trim();
  if (!text) return false;

  const lineCount = text.split(/\r\n|\r|\n/).length;
  return lineCount > EXPANDABLE_DETAILS_LINE_LIMIT || text.length > EXPANDABLE_DETAILS_CHAR_LIMIT;
}

function renderExpandableDetailsCell(cell, value, { renderAddedBy = false } = {}) {
  const text = String(value || "").trim();
  if (!text) {
    cell.textContent = "-";
    return;
  }

  const wrap = document.createElement("div");
  const content = document.createElement("div");
  const isCollapsible = shouldCollapseDetails(text);

  wrap.className = "expandable-details";
  content.className = "expandable-details-content";
  if (renderAddedBy) {
    cell.classList.add("added-by-cell");
    setCellTooltip(cell, addedByTooltipText(text), text);
    renderAddedByRemarksContent(content, text);
  } else {
    content.textContent = text;
  }
  wrap.append(content);

  if (isCollapsible) {
    const toggle = document.createElement("button");

    wrap.classList.add("is-collapsed");
    toggle.className = "expandable-details-toggle";
    toggle.type = "button";
    toggle.textContent = "See more";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", event => {
      event.stopPropagation();
      const isExpanded = wrap.classList.toggle("is-expanded");

      wrap.classList.toggle("is-collapsed", !isExpanded);
      toggle.textContent = isExpanded ? "See less" : "See more";
      toggle.setAttribute("aria-expanded", String(isExpanded));
    });

    wrap.append(toggle);
  }

  cell.append(wrap);
}

function shouldRenderExpandableTableText(field) {
  return ["details", "remarks"].includes(field?.key);
}

function renderDashboardMiniCalendar(baseDate, activities) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstOfMonth.getDay();
  const activityCounts = activities.reduce((counts, activity) => {
    counts[activity.date] = (counts[activity.date] || 0) + 1;
    return counts;
  }, {});

  elements.dashboardMiniCalendar.innerHTML = "";

  const monthTitle = document.createElement("strong");
  const grid = document.createElement("div");
  monthTitle.className = "mini-calendar-title";
  monthTitle.textContent = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  grid.className = "mini-calendar-grid";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const cell = document.createElement("span");
    cell.className = "mini-calendar-day-name";
    cell.textContent = day;
    grid.append(cell);
  });

  for (let index = 0; index < startOffset; index += 1) {
    const blank = document.createElement("span");
    blank.className = "mini-calendar-empty";
    grid.append(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = new Date(year, month, day);
    const key = dateKey(cellDate);
    const count = activityCounts[key] || 0;
    const cell = document.createElement("button");

    cell.type = "button";
    cell.className = "mini-calendar-day";
    cell.classList.toggle("today", key === dateKey(new Date()));
    cell.classList.toggle("has-activity", count > 0);
    cell.textContent = day;
    cell.title = count ? `${count} activit${count === 1 ? "y" : "ies"}` : "No activity";
    cell.addEventListener("click", () => {
      state.activeView = "calendar";
      state.calendarDate = cellDate;
      state.calendarSelectedDate = cellDate;
      render();
    });
    grid.append(cell);
  }

  elements.dashboardMiniCalendar.append(monthTitle, grid);
}

function renderDashboardDistribution(statusRows) {
  const total = statusRows.reduce((sum, row) => sum + row.count, 0);
  let filled = 0;
  const segments = statusRows.filter(row => row.count > 0).map(row => {
    const start = filled;
    const end = total ? filled + (row.count / total) * 100 : filled;
    filled = end;
    // Adding a small gap between segments for a more professional look
    const gap = total > 0 ? 0.8 : 0;
    return `var(--status-${statusClass(row.status)}, var(--primary)) ${start}% ${end - (row.count > 0 ? gap : 0)}%, transparent ${end - gap}% ${end}%`;
  });

  elements.dashboardDistributionTotal.textContent = total;
  elements.dashboardDonut.style.background = total
    ? `conic-gradient(${segments.join(", ")})`
    : "var(--surface-soft)";
  elements.dashboardDistributionLegend.innerHTML = "";

  statusRows.forEach(row => {
    const percent = total ? Math.round((row.count / total) * 100) : 0;
    const item = document.createElement("div");
    item.className = `dashboard-legend-item status-${statusClass(row.status)}`;
    item.innerHTML = `<span></span><strong>${row.status}</strong><em>${row.count} (${percent}%)</em>`;
    elements.dashboardDistributionLegend.append(item);
  });
}

function renderDashboardRecentActivity(modificationRecords, calendarTaskRecords) {
  const modificationItems = modificationRecords.map(record => ({
    title: record.status === "Complete" ? "Task completed" : "Project updated",
    detail: record.projectName,
    date: parseDateKey(record.dateModified || record.dateRequested || record.dateReported),
    className: `status-${statusClass(record.status)}`
  }));
  const taskItems = calendarTaskRecords.map(record => ({
    title: "New task created",
    detail: record.title || record.projectName,
    date: parseDateKey(record.date),
    className: "status-in-progress"
  }));

  elements.dashboardRecentActivity.innerHTML = "";
  [...modificationItems, ...taskItems]
    .filter(item => item.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .forEach(item => {
      const row = document.createElement("div");
      row.className = `recent-activity-item ${item.className}`;
      row.innerHTML = `
        <span class="recent-activity-icon" aria-hidden="true"></span>
        <div class="recent-activity-content">
          <strong>${item.title}</strong>
          <small>${item.detail}</small>
        </div>
        <time>${detailDateLabel(item.date)}</time>
      `;
      elements.dashboardRecentActivity.append(row);
    });

  if (!elements.dashboardRecentActivity.children.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-empty-note";
    empty.textContent = "No recent activity yet.";
    elements.dashboardRecentActivity.append(empty);
  }
}

function recordsInNextDays(records, key, baseDate = new Date(), days = 7) {
  const start = dateKey(baseDate);
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + days);
  const end = dateKey(endDate);

  return records.filter(record => {
    const recordDate = parseDateKey(record[key]);
    return recordDate && recordDate >= start && recordDate <= end;
  });
}

function projectHealthRows(projectNames, modificationRecords, calendarTaskRecords) {
  const names = projectNames.length
    ? projectNames
    : [...new Set([
      ...modificationRecords.map(record => record.projectName),
      ...calendarTaskRecords.map(record => record.projectName)
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return names.map(projectName => {
    const modifications = modificationRecords.filter(record => record.projectName === projectName);
    const tasks = calendarTaskRecords.filter(record => record.projectName === projectName);
    const complete = modifications.filter(record => record.status === "Complete").length;
    const review = modifications.filter(record => record.status === "For Review").length;
    const open = modifications.filter(record => record.status !== "Complete").length;
    const completion = modifications.length ? Math.round((complete / modifications.length) * 100) : 0;
    const label = open > 3 ? "Needs Focus" : review > 0 ? "In Review" : completion === 100 && modifications.length ? "On Track" : "Active";

    return {
      projectName,
      completion,
      open,
      review,
      tasks: tasks.length,
      label
    };
  }).sort((a, b) => b.open - a.open || b.tasks - a.tasks || a.projectName.localeCompare(b.projectName));
}

function renderDashboardProjectHealth(rows) {
  elements.dashboardProjectHealth.innerHTML = "";

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "dashboard-empty-note";
    empty.textContent = "No project health data yet.";
    elements.dashboardProjectHealth.append(empty);
    return;
  }

  rows.slice(0, 6).forEach(row => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dashboard-health-item";
    item.addEventListener("click", () => {
      const records = state.data.modification.filter(record => record.projectName === row.projectName);
      showDashboardDetailModal(`${row.projectName} Modifications`, records, "modification");
    });
    item.innerHTML = `
      <span class="health-title">
        <strong>${escapeHtml(row.projectName)}</strong>
        <em>${escapeHtml(row.label)}</em>
      </span>
      <span class="health-meter" aria-hidden="true"><i style="width: ${row.completion}%"></i></span>
      <span class="health-meta">
        <small>${row.completion}% complete</small>
        <small>${row.open} open</small>
        <small>${row.tasks} tasks</small>
      </span>
    `;
    elements.dashboardProjectHealth.append(item);
  });
}

function isMeetingTask(task) {
  return /\bmeeting\b/i.test(String(task?.title || ""));
}

function launchStatusConfetti(sourceElement) {
  if (!sourceElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  const colors = ["#22c55e", "#38bdf8", "#facc15", "#fb7185", "#a78bfa", "#ffffff"];

  sourceElement.classList.remove("dashboard-card-celebrate");
  void sourceElement.offsetWidth;
  sourceElement.classList.add("dashboard-card-celebrate");
  window.setTimeout(() => sourceElement.classList.remove("dashboard-card-celebrate"), 900);

  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 34 + (Math.random() - 0.5) * 0.9;
    const distance = 90 + Math.random() * 120;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance - 40 - Math.random() * 70;

    piece.className = "confetti-piece";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.setProperty("--confetti-x", `${x}px`);
    piece.style.setProperty("--confetti-y", `${y}px`);
    piece.style.setProperty("--confetti-rotate", `${Math.random() * 540 - 270}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.animationDelay = `${Math.random() * 0.08}s`;
    document.body.append(piece);

    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function renderDashboard() {
  updateDashboardProjectSelect();
  const today = new Date();
  const month = monthBounds(today);
  const selectedProject = state.dashboardProject;
  const projectMatches = record => selectedProject === "All" || record.projectName === selectedProject;
  const dashboardCalendarTasks = state.data.calendarTasks.filter(projectMatches);
  const dashboardModifications = state.data.modification.filter(projectMatches);
  const dashboardProjectNames = projectOptions().filter(projectName => selectedProject === "All" || projectName === selectedProject);
  const monthlyTasks = recordsInMonth(dashboardCalendarTasks, "date", today);
  const todayKey = dateKey(today);
  const todayMeetingTasks = monthlyTasks.filter(task =>
    parseDateKey(task.date) === todayKey &&
    isMeetingTask(task)
  );

  elements.pageTitle.textContent = "Dashboard";
  elements.dashboardSubtitle.textContent = selectedProject === "All"
    ? "Portfolio snapshot across all enrolled projects."
    : `Focused snapshot for ${selectedProject}.`;
  elements.dashboardTaskMonthLabel.textContent = month.label;
  elements.dashboardTaskMonthCount.textContent = monthlyTasks.length;
  elements.dashboardMeetingDayCount.textContent = todayMeetingTasks.length;

  document.querySelector('[data-dashboard-detail="monthlyTasks"]').onclick = () => {
    showDashboardDetailModal(`Tasks for ${month.label}`, monthlyTasks, "task");
  };
  document.querySelector('[data-dashboard-detail="todayMeetings"]').onclick = () => {
    showDashboardDetailModal(`Meetings for ${detailDateLabel(todayKey)}`, todayMeetingTasks, "task");
  };

  const renderStatusCards = (viewKey, container) => {
    const statusOptions = directoryViews[viewKey].fields.find(f => f.key === "status")?.options || [];
    const sourceRecords = viewKey === "modification" ? dashboardModifications : state.data[viewKey].filter(projectMatches);
    container.innerHTML = "";
    statusOptions.forEach(status => {
      const statusRecords = sourceRecords.filter(record => record.status === status);
      const card = document.createElement("button");
      const icon = document.createElement("span");
      const labelWrap = document.createElement("span");
      const label = document.createElement("span");
      const value = document.createElement("strong");

      card.type = "button";
      card.className = `dashboard-card status-${statusClass(status)}`;
      icon.className = "status-icon";
      icon.setAttribute("aria-hidden", "true");
      labelWrap.className = "dashboard-card-label";
      label.textContent = status;
      value.textContent = statusRecords.length;
      card.addEventListener("click", () => {
        if (["complete", "passed"].includes(statusClass(status))) {
          launchStatusConfetti(card);
        }
        showDashboardDetailModal(`${status} ${directoryViews[viewKey].label}`, statusRecords, viewKey);
      });

      labelWrap.append(icon, label);
      card.append(labelWrap, value);
      container.append(card);
    });
  };

  renderStatusCards("modification", elements.dashboardStatusCounts);
  renderStatusCards("testCases", elements.dashboardTestCaseStatusCounts);

  const statusOptions = directoryViews.modification.fields.find(f => f.key === "status")?.options || [];

  const statusDistribution = statusOptions.map(status => ({
    status,
    count: dashboardModifications.filter(record => record.status === status).length
  }));

  renderDashboardMiniCalendar(today, calendarActivities(selectedProject));
  renderDashboardDistribution(statusDistribution);
  renderDashboardRecentActivity(dashboardModifications, dashboardCalendarTasks);
  renderDashboardProjectHealth(projectHealthRows(dashboardProjectNames, dashboardModifications, dashboardCalendarTasks));
}

function render(options = {}) {
  if (approvalRouteProject) {
    showApprovalRoute();
    return;
  }

  renderUserProfile();

  if (state.activeView === "userManagement" && !canViewUserManagement()) {
    state.activeView = "dashboard";
    hideForm();
  }

  if (state.activeView !== "dashboard" && !isCalendarView() && !directoryViews[state.activeView]) {
    state.activeView = "dashboard";
    hideForm();
  }

  document.body.dataset.view = state.activeView;
  document.body.classList.toggle("calendar-view", isCalendarView());
  elements.navButtons.forEach(button => {
    const isActive = button.dataset.directory === state.activeView;
    const isRestrictedUserManagement = button.dataset.directory === "userManagement" && !canViewUserManagement();
    button.classList.toggle("hidden", isRestrictedUserManagement);
    button.classList.toggle("active", isActive);
    button.toggleAttribute("aria-current", isActive);
  });
  elements.dashboardPanel.classList.toggle("hidden", state.activeView !== "dashboard");
  elements.calendarPanel.classList.toggle("hidden", !isCalendarView());
  elements.modificationFilterPanel.classList.toggle(
    "hidden",
    state.activeView !== "modification" &&
      state.activeView !== "modificationForm" &&
      state.activeView !== "testCases"
  );
  const canCreateInView = canCreateInCurrentView();
  if (!options.keepFormOpen) {
    elements.recordFormPanel.classList.add("hidden");
  }
  document.querySelector(".records-panel").classList.toggle("hidden", isCalendarView() || state.activeView === "dashboard");
  elements.createBtn.classList.toggle("hidden", isCalendarView() || state.activeView === "dashboard" || !canCreateInView);
  elements.exportBtn.classList.toggle("hidden", isCalendarView() || state.activeView === "dashboard");
  elements.exportWordBtn?.classList.toggle("hidden", state.activeView !== "modificationForm");
  elements.exportPdfBtn?.classList.toggle("hidden", state.activeView !== "modificationForm");
  elements.approvalProjectLinkBtn?.classList.toggle("hidden", state.activeView !== "modificationForm");

  if (state.activeView === "dashboard") {
    renderDashboard();
    return;
  }

  if (isCalendarView()) {
    elements.pageTitle.textContent = "Task Calendar Activities";
    renderCalendar();
    return;
  }

  const view = directoryViews[state.activeView];
  const hasAttachments = view.fields.some(f => f.type === "file");
  if (
    state.activeView === "modification" ||
    state.activeView === "modificationForm" ||
    state.activeView === "testCases"
  ) {
    updateModificationProjectFilter();
  }
  const fieldGroups = tableFieldGroups(state.activeView, view);
  const tableFields = [...fieldGroups.beforeGenerated, ...fieldGroups.afterGenerated];
  const records = sortedVisibleRecords(state.activeView);

  elements.pageTitle.textContent = view.title;
  renderTableHeader(view);
  elements.recordRows.innerHTML = "";

  if (!records.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    const staticCols = hasAttachments ? 4 : 3;
    cell.colSpan = tableFields.length + staticCols;
    cell.className = "empty-cell";
    cell.textContent = "No records found.";
    row.append(cell);
    elements.recordRows.append(row);
    return;
  }

  records.forEach(record => {
    const row = document.createElement("tr");
    const cells = [
      { value: record.id },
      ...fieldGroups.beforeGenerated.map(field => ({ field, value: tableFieldValue(record, field) }))
    ];
    if (view.generatedDateKey) cells.push({ value: record[view.generatedDateKey] });
    cells.push(...fieldGroups.afterGenerated.map(field => ({ field, value: tableFieldValue(record, field) })));

    cells.forEach(({ field, value }) => {
      const cell = document.createElement("td");
      const remarkTitle = testCaseRemarkTooltip(record, field?.key);
      if (
        field?.type === "textarea" ||
        ["details", "remarks", "qaRemarks", "developerRemarks"].includes(field?.key)
      ) {
        cell.classList.add("multiline-text-cell");
      }
      setCellTooltip(cell, remarkTitle, value);
      if (field?.key === "status") {
        cell.textContent = "";
        const badge = document.createElement("span");
        badge.className = `status-badge status-${statusClass(value)}`;
        badge.textContent = value || "-";
        cell.append(badge);
      } else if (shouldRenderExpandableTableText(field)) {
        renderExpandableDetailsCell(cell, value, { renderAddedBy: field?.key === "remarks" });
      } else {
        cell.textContent = value || "-";
      }
      row.append(cell);
    });

    if (hasAttachments) {
      // Dedicated Attachment Column
      const attachmentCell = document.createElement("td");
      const isImage = isImageAttachment(record);

      if (isImage) {
        const link = document.createElement("a");
        const image = document.createElement("img");

        link.className = "attachment-preview-link";
        link.href = "#";
        link.title = record.attachmentName;
        link.addEventListener("click", event => {
          event.preventDefault();
          showAttachmentPreview(record.attachmentData, record.attachmentName);
        });

        image.className = "attachment-preview";
        image.src = record.attachmentData;
        image.alt = record.attachmentName;

        link.append(image);
        attachmentCell.append(link);
      } else {
        const attachment = record.attachmentData
          ? document.createElement("a")
          : document.createElement("span");
        attachment.className = record.attachmentData ? "attachment-link" : "attachment-empty";
        attachment.textContent = record.attachmentName
          ? record.attachmentName
          : "No attachment";
        if (record.attachmentData) {
          attachment.href = record.attachmentData;
          attachment.target = "_blank";
        }
        attachmentCell.append(attachment);
      }
      row.append(attachmentCell);
    }

    const actionCell = document.createElement("td");
    actionCell.className = "action-cell";

    const editBtn = document.createElement("button");
    editBtn.className = "secondary";
    editBtn.type = "button";
    setActionButtonContent(editBtn, "✎", "Edit");
    editBtn.addEventListener("click", () => editRecord(record.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.type = "button";
    setActionButtonContent(deleteBtn, "×", "Delete");
    deleteBtn.addEventListener("click", () => deleteRecord(record.id));

    if (canEditCurrentRecord()) {
      actionCell.append(editBtn);
    }

    if (canDeleteCurrentRecord()) {
      actionCell.append(deleteBtn);
    }
    row.append(actionCell);
    elements.recordRows.append(row);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addedByRemarksHtml(value) {
  const addedByPattern = /^Added by\s+([^:]+):\s*(.*)$/i;
  return String(value || "")
    .split(/\r\n|\r|\n/)
    .map(line => {
      const match = line.match(addedByPattern);
      if (!match) return escapeHtml(line);

      const [, authorName, remarkText] = match;
      const normalizedAuthor = authorName.trim();
      const tooltip = `Added by ${normalizedAuthor}`;
      return `<span class="added-by-chip" data-tooltip="${escapeHtml(tooltip)}">${escapeHtml(remarkText)}</span>`;
    })
    .join("<br>");
}

function compactFormDate(value) {
  const key = parseDateKey(value);
  if (!key) return "";

  const [year, month, day] = key.split("-");
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${day}${monthNames[Number(month) - 1] || ""}${year}`;
}

function formatApprovalTimestamp(value) {
  if (!value) return "";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function approvalLink(projectName) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("approveProject", projectName);
  return url.toString();
}

function approvalRouteRecords() {
  if (!approvalRouteProject) return [];
  return projectModificationFormRecords(approvalRouteProject);
}

function renderApprovalRemarks(records) {
  if (!elements.approvalRemarksList) return;
  elements.approvalRemarksList.innerHTML = "";

  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "approval-remarks-empty";
    empty.textContent = "No details available.";
    elements.approvalRemarksList.append(empty);
    return;
  }

  const editor = document.createElement("div");
  editor.className = "approval-remarks-editor";

  const selectLabel = document.createElement("label");
  selectLabel.className = "approval-remarks-select";

  const selectText = document.createElement("span");
  selectText.textContent = "Detail No.";

  const detailSelect = document.createElement("select");
  detailSelect.setAttribute("aria-label", "Select detail number");

  const detailPreview = document.createElement("p");
  detailPreview.className = "approval-remarks-detail";

  const existingRemarksPreview = document.createElement("p");
  existingRemarksPreview.className = "approval-remarks-history";

  const remarksLabel = document.createElement("label");
  remarksLabel.className = "approval-remarks-input";

  const remarksText = document.createElement("span");
  remarksText.textContent = "Remarks Details";

  const remarksTextarea = document.createElement("textarea");
  remarksTextarea.placeholder = "Add remarks for the selected detail no.";
  remarksTextarea.rows = 4;

  const remarkStore = document.createElement("div");
  remarkStore.className = "approval-remarks-store";
  remarkStore.hidden = true;

  records.forEach((record, index) => {
    const option = document.createElement("option");
    option.value = record.id;
    option.textContent = `Details No. ${index + 1}`;
    option.dataset.detailText = String(record.details || "").trim() || "No details provided.";
    option.dataset.existingRemarks = approvalRemarksText(record);
    detailSelect.append(option);

    const storedRemark = document.createElement("textarea");
    storedRemark.dataset.recordId = record.id;
    storedRemark.value = "";
    remarkStore.append(storedRemark);
  });

  const selectedRemarkInput = () =>
    Array.from(remarkStore.querySelectorAll("textarea[data-record-id]"))
      .find(input => input.dataset.recordId === detailSelect.value);

  const syncEditorFromSelectedDetail = () => {
    const selectedOption = detailSelect.selectedOptions[0];
    const storedRemark = selectedRemarkInput();
    detailPreview.textContent = selectedOption?.dataset.detailText || "No details provided.";
    const existingRemarks = selectedOption?.dataset.existingRemarks || "";
    existingRemarksPreview.textContent = existingRemarks
      ? `Existing remarks:\n${existingRemarks}`
      : "No existing remarks for this detail.";
    remarksTextarea.value = storedRemark?.value || "";
  };

  detailSelect.addEventListener("change", syncEditorFromSelectedDetail);
  remarksTextarea.addEventListener("input", () => {
    const storedRemark = selectedRemarkInput();
    if (storedRemark) storedRemark.value = remarksTextarea.value;
  });

  selectLabel.append(selectText, detailSelect);
  remarksLabel.append(remarksText, remarksTextarea);
  editor.append(selectLabel, detailPreview, existingRemarksPreview, remarksLabel, remarkStore);
  elements.approvalRemarksList.append(editor);
  syncEditorFromSelectedDetail();
}

function approvalRemarksByRecordId() {
  const remarks = new Map();
  elements.approvalRemarksList
    ?.querySelectorAll("textarea[data-record-id]")
    .forEach(input => {
      remarks.set(input.dataset.recordId, input.value.trim());
    });
  return remarks;
}

function approvalRecordsWithCurrentRemarks(records = approvalRouteRecords()) {
  const remarksById = approvalRemarksByRecordId();
  const pendingName = elements.approvalNameInput?.value.trim() || "Current approver";
  const pendingPosition = elements.approvalPositionInput?.value.trim() || "";
  return records.map(record => ({
    ...record,
    approvalRemarks: [
      ...approvalRemarkEntries(record),
      ...(remarksById.get(record.id)
        ? [{
            name: pendingName,
            position: pendingPosition,
            approvedDateTime: "",
            remark: remarksById.get(record.id)
          }]
        : [])
    ]
  }));
}

function updateApprovalActionState() {
  if (!elements.approveFormBtn) return;
  const hasRecords = approvalRouteRecords().length > 0;
  const canEditApproval = hasRecords && approvalFormViewed;

  elements.approvalNameInput.disabled = !canEditApproval;
  elements.approvalPositionInput.disabled = !canEditApproval;
  elements.approveFormBtn.disabled = !canEditApproval;
  elements.approvalPreviewPdfBtn.disabled = !hasRecords;
  elements.approvalPreviewPdfBtn.classList.toggle("approval-required-action", hasRecords && !approvalFormViewed);
  elements.approvalPdfPrompt?.classList.toggle("approval-pdf-prompt-required", hasRecords && !approvalFormViewed);
  elements.approvalRemarksList
    ?.querySelectorAll("select, textarea:not([data-record-id])")
    .forEach(input => {
      input.disabled = !canEditApproval;
    });
}

function resetApprovalFormViewed() {
  approvalFormViewed = false;
  updateApprovalActionState();
}

function markApprovalFormViewed() {
  if (!approvalRouteRecords().length) return;
  approvalFormViewed = true;
  updateApprovalActionState();
}

function projectModificationFormRecords(projectName) {
  return [...(state.data.modificationForm || [])]
    .filter(record => record.projectName === projectName)
    .sort(compareTransactionSequence);
}

function approvalList(records) {
  const approvals = [];

  records.forEach(record => {
    if (Array.isArray(record.approvals)) {
      record.approvals.forEach(approval => {
        const name = String(approval?.name || approval?.approvedBy || "").trim();
        const position = String(approval?.position || approval?.approvedPosition || "").trim();
        const approvedDateTime = String(approval?.approvedDateTime || "").trim();
        if (name || position || approvedDateTime) approvals.push({ name, position, approvedDateTime });
      });
    }

    if (record.approvedBy || record.approvedPosition || record.approvedDateTime) {
      approvals.push({
        name: String(record.approvedBy || "").trim(),
        position: String(record.approvedPosition || "").trim(),
        approvedDateTime: String(record.approvedDateTime || "").trim()
      });
    }
  });

  return approvals
    .filter((approval, index, source) =>
      source.findIndex(item =>
        item.name === approval.name &&
        item.position === approval.position &&
        item.approvedDateTime === approval.approvedDateTime
      ) === index
    )
    .sort((left, right) => {
      const leftTime = new Date(left.approvedDateTime).getTime() || 0;
      const rightTime = new Date(right.approvedDateTime).getTime() || 0;
      return leftTime - rightTime;
    });
}

function approvalRemarkEntries(record) {
  const entries = Array.isArray(record?.approvalRemarks) ? record.approvalRemarks : [];
  return entries
    .map(entry => ({
      name: String(entry?.name || entry?.approvedBy || "").trim(),
      position: String(entry?.position || entry?.approvedPosition || "").trim(),
      approvedDateTime: String(entry?.approvedDateTime || "").trim(),
      remark: String(entry?.remark || entry?.remarks || "").trim()
    }))
    .filter(entry => entry.remark)
    .sort((left, right) => {
      const leftTime = new Date(left.approvedDateTime).getTime() || 0;
      const rightTime = new Date(right.approvedDateTime).getTime() || 0;
      return leftTime - rightTime;
    });
}

function approvalRemarksText(record) {
  const lines = [];
  const baseRemark = String(record?.remarks || "").trim();
  if (baseRemark) {
    const requestorName = String(record?.requested || record?.requestorName || "").trim();
    lines.push(`Added by ${requestorName || "Requestor"}: ${baseRemark}`);
  }

  approvalRemarkEntries(record).forEach(entry => {
    const approverName = entry.name || "Approver";
    lines.push(`Added by ${approverName}: ${entry.remark}`);
  });

  return lines.join("\n");
}

function approvedProjectRecord(records, fallbackRecord) {
  const latestApproval = approvalList(records).at(-1);
  return latestApproval
    ? {
        ...fallbackRecord,
        approvedBy: latestApproval.name,
        approvedPosition: latestApproval.position,
        approvedDateTime: latestApproval.approvedDateTime
      }
    : fallbackRecord;
}

function approvalStamp() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
}

function showApprovalRoute() {
  const records = approvalRouteRecords();
  const record = records[0] || null;
  const approvalRecord = approvedProjectRecord(records, record);
  const projectApprovals = approvalList(records);

  document.body.dataset.view = "approval";
  elements.dashboardPanel.classList.add("hidden");
  elements.calendarPanel.classList.add("hidden");
  elements.modificationFilterPanel.classList.add("hidden");
  elements.recordFormPanel.classList.add("hidden");
  document.querySelector(".records-panel").classList.add("hidden");
  elements.approvalPanel?.classList.remove("hidden");
  elements.createBtn.classList.add("hidden");
  elements.exportBtn.classList.add("hidden");
  elements.exportWordBtn?.classList.add("hidden");
  elements.exportPdfBtn?.classList.add("hidden");
  elements.approvalProjectLinkBtn?.classList.add("hidden");
  elements.loginBtn.classList.add("hidden");

  if (!record) {
    elements.pageTitle.textContent = "Approval Link";
    elements.approvalTitle.textContent = "Approval request not found";
    renderApprovalRemarks([]);
    resetApprovalFormViewed();
    elements.approvalNameInput.disabled = true;
    elements.approvalPositionInput.disabled = true;
    elements.approveFormBtn.disabled = true;
    elements.approvalPreviewPdfBtn.disabled = true;
    return;
  }

  resetApprovalFormViewed();
  elements.pageTitle.textContent = "Approve Modification Form";
  elements.approvalTitle.textContent = "Review and approve this project form";
  elements.approvalPreviewPdfBtn.disabled = false;
  elements.approvalNameInput.value = "";
  elements.approvalPositionInput.value = "";
  renderApprovalRemarks(records);
  elements.approvalStatus.textContent = approvalRecord?.approvedDateTime
    ? `${projectApprovals.length} approval${projectApprovals.length === 1 ? "" : "s"}. Latest approval on ${formatApprovalTimestamp(approvalRecord.approvedDateTime)}.`
    : "Please open and review the PDF before approving.";
  updateApprovalActionState();
  elements.approveFormBtn.textContent = "Approve";
}

async function approveModificationFormFromLink() {
  const records = approvalRouteRecords();
  if (!records.length) return;

  if (!approvalFormViewed) {
    elements.approvalStatus.textContent = "Please open and review the PDF before approving.";
    updateApprovalActionState();
    return;
  }

  const approvedBy = elements.approvalNameInput.value.trim();
  const approvedPosition = elements.approvalPositionInput.value.trim();
  if (!approvedBy || !approvedPosition) {
    elements.approvalStatus.textContent = "Enter the approver name/signature and position before approving.";
    return;
  }

  const approvedPdfWindow = openPendingApprovalPdfWindow();
  const existingApproval = approvedProjectRecord(records, records[0]);
  const wasAlreadyApproved = Boolean(existingApproval?.approvedDateTime);
  const approvedDateTime = approvalStamp();
  const remarksById = approvalRemarksByRecordId();
  state.data.modificationForm = state.data.modificationForm.map(item => {
    if (item.projectName !== approvalRouteProject) return item;

    const currentRemark = String(remarksById.get(item.id) || "").trim();
    const approvalRemarks = approvalRemarkEntries(item);
    if (currentRemark) {
      approvalRemarks.push({
        name: approvedBy,
        position: approvedPosition,
        approvedDateTime,
        remark: currentRemark
      });
    }

    return {
      ...item,
      approvedBy,
      approvedPosition,
      approvedDateTime,
      approvals: [
        ...(Array.isArray(item.approvals) ? item.approvals : []),
        { name: approvedBy, position: approvedPosition, approvedDateTime }
      ],
      approvalRemarks
    };
  });
  const approvedRecords = projectModificationFormRecords(approvalRouteProject);
  saveData();
  await saveCloudData();
  if (approvedPdfWindow) {
    writeModificationPdfToWindow(approvedPdfWindow, approvedRecords);
  }
  showApprovalRoute();
  elements.approvalStatus.textContent = wasAlreadyApproved
    ? `Already approved. Latest approval updated on ${formatApprovalTimestamp(approvedDateTime)}. Timestamped PDF generated.`
    : `Approved on ${formatApprovalTimestamp(approvedDateTime)}. Timestamped PDF generated.`;
  if (!approvedPdfWindow) {
    showMessageModal({
      title: "Pop-ups Blocked",
      message: "The approval was saved with a timestamp, but the PDF copy could not open. Please allow pop-ups, then click Open PDF to view the timestamped copy."
    });
  }
}

function recordClientDepartment(record) {
  const directValue = String(record?.clientDepartment || "").trim();
  if (directValue) return directValue;

  const project = state.data.project.find(item => item.projectName === record?.projectName);
  if (project?.department) return project.department;

  const requestor = state.data.requestor.find(item => item.requestorName === record?.requested);
  return requestor?.department || "";
}

function modificationFormDocumentRecords() {
  if (state.modificationProject === "All") {
    showMessageModal({
      title: "Select One Project",
      message: "Please select one project before generating a Modification Form document."
    });
    return [];
  }

  const records = sortedVisibleRecords("modificationForm");
  if (!records.length) {
    showMessageModal({
      title: "No Records Found",
      message: "No Modification Form records found for the selected project."
    });
    return [];
  }

  return records;
}

function documentFileName(recordOrRecords, extension) {
  const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
  const firstRecord = records[0] || {};
  const baseName = [
    "modification-form",
    firstRecord?.projectName || state.modificationProject,
    records.length === 1 ? firstRecord?.id : `${records.length}-items`
  ]
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .join("-");

  const safeName = (baseName || "modification-form")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${safeName}.${extension}`;
}

function modificationFormHtml(recordOrRecords, options = {}) {
  const records = Array.isArray(recordOrRecords)
    ? recordOrRecords
    : [recordOrRecords].filter(Boolean);
  const firstRecord = records[0] || {};
  const projectRecords = firstRecord?.projectName
    ? projectModificationFormRecords(firstRecord.projectName)
    : records;
  const detailRows = records.length
    ? records.map((record, index) => ({
        no: String(index + 1),
        details: String(record?.details || "").trim(),
        remarks: approvalRemarksText(record)
      }))
    : [{ no: "1", details: "", remarks: "" }];
  while (detailRows.length < 3) {
    detailRows.push({ no: String(detailRows.length + 1), details: "", remarks: "" });
  }
  const headerRecord = firstRecord;
  const projectName = headerRecord?.projectName || state.modificationProject || "";
  const title = `${projectName || firstRecord?.id || "Modification"} Form`;
  const requestorName = headerRecord?.requested || "";
  const clientDepartment = headerRecord ? recordClientDepartment(headerRecord) : "";
  const targetCompletionDate = headerRecord
    ? compactFormDate(headerRecord?.targetCompletionDate || headerRecord?.dateModified)
    : "";
  const approvals = approvalList(projectRecords);
  const approvalRows = approvals.length
    ? approvals
    : [{ name: "", position: "", approvedDateTime: "" }];
  const printScript = options.print
    ? "<script>window.addEventListener('load', function () { window.focus(); window.print(); });<\/script>"
    : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #000;
      background: #fff;
      font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
      font-size: 10pt;
    }
    .sheet {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    td, th {
      border: 1px solid #000;
      padding: 4px 8px;
      vertical-align: top;
    }
    .header td { height: 58px; }
    .brand-cell {
      width: 34%;
      padding: 0 18px;
    }
    .company-copy {
      display: grid;
      gap: 10px;
      align-content: center;
      min-height: 138px;
      font-size: 10pt;
      line-height: 1.25;
    }
    .center-cell {
      width: 33%;
      text-align: center;
      vertical-align: middle;
      font-weight: 400;
    }
    .form-title {
      font-weight: 700;
    }
    .meta-cell {
      width: 14%;
      text-align: center;
    }
    .code-cell {
      width: 18%;
      text-align: center;
    }
    .meta-label {
      display: block;
      margin-bottom: 18px;
      text-align: left;
    }
    .section-gap {
      height: 24px;
    }
    .field-table th,
    .field-table td {
      height: 20px;
      padding: 3px 10px;
    }
    .field-table th {
      background: #f2f2f2;
      text-align: left;
      font-weight: 700;
    }
    .field-label {
      width: 19%;
      font-weight: 700;
    }
    .detail-table th {
      background: #f2f2f2;
      color: #000;
      text-align: center;
      font-weight: 700;
      padding: 4px 8px;
    }
    .detail-table td {
      height: 34px;
      white-space: pre-wrap;
    }
    .added-by-chip {
      display: inline;
      position: relative;
      color: inherit;
      font: inherit;
      font-weight: inherit;
      line-height: inherit;
      vertical-align: baseline;
    }
    .added-by-chip::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 0;
      top: 22px;
      z-index: 20;
      width: max-content;
      max-width: 260px;
      min-height: 30px;
      border: 1px solid #b98b98;
      border-radius: 8px;
      background: #fff7fa;
      color: #000;
      padding: 7px 10px;
      box-shadow: 0 8px 16px rgba(122, 16, 36, 0.18);
      font-size: 9pt;
      font-weight: 700;
      line-height: 1.25;
      opacity: 0;
      pointer-events: none;
      transform: translateY(2px);
      transition: opacity 140ms ease, transform 140ms ease;
      white-space: normal;
    }
    .added-by-chip:hover::after {
      opacity: 1;
      transform: translateY(0);
    }
    .detail-no {
      width: 7%;
      text-align: center;
    }
    .detail-main {
      width: 47%;
    }
    .approval {
      margin: 22px 0 8px;
      font-weight: 700;
    }
    .approval-table th {
      background: #f2f2f2;
      font-weight: 700;
      text-align: left;
    }
    .approval-table td,
    .approval-table th {
      padding: 5px 8px;
      height: 24px;
      vertical-align: middle;
    }
    .approval-name {
      width: 44%;
    }
    .approval-position {
      width: 26%;
    }
    .approval-date {
      width: 30%;
    }
  </style>
</head>
<body>
  <main class="sheet">
    <table class="header">
      <tr>
        <td class="brand-cell" rowspan="2">
          <div class="company-copy">
            <div>Virginia Food Inc.</div>
            <div>6000 Osmena Boulevard</div>
            <div>Cebu, Cebu 6000, PH</div>
            <div>Information System</div>
          </div>
        </td>
        <td class="center-cell">APPLICATION DEVELOPMENT</td>
        <td class="meta-cell"><span class="meta-label">Rev. No. 01</span></td>
        <td class="code-cell"><span class="meta-label">FIN-IT-APPDEV-FORM-02</span></td>
      </tr>
      <tr>
        <td class="center-cell form-title">MODIFICATION FORM</td>
        <td class="meta-cell">
          <span class="meta-label">Revision Date:</span>
          01JAN2026
        </td>
        <td class="code-cell">
          <span class="meta-label">Effectivity Date:</span>
          01JAN2026
        </td>
      </tr>
    </table>

    <div class="section-gap"></div>

    <table class="field-table">
      <tr>
        <th class="field-label">Field</th>
        <th>Details</th>
      </tr>
      <tr>
        <td class="field-label">Project Name:</td>
        <td>${escapeHtml(projectName)}</td>
      </tr>
      <tr>
        <td class="field-label">Requestor Name:</td>
        <td>${escapeHtml(requestorName)}</td>
      </tr>
      <tr>
        <td class="field-label">Client / Department:</td>
        <td>${escapeHtml(clientDepartment)}</td>
      </tr>
      <tr>
        <td class="field-label">Target Completion Date:</td>
        <td>${escapeHtml(targetCompletionDate)}</td>
      </tr>
    </table>

    <div class="section-gap"></div>

    <table class="detail-table">
      <tr>
        <th class="detail-no">No.</th>
        <th class="detail-main">Modification Details</th>
        <th>Remarks</th>
      </tr>
      ${detailRows.map(row => `
        <tr>
          <td class="detail-no">${escapeHtml(row.no)}</td>
          <td>${escapeHtml(row.details)}</td>
          <td>${addedByRemarksHtml(row.remarks)}</td>
        </tr>`).join("")}
    </table>

    <p class="approval">Approved by:</p>
    <table class="approval-table">
      <tr>
        <th class="approval-name">Name and Signature</th>
        <th class="approval-position">Position</th>
        <th class="approval-date">Date</th>
      </tr>
      ${approvalRows.map(approval => `
      <tr>
        <td>${escapeHtml(approval.name || "")}</td>
        <td>${escapeHtml(approval.position || "")}</td>
        <td>${escapeHtml(formatApprovalTimestamp(approval.approvedDateTime || ""))}</td>
      </tr>`).join("")}
    </table>
  </main>
  ${printScript}
</body>
</html>`;
}

function downloadModificationWord(record) {
  const records = Array.isArray(record) ? record : [record].filter(Boolean);
  const html = modificationFormHtml(records);
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = documentFileName(records, "doc");
  link.click();
  URL.revokeObjectURL(link.href);
}

function printModificationPdf(record) {
  const records = Array.isArray(record) ? record : [record].filter(Boolean);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showMessageModal({
      title: "Pop-ups Blocked",
      message: "Please allow pop-ups to generate the PDF form."
    });
    return;
  }

  writeModificationPdfToWindow(printWindow, records);
}

function openModificationPdfPreview(record) {
  const records = Array.isArray(record) ? record : [record].filter(Boolean);
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    showMessageModal({
      title: "Pop-ups Blocked",
      message: "Please allow pop-ups to open the PDF review form."
    });
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(modificationFormHtml(records));
  previewWindow.document.close();
}

function writeModificationPdfToWindow(targetWindow, recordOrRecords) {
  const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords].filter(Boolean);
  targetWindow.document.open();
  targetWindow.document.write(modificationFormHtml(records, { print: true }));
  targetWindow.document.close();
}

function openPendingApprovalPdfWindow() {
  const approvalWindow = window.open("", "_blank");
  if (!approvalWindow) return null;

  approvalWindow.document.open();
  approvalWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Generating Approved Modification Form</title>
  <style>
    body {
      display: grid;
      min-height: 100vh;
      margin: 0;
      place-items: center;
      background: #ffffff;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
    }
    main {
      display: grid;
      gap: 8px;
      text-align: center;
    }
    strong {
      font-size: 16px;
    }
    span {
      color: #475569;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <main>
    <strong>Generating approved PDF form...</strong>
    <span>Please wait while the approval timestamp is added.</span>
  </main>
</body>
</html>`);
  approvalWindow.document.close();
  return approvalWindow;
}

function currentModificationProjectRecords() {
  return modificationFormDocumentRecords();
}

async function copyApprovalLink() {
  const records = currentModificationProjectRecords();
  if (!records.length) return;

  const link = approvalLink(records[0].projectName);
  try {
    await navigator.clipboard.writeText(link);
    showSaveMessage("Project approval link copied.");
  } catch {
    showMessageModal({
      title: "Approval Link",
      message: "Clipboard access was blocked. Copy the approval link below.",
      fieldLabel: "Approval link",
      fieldValue: link,
      primaryText: "Done"
    });
  }
}

function exportRecords() {
  const view = directoryViews[state.activeView];
  const fieldGroups = tableFieldGroups(state.activeView, view);
  const hasAttachments = view.fields.some(f => f.type === "file");
  const headers = [view.idLabel, ...fieldGroups.beforeGenerated.map(field => field.label)];
  if (view.generatedDateKey) headers.push(view.generatedDateLabel);
  headers.push(...fieldGroups.afterGenerated.map(field => field.label));
  if (hasAttachments) headers.push("Attachment");
  const records = sortedVisibleRecords(state.activeView);
  const rows = records.map(record => {
    const isImage = isImageAttachment(record);
    const attachmentCell = isImage
      ? `<img src="${record.attachmentData}" alt="${escapeHtml(record.attachmentName)}" width="100" style="display:block; margin:auto;">`
      : escapeHtml(record.attachmentName || "");

    return `
      <tr>
        <td>${escapeHtml(record.id)}</td>
        ${fieldGroups.beforeGenerated.map(field => `<td>${escapeHtml(tableFieldValue(record, field))}</td>`).join("")}
        ${view.generatedDateKey ? `<td>${escapeHtml(record[view.generatedDateKey])}</td>` : ""}
        ${fieldGroups.afterGenerated.map(field => `<td>${escapeHtml(tableFieldValue(record, field))}</td>`).join("")}
        ${hasAttachments ? `<td>${attachmentCell}</td>` : ""}
      </tr>`;
  }).join("");
  const worksheet = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #cfdbe7; padding: 8px; vertical-align: top; }
          th { background: #eef8f8; color: #526680; font-weight: 700; }
          img { display: block; max-width: 130px; max-height: 90px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>`;
  const blob = new Blob([worksheet], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.activeView}-records.xls`;
  link.click();
  URL.revokeObjectURL(link.href);

}

// Login Enhancement Functions
function getLoginAttempts() {
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return stored ? JSON.parse(stored) : { count: 0, lastAttemptTime: 0 };
  } catch {
    return { count: 0, lastAttemptTime: 0 };
  }
}

function setLoginAttempts(count, lastAttemptTime) {
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count, lastAttemptTime }));
  } catch {
    console.warn("Could not save login attempts");
  }
}

function isAccountLocked() {
  const attempts = getLoginAttempts();
  if (attempts.count < MAX_LOGIN_ATTEMPTS) return false;
  
  const timeSinceLastAttempt = Date.now() - attempts.lastAttemptTime;
  return timeSinceLastAttempt < LOCKOUT_DURATION_MS;
}

function getRemainingLockoutTime() {
  const attempts = getLoginAttempts();
  const timeSinceLastAttempt = Date.now() - attempts.lastAttemptTime;
  const remainingMs = LOCKOUT_DURATION_MS - timeSinceLastAttempt;
  return Math.ceil(remainingMs / 1000);
}

function recordFailedLoginAttempt() {
  const attempts = getLoginAttempts();
  setLoginAttempts(attempts.count + 1, Date.now());
}

function clearLoginAttempts() {
  setLoginAttempts(0, 0);
}

function saveRememberMe(username) {
  try {
    const expiryTime = Date.now() + REMEMBER_ME_DURATION_MS;
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ username, expiryTime }));
  } catch {
    console.warn("Could not save remember me");
  }
}

function getRememberedUser() {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (Date.now() > data.expiryTime) {
      localStorage.removeItem(REMEMBER_ME_KEY);
      return null;
    }
    return data.username;
  } catch {
    return null;
  }
}

function clearRememberedUser() {
  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
  } catch {
    console.warn("Could not clear remember me");
  }
}

function saveAuthSession(username) {
  try {
    const expiryTime = Date.now() + AUTH_SESSION_DURATION_MS;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username, expiryTime }));
  } catch {
    console.warn("Could not save login session");
  }
}

function getAuthSession() {
  try {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (Date.now() > data.expiryTime) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    console.warn("Could not clear login session");
  }
}

function togglePasswordVisibility() {
  const isPassword = elements.loginPassword.type === "password";
  elements.loginPassword.type = isPassword ? "text" : "password";
  elements.togglePassword.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
  elements.togglePassword.title = isPassword ? "Hide password" : "Show password";
  elements.togglePassword.classList.toggle("password-visible", !isPassword);
}

function checkRememberedLogin() {
  const rememberedUsername = getRememberedUser();
  if (rememberedUsername) {
    elements.loginUsername.value = rememberedUsername;
    elements.rememberMe.checked = true;
  }
}

function initializeLogin() {
  checkRememberedLogin();
  
  if (isAccountLocked()) {
    const remainingSeconds = getRemainingLockoutTime();
    const minutes = Math.ceil(remainingSeconds / 60);
    elements.loginLockMessage.textContent = `Account temporarily locked. Try again in ${minutes} minute(s).`;
    elements.loginForm.querySelector("button[type='submit']").disabled = true;
  } else {
    clearLoginAttempts();
    elements.loginLockMessage.textContent = "";
    elements.loginForm.querySelector("button[type='submit']").disabled = false;
  }
}

function authenticateUser(username, password) {
  const normalizedUsername = String(username || "").trim().toLowerCase();

  if (
    normalizedUsername === DEFAULT_ADMIN_USERNAME.toLowerCase() &&
    password === DEFAULT_ADMIN_PASSWORD
  ) {
    return { userName: DEFAULT_ADMIN_USERNAME, role: "Administrator", status: "Active" };
  }

  return state.data.userManagement.find(user => {
    const userNameMatches = String(user.userName || "").trim().toLowerCase() === normalizedUsername;
    const passwordMatches = String(user.password || "") === password;
    const isActive = String(user.status || "").trim().toLowerCase() === "active";
    return userNameMatches && passwordMatches && isActive;
  }) || null;
}

function userByUsername(username) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername) return null;

  if (normalizedUsername === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return { userName: DEFAULT_ADMIN_USERNAME, role: "Administrator", status: "Active" };
  }

  return state.data.userManagement.find(user =>
    String(user.userName || "").trim().toLowerCase() === normalizedUsername
  ) || null;
}

elements.navButtons.forEach(button => {
  button.addEventListener("click", () => switchView(button.dataset.directory));
});
elements.createBtn.addEventListener("click", () => showForm());
elements.cancelEditBtn.addEventListener("click", hideForm);
elements.recordForm.addEventListener("submit", handleSave);
elements.exportBtn.addEventListener("click", exportRecords);
elements.exportWordBtn?.addEventListener("click", async () => {
  await refreshModificationFormProjectFromCloud(state.modificationProject);
  const records = modificationFormDocumentRecords();
  if (records.length) downloadModificationWord(records);
});
elements.exportPdfBtn?.addEventListener("click", async () => {
  await refreshModificationFormProjectFromCloud(state.modificationProject);
  const records = modificationFormDocumentRecords();
  if (records.length) printModificationPdf(records);
});
elements.approvalProjectLinkBtn?.addEventListener("click", copyApprovalLink);
elements.approveFormBtn?.addEventListener("click", approveModificationFormFromLink);
elements.approvalPreviewPdfBtn?.addEventListener("click", () => {
  markApprovalFormViewed();
  const records = approvalRouteRecords();
  if (records.length) openModificationPdfPreview(approvalRecordsWithCurrentRemarks(records));
});
elements.dashboardThemeSelect.addEventListener("change", event => applyTheme(event.target.value));
elements.dashboardProjectSelect.addEventListener("change", event => {
  state.dashboardProject = event.target.value;
  renderDashboard();
});
elements.modificationProjectFilter.addEventListener("change", event => {
  const keepFormOpen = !elements.recordFormPanel.classList.contains("hidden");
  state.modificationProject = event.target.value;
  render({ keepFormOpen });
  if (keepFormOpen) {
    syncModificationProjectField();
    applyFirstProjectDefaultsToForm();
  }
});
elements.loginBtn.addEventListener("click", showLoginModal);
elements.cancelLoginBtn?.addEventListener("click", hideLoginModal);
elements.userProfileSummary?.addEventListener("click", event => {
  event.stopPropagation();
  toggleUserProfileMenu();
});
elements.userProfileSummary?.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggleUserProfileMenu();
});
elements.logoutBtn.addEventListener("click", () => {
  closeUserProfileMenu();
  clearAuthSession();
  clearRememberedUser();
  elements.loginBtn.textContent = "Login";
  elements.loginBtn.classList.remove("primary");
  elements.loginBtn.classList.add("secondary");
  setAuthenticated(false);
  render();
  showLoginModal();
});
elements.togglePassword?.addEventListener("click", event => {
  event.preventDefault();
  togglePasswordVisibility();
});
elements.loginUsername.addEventListener("input", () => {
  elements.loginForm.classList.remove("has-error");
  elements.loginMessage.textContent = "";
});
elements.loginPassword.addEventListener("input", () => {
  elements.loginForm.classList.remove("has-error");
  elements.loginMessage.textContent = "";
});
elements.loginModal.addEventListener("click", event => {
  if (event.target === elements.loginModal) hideLoginModal();
});
document.addEventListener("click", event => {
  if (!elements.userProfile.contains(event.target)) closeUserProfileMenu();
});
elements.cancelDeleteBtn.addEventListener("click", hideDeleteModal);
elements.confirmDeleteBtn.addEventListener("click", confirmDeleteRecord);
elements.deleteModal.addEventListener("click", event => {
  if (event.target === elements.deleteModal) hideDeleteModal();
});
elements.closeMessageModalBtn.addEventListener("click", hideMessageModal);
elements.messageModalCopyBtn.addEventListener("click", copyMessageModalField);
elements.messageModal.addEventListener("click", event => {
  if (event.target === elements.messageModal) hideMessageModal();
});
elements.closeDashboardDetailBtn.addEventListener("click", hideDashboardDetailModal);
elements.dashboardDetailModal.addEventListener("click", event => {
  if (event.target === elements.dashboardDetailModal) hideDashboardDetailModal();
});
elements.closeAttachmentPreviewBtn.addEventListener("click", hideAttachmentPreview);
elements.attachmentPreviewModal.addEventListener("click", event => {
  if (event.target === elements.attachmentPreviewModal) hideAttachmentPreview();
});
elements.loginForm.addEventListener("submit", event => {
  event.preventDefault();
  
  if (isAccountLocked()) {
    const remainingSeconds = getRemainingLockoutTime();
    const minutes = Math.ceil(remainingSeconds / 60);
    elements.loginLockMessage.textContent = `Account temporarily locked. Try again in ${minutes} minute(s).`;
    return;
  }

  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;

  if (!username || !password) {
    elements.loginForm.classList.add("has-error");
    elements.loginMessage.textContent = "Please enter both username and password.";
    return;
  }

  const authenticatedUser = authenticateUser(username, password);

  if (!authenticatedUser) {
    elements.loginForm.classList.add("has-error");
    recordFailedLoginAttempt();
    const attempts = getLoginAttempts();
    const attemptsLeft = MAX_LOGIN_ATTEMPTS - attempts.count;
    
    if (attemptsLeft > 0) {
      elements.loginMessage.textContent = `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`;
    } else {
      elements.loginLockMessage.textContent = "Too many failed attempts. Account locked for 5 minutes.";
      elements.loginForm.querySelector("button[type='submit']").disabled = true;
    }
    
    elements.loginPassword.value = "";
    elements.loginPassword.focus();
    return;
  }

  clearLoginAttempts();
  elements.loginForm.classList.remove("has-error");
  
  if (elements.rememberMe.checked) {
    saveRememberMe(username);
  } else {
    clearRememberedUser();
  }

  elements.loginBtn.textContent = "Logged In";
  elements.loginBtn.classList.remove("secondary");
  elements.loginBtn.classList.add("primary");
  elements.loginMessage.textContent = "";
  elements.loginLockMessage.textContent = "";
  saveAuthSession(authenticatedUser.userName || username);
  state.currentUser = authenticatedUser;
  setAuthenticated(true);
  render();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeUserProfileMenu();
  }
  if (event.key === "Escape" && state.isAuthenticated && !elements.loginModal.classList.contains("hidden")) {
    hideLoginModal();
  }
  if (event.key === "Escape" && !elements.deleteModal.classList.contains("hidden")) {
    hideDeleteModal();
  }
  if (event.key === "Escape" && !elements.messageModal.classList.contains("hidden")) {
    hideMessageModal();
  }
  if (event.key === "Escape" && !elements.dashboardDetailModal.classList.contains("hidden")) {
    hideDashboardDetailModal();
  }
  if (event.key === "Escape" && !elements.attachmentPreviewModal.classList.contains("hidden")) {
    hideAttachmentPreview();
  }
});
elements.calendarTaskForm.addEventListener("submit", saveCalendarTask);
elements.cancelCalendarTaskBtn.addEventListener("click", hideCalendarTaskForm);
elements.calendarProjectFilter.addEventListener("change", event => {
  state.calendarProject = event.target.value;
  renderCalendar();
});
elements.weekViewBtn.addEventListener("click", () => {
  state.calendarMode = "week";
  renderCalendar();
});
elements.monthViewBtn.addEventListener("click", () => {
  state.calendarMode = "month";
  renderCalendar();
});
elements.prevCalendarBtn.addEventListener("click", () => {
  const date = new Date(state.calendarDate);
  if (state.calendarMode === "week") {
    date.setDate(date.getDate() - 7);
  } else {
    date.setMonth(date.getMonth() - 1);
  }
  state.calendarDate = date;
  renderCalendar();
});
elements.nextCalendarBtn.addEventListener("click", () => {
  const date = new Date(state.calendarDate);
  if (state.calendarMode === "week") {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  state.calendarDate = date;
  renderCalendar();
});
elements.todayCalendarBtn.addEventListener("click", () => {
  state.calendarDate = new Date();
  state.calendarSelectedDate = new Date();
  renderCalendar();
});
saveLocalData();
applyTheme(localStorage.getItem(THEME_KEY) || "maroonWhite");
updateClock();
setInterval(updateClock, 1000);
const approvalParams = new URLSearchParams(window.location.search);
approvalRouteProject = approvalParams.get("approveProject");
const legacyApprovalId = approvalParams.get("approve");
if (!approvalRouteProject && legacyApprovalId) {
  approvalRouteProject = state.data.modificationForm.find(record => record.id === legacyApprovalId)?.projectName || null;
}
const normalizedIds = normalizeModificationIds();
const normalizedTcIds = normalizeTestCaseIds();
const normalizedStatuses = normalizeStatusValues();
const normalizedTestCaseStatuses = normalizeTestCaseStatuses();
const normalizedUserRoles = normalizeUserRoles();
if (normalizedIds || normalizedTcIds || normalizedStatuses || normalizedTestCaseStatuses || normalizedUserRoles) {
  saveLocalData();
}
initializeLogin();
const authSession = getAuthSession();
state.currentUser = authSession ? userByUsername(authSession.username) : null;
setAuthenticated(Boolean(authSession));
render();
hydrateCloudData();
