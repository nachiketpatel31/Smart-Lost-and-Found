const Item = require('../models/Item');
const Claim = require('../models/Claim');

async function generateReportId(type) {
  const prefix = type === 'lost' ? 'LST' : 'FND';
  const year = new Date().getFullYear();
  const count = await Item.countDocuments({ type });
  const sequence = String(count + 1).padStart(6, '0');
  return `${prefix}-${year}-${sequence}`;
}

async function generateClaimId() {
  const year = new Date().getFullYear();
  const count = await Claim.countDocuments();
  const sequence = String(count + 1).padStart(6, '0');
  return `CLM-${year}-${sequence}`;
}

module.exports = {
  generateReportId,
  generateClaimId
};
