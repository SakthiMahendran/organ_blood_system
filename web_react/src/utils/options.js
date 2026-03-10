export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => ({
  value,
  label: value,
}));

export const ORGAN_TYPE_OPTIONS = [
  'Kidney',
  'Liver',
  'Heart',
  'Lung',
  'Pancreas',
  'Intestine',
  'Cornea',
].map((value) => ({ value, label: value }));

export const URGENCY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => ({
  value,
  label: value,
}));

export const USER_ROLE_OPTIONS = [
  { value: 'DONOR', label: 'Donor' },
  { value: 'ACCEPTOR', label: 'Acceptor' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'NOT_AVAILABLE', label: 'Not Available' },
];
