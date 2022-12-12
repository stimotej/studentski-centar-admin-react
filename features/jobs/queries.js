const jobKeys = {
  jobs: ["jobs"],
  skills: ["skills"],
  jobsFiltered: (filters) => [...jobKeys.jobs, filters],
  job: (id) => [...jobKeys.jobs, id],
};

export default jobKeys;
