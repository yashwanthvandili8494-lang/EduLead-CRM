import Lead from '../models/Lead.js';

export const generateLeadId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Lead.countDocuments();
  const sequence = String(count + 1001).padStart(4, '0');
  return `LED-${currentYear}-${sequence}`;
};
