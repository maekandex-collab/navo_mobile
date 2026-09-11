const location = [
  { label: 'Nigeria', value: 'Nigeria' },
  { label: 'UK', value: 'UK' }
];

const deliveryTypeList = [
  { label: 'Deliver to hub', value: 'deliver_to_hub' },
];

const IDType = [
  { label: 'National ID', value: 'National_ID' },
  { label: 'Drivers Lincense', value: 'Drivers_Lincense' },
  { label: 'International Passport', value: 'International_Passport' },
]

const goods = [
  { label: 'Foodstuffs', value: 'foodstuffs' },
  { label: 'Clothes', value: 'clothes' },
  { label: 'Sensitive', value: 'sensitive' },
  { label: 'Extra Luggage', value: 'extra_luggage' },
  { label: 'General', value: 'general' },
  { label: 'Others', value: 'others' }
];

const gender = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Others', value: 'others' },
];

const nigeriaStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const ukLocations = [
  "England", "Scotland", "Wales", "Northern Ireland"
];


export default { location, deliveryTypeList, IDType, goods, gender, nigeriaStates, ukLocations }