/**
 * Address Autocomplete Module
 * Simulated Indian pincode database for auto-filling city/state/district
 */

const PINCODE_DB = {
  '110001': { city: 'New Delhi', state: 'Delhi', district: 'Central Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi', district: 'New Delhi' },
  '110003': { city: 'New Delhi', state: 'Delhi', district: 'Central Delhi' },
  '110005': { city: 'New Delhi', state: 'Delhi', district: 'New Delhi' },
  '110011': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi' },
  '110016': { city: 'New Delhi', state: 'Delhi', district: 'South West Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi' },
  '110025': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi' },
  '110030': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi' },
  '110085': { city: 'New Delhi', state: 'Delhi', district: 'North East Delhi' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City' },
  '400002': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City' },
  '400050': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400051': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400053': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400070': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban' },
  '400076': { city: 'Navi Mumbai', state: 'Maharashtra', district: 'Thane' },
  '400601': { city: 'Thane', state: 'Maharashtra', district: 'Thane' },
  '411001': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '411014': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '411038': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560002': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560008': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560034': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560037': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560066': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '560100': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600017': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600028': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600040': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '600096': { city: 'Chennai', state: 'Tamil Nadu', district: 'Kancheepuram' },
  '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '500003': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '500034': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '500081': { city: 'Hyderabad', state: 'Telangana', district: 'Rangareddy' },
  '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '700020': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '700091': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '380015': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '380054': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '302017': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  '226010': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  '682001': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '682016': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '682030': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram' },
  '695014': { city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '201303': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
  '122001': { city: 'Gurugram', state: 'Haryana', district: 'Gurugram' },
  '122002': { city: 'Gurugram', state: 'Haryana', district: 'Gurugram' },
  '122018': { city: 'Gurugram', state: 'Haryana', district: 'Gurugram' },
  '160001': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh' },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh' },
};

let lookupTimeout = null;

/**
 * Look up pincode and return city/state/district
 * Simulates async API call with a small delay
 */
export function lookupPincode(pincode) {
  return new Promise((resolve) => {
    clearTimeout(lookupTimeout);
    lookupTimeout = setTimeout(() => {
      const data = PINCODE_DB[pincode];
      if (data) {
        resolve({ success: true, ...data });
      } else {
        resolve({ success: false, message: 'Pincode not found in database' });
      }
    }, 300);
  });
}

/**
 * Get suggestions for partial pincode input
 */
export function getPincodeSuggestions(partial) {
  if (!partial || partial.length < 3) return [];

  const suggestions = [];
  for (const [pincode, data] of Object.entries(PINCODE_DB)) {
    if (pincode.startsWith(partial)) {
      suggestions.push({ pincode, ...data });
      if (suggestions.length >= 5) break;
    }
  }
  return suggestions;
}

/**
 * Indian states list for dropdown
 */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Chandigarh', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];
