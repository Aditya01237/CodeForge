export const routes = {
  home: "/",
  practice: "/practice",
  problems: "/problems",
  testAccess: "/test-access",
  faculty: "/faculty",
  facultyCreateTest: "/faculty/tests/create",
};

export const getProblemBackPath = ({ mode, testId }) => {
  if (mode === "test" && testId) {
    return `/test/${testId}/problems`;
  }

  return routes.home;
};

export const getAfterTestAccessPath = (testId) => {
  return `/test/${testId}/identity`;
};

export const getAfterIdentityPath = (testId) => {
  return `/test/${testId}/lobby`;
};

export const getAfterLobbyPath = (testId) => {
  return `/test/${testId}/problems`;
};

export const getSolveProblemPath = ({ problemId, testId }) => {
  if (testId) {
    return `/problem/${problemId}?mode=test&testId=${testId}`;
  }

  return `/problem/${problemId}`;
};

export const getFacultyManageProblemsPath = (testId) => {
  return `/faculty/tests/${testId}/problems`;
};

export const getFacultyManageTestPath = (testId) => {
  return `/faculty/tests/${testId}/manage`;
};

export const getFacultyResultsPath = (testId) => {
  return `/faculty/tests/${testId}/results`;
};

export const getFacultyLivePath = (testId) => {
  return `/faculty/tests/${testId}/live`;
};