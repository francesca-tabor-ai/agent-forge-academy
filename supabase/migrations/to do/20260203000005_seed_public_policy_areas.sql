-- Seed public_policy_areas table with UK public policy areas
-- This seed data includes all major UK public policy domains

-- Using ON CONFLICT to make this migration idempotent

-- 1. Economic & Financial
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'economic-financial',
  'Economic & Financial',
  'Managing the economy, public finances, trade',
  ARRAY['HM Treasury', 'Department for Business and Trade', 'Bank of England'],
  ARRAY['Fiscal policy', 'Industrial strategy', 'Trade agreements', 'Financial regulation', 'Economic growth'],
  ARRAY['Banking & finance', 'Manufacturing', 'Retail', 'Trade & logistics', 'Tech startups'],
  ARRAY['Tax incentives for businesses', 'Trade tariffs', 'Access to capital', 'Industrial strategy support']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 2. Health & Social Care
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'health-social-care',
  'Health & Social Care',
  'Healthcare, social services, public health',
  ARRAY['Department of Health & Social Care', 'NHS England', 'Public Health England'],
  ARRAY['NHS funding', 'Mental health', 'Pandemic response', 'Social care', 'Public health campaigns'],
  ARRAY['Pharmaceuticals', 'Biotechnology', 'Healthcare providers', 'Social care services', 'Insurance'],
  ARRAY['NHS funding for hospitals', 'Mental health programs', 'Vaccination campaigns', 'Elderly care services']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 3. Education & Skills
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'education-skills',
  'Education & Skills',
  'Schools, universities, vocational training',
  ARRAY['Department for Education', 'UK Research & Innovation'],
  ARRAY['School curriculum', 'Higher education', 'Apprenticeships', 'Lifelong learning', 'Literacy and numeracy'],
  ARRAY['EdTech', 'Universities', 'Vocational training providers', 'Publishing', 'E-learning platforms'],
  ARRAY['Curriculum reform', 'Funding for STEM programs', 'Apprenticeships', 'Online learning tools']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 4. Defence & National Security
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'defence-national-security',
  'Defence & National Security',
  'Defence, intelligence, emergency preparedness',
  ARRAY['Ministry of Defence', 'Home Office', 'GCHQ', 'MI5', 'MI6'],
  ARRAY['Armed forces strategy', 'Cybersecurity', 'Counter-terrorism', 'National emergencies'],
  ARRAY['Defence contractors', 'Cybersecurity firms', 'Aerospace', 'Technology'],
  ARRAY['Military procurement', 'National cybersecurity initiatives', 'Counter-terrorism technology']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 5. Foreign Policy & International Relations
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'foreign-policy-international-relations',
  'Foreign Policy & International Relations',
  'Diplomacy, international development',
  ARRAY['Foreign, Commonwealth & Development Office', 'UK Aid'],
  ARRAY['Trade policy', 'Climate diplomacy', 'Aid programs', 'International security cooperation'],
  ARRAY['Export/import businesses', 'NGOs', 'International aid organizations', 'Defense contractors'],
  ARRAY['Trade deals', 'Foreign aid funding', 'Diplomatic partnerships', 'Export controls']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 6. Environment & Energy
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'environment-energy',
  'Environment & Energy',
  'Climate, natural resources, energy',
  ARRAY['DEFRA', 'BEIS (Energy & Climate)'],
  ARRAY['Renewable energy', 'Carbon reduction', 'Biodiversity', 'Agriculture', 'Water management'],
  ARRAY['Renewable energy', 'Fossil fuels', 'Agriculture', 'Water', 'Waste management', 'Construction'],
  ARRAY['Carbon taxes', 'Green energy subsidies', 'Environmental regulations', 'Sustainable farming policies']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 7. Justice, Legal & Policing
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'justice-legal-policing',
  'Justice, Legal & Policing',
  'Law enforcement, courts, civil liberties',
  ARRAY['Ministry of Justice', 'Home Office'],
  ARRAY['Criminal justice', 'Policing', 'Legal aid', 'Prison reform', 'Civil rights protection'],
  ARRAY['Legal services', 'Private security', 'Prisons', 'Tech (forensics, cybersecurity)'],
  ARRAY['Criminal justice reform', 'Policing technology', 'Access to legal aid', 'Prison privatization or management']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 8. Transport & Infrastructure
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'transport-infrastructure',
  'Transport & Infrastructure',
  'Public transport, roads, housing, digital infrastructure',
  ARRAY['Department for Transport', 'Ministry of Housing, Communities & Local Government'],
  ARRAY['Rail', 'Aviation', 'Roads', 'Housing policy', 'Broadband', 'Urban planning'],
  ARRAY['Automotive', 'Rail', 'Aviation', 'Logistics', 'Construction', 'Telecoms'],
  ARRAY['Public transit expansion', 'Smart city planning', 'Broadband deployment', 'Road safety regulation']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 9. Science, Technology & Innovation
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'science-technology-innovation',
  'Science, Technology & Innovation',
  'Research, AI, industrial innovation',
  ARRAY['Department for Science, Innovation & Technology', 'UKRI'],
  ARRAY['AI governance', 'R&D funding', 'Emerging tech policy', 'Digital transformation'],
  ARRAY['Tech startups', 'AI & ML companies', 'R&D labs', 'Pharmaceuticals', 'Advanced manufacturing'],
  ARRAY['AI governance', 'R&D grants', 'Tech commercialization', 'Innovation clusters']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 10. Social Policy & Welfare
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'social-policy-welfare',
  'Social Policy & Welfare',
  'Poverty reduction, welfare, pensions',
  ARRAY['Department for Work & Pensions', 'Local Authorities'],
  ARRAY['Universal credit', 'Pensions', 'Disability benefits', 'Child protection', 'Unemployment programs'],
  ARRAY['Social services', 'Insurance', 'NGOs', 'Healthcare', 'Housing'],
  ARRAY['Universal credit', 'Pensions', 'Disability support', 'Homelessness programs']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();

-- 11. Cultural, Media & Communications
INSERT INTO public_policy_areas (
  id,
  name,
  focus,
  key_departments_agencies,
  key_policy_areas,
  key_industry_sectors_affected,
  examples_of_impact
) VALUES (
  'cultural-media-communications',
  'Cultural, Media & Communications',
  'Arts, media, heritage, national identity',
  ARRAY['Department for Digital, Culture, Media & Sport'],
  ARRAY['Media regulation', 'Internet governance', 'Cultural preservation', 'Sports funding'],
  ARRAY['Media & broadcasting', 'Creative industries', 'Tourism', 'Sports', 'Arts'],
  ARRAY['Media regulation', 'Cultural preservation grants', 'Digital media laws', 'Sports funding']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  focus = EXCLUDED.focus,
  key_departments_agencies = EXCLUDED.key_departments_agencies,
  key_policy_areas = EXCLUDED.key_policy_areas,
  key_industry_sectors_affected = EXCLUDED.key_industry_sectors_affected,
  examples_of_impact = EXCLUDED.examples_of_impact,
  updated_at = NOW();
