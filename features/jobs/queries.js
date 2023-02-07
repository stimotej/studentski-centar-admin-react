const jobKeys = {
  jobs: ["jobs"],
  skills: ["skills"],
  skills: ["companies"],
  jobsFiltered: (filters) => [...jobKeys.jobs, filters],
  job: (id) => [...jobKeys.jobs, id],
};

export default jobKeys;
