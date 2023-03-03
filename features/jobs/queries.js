const jobKeys = {
  jobs: ["jobs"],
  skills: ["skills"],
  companies: ["companies"],
  jobsFiltered: (filters) => [...jobKeys.jobs, filters],
  job: (id) => [...jobKeys.jobs, id],
};

export default jobKeys;
