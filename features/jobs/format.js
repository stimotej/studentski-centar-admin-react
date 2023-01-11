const formatJob = (job) => ({
  id: job.id,
  allowed_sc: job.meta.allowed_sc,
  featured_sc: job.meta.featured,
  title: job.meta.title,
  company: job.company,
  type: job.meta.type,
  city: job.meta.city,
  start: job.meta.work_start,
  end: job.meta.work_end,
  paymentRate: job.meta.payment_rate,
  paymentRateMax: job.meta.payment_rate_max,
  workHours: job.meta.work_hours,
  positions: job.meta.positions,
  activeUntil: job.meta.active_until,
  description: job.meta.description,
  whyMe: job.meta.why_me,
  requiredSkills: job.meta.required_skills,
  optionalSkills: job.meta.optional_skills,
  date: job.date,
  updatedAt: job.modified,
  link: job.link,
});

export default formatJob;
