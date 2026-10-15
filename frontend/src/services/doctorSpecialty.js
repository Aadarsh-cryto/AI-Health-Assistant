export const SPECIALTY_LABELS = Object.freeze({
  general_practice: 'General practice',
  cardiology: 'Cardiology',
  dermatology: 'Dermatology',
  gastroenterology: 'Gastroenterology',
  neurology: 'Neurology',
  orthopedics: 'Orthopedics',
  ophthalmology: 'Ophthalmology',
  respiratory: 'Respiratory medicine',
  mental_health: 'Mental health',
  urology: 'Urology',
})

const CITY_PATTERN = /^[\p{L}\p{M}\p{N}\s,.'’()-]+$/u
const SPECIALTY_SEARCH_TERMS = Object.freeze({
  general_practice: ['general physician', 'general medicine doctor'],
  cardiology: ['cardiologist'],
  dermatology: ['dermatologist'],
  gastroenterology: ['gastroenterologist'],
  neurology: ['neurologist'],
  orthopedics: ['orthopedic doctor'],
  ophthalmology: ['ophthalmologist'],
  respiratory: ['pulmonologist'],
  mental_health: ['mental health professional'],
  urology: ['urologist'],
})

export function validateDoctorSearchCity(value) {
  const city =
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  if (
    city.length < 2 ||
    city.length > 120 ||
    !CITY_PATTERN.test(city)
  ) {
    return {
      city,
      error:
        'Enter a city using 2 to 120 letters, numbers, spaces, or basic punctuation.',
    }
  }
  return { city, error: '' }
}

export function getDoctorNavigationState(result) {
  const suppliedCategories = Array.isArray(result?.recommendedSpecialties)
    ? result.recommendedSpecialties
    : Array.isArray(result?.specialties)
      ? result.specialties
      : typeof result?.specialty === 'string'
        ? [result.specialty]
        : []
  const specialties = [
    ...new Set(
      suppliedCategories
        .filter(
          (category) =>
            typeof category === 'string' &&
            Object.hasOwn(SPECIALTY_LABELS, category),
        ),
    ),
  ].slice(0, 3)
  return {
    specialties:
      specialties.length > 0 ? specialties : ['general_practice'],
  }
}

export function buildGoogleMapsSpecialtySearches(cityValue, specialties) {
  const { city, error } = validateDoctorSearchCity(cityValue)
  if (error) throw new TypeError(error)

  const categories = Array.isArray(specialties)
    ? [...new Set(specialties)].filter(
        (category) =>
          typeof category === 'string' &&
          Object.hasOwn(SPECIALTY_SEARCH_TERMS, category),
      )
    : []
  const selectedCategories =
    categories.length > 0 ? categories.slice(0, 3) : ['general_practice']

  return selectedCategories.flatMap((specialty) =>
    SPECIALTY_SEARCH_TERMS[specialty].map((searchTerm) => {
      const query = `${searchTerm} in ${city}`
      const url = new URL('https://www.google.com/maps/search/')
      url.searchParams.set('api', '1')
      url.searchParams.set('query', query)
      return {
        specialty,
        specialtyLabel: SPECIALTY_LABELS[specialty],
        searchTerm,
        query,
        url: url.toString(),
      }
    }),
  )
}
