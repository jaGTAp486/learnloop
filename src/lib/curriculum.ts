import type { EducationLevel, QuizQuestion } from '@/types';

// ============ Education Levels ============

export const EDUCATION_LEVELS: EducationLevel[] = [
  // --- School ---
  { id: 'class-1', category: 'school', label: 'Class 1', group: 'School', subjects: ['Math', 'English', 'EVS'] },
  { id: 'class-2', category: 'school', label: 'Class 2', group: 'School', subjects: ['Math', 'English', 'EVS'] },
  { id: 'class-3', category: 'school', label: 'Class 3', group: 'School', subjects: ['Math', 'English', 'EVS'] },
  { id: 'class-4', category: 'school', label: 'Class 4', group: 'School', subjects: ['Math', 'English', 'EVS'] },
  { id: 'class-5', category: 'school', label: 'Class 5', group: 'School', subjects: ['Math', 'English', 'EVS', 'Science'] },
  { id: 'class-6', category: 'school', label: 'Class 6', group: 'School', subjects: ['Math', 'English', 'Science', 'Social Studies'] },
  { id: 'class-7', category: 'school', label: 'Class 7', group: 'School', subjects: ['Math', 'English', 'Science', 'Social Studies'] },
  { id: 'class-8', category: 'school', label: 'Class 8', group: 'School', subjects: ['Math', 'English', 'Science', 'Social Studies'] },
  { id: 'class-9', category: 'school', label: 'Class 9', group: 'School', subjects: ['Math', 'Science', 'English', 'Social Studies'] },
  { id: 'class-10', category: 'school', label: 'Class 10', group: 'School', subjects: ['Math', 'Science', 'English', 'Social Studies'] },
  { id: 'class-11', category: 'school', label: 'Class 11', group: 'School', subjects: ['Physics', 'Chemistry', 'Math', 'Biology', 'English'] },
  { id: 'class-12', category: 'school', label: 'Class 12', group: 'School', subjects: ['Physics', 'Chemistry', 'Math', 'Biology', 'English'] },

  // --- College ---
  { id: 'eng-first-year', category: 'college', label: 'First Year Engineering', group: 'College', subType: 'engineering-branch', subjects: ['Engineering Mathematics', 'Engineering Physics', 'Engineering Chemistry', 'Programming Fundamentals', 'Basic Electronics'] },
  { id: 'eng-second-year', category: 'college', label: 'Second Year Engineering', group: 'College', subType: 'engineering-branch', subjects: ['Data Structures', 'Algorithms', 'Digital Logic Design', 'Discrete Mathematics', 'Operating Systems'] },
  { id: 'eng-third-year', category: 'college', label: 'Third Year Engineering', group: 'College', subType: 'engineering-branch', subjects: ['Database Management Systems', 'Computer Networks', 'Software Engineering', 'Web Technologies', 'Machine Learning'] },
  { id: 'eng-final-year', category: 'college', label: 'Final Year Engineering', group: 'College', subType: 'engineering-branch', subjects: ['Cloud Computing', 'Artificial Intelligence', 'Cyber Security', 'Big Data Analytics', 'Mobile Computing'] },
  { id: 'bca', category: 'college', label: 'BCA', group: 'College', subjects: ['C Programming', 'Data Structures', 'DBMS', 'Web Design', 'Computer Networks'] },
  { id: 'bsc', category: 'college', label: 'B.Sc.', group: 'College', subjects: ['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology'] },
  { id: 'bcom', category: 'college', label: 'B.Com.', group: 'College', subjects: ['Accountancy', 'Business Studies', 'Economics', 'Business Law'] },
  { id: 'ba', category: 'college', label: 'BA', group: 'College', subjects: ['History', 'Political Science', 'Economics', 'English Literature', 'Sociology'] },
  { id: 'mbbs', category: 'college', label: 'MBBS', group: 'College', subType: 'mbbs-year', subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Microbiology'] },
  { id: 'other-college', category: 'college', label: 'Other', group: 'College', subjects: [] },
];

export const ENGINEERING_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'AI & Data Science',
  'Mechanical',
  'Civil',
  'Electrical',
  'Other',
];

export const MBBS_YEARS = ['First Year', 'Second Year', 'Third Year', 'Final Year'];

export function getLevelById(id: string | null): EducationLevel | null {
  if (!id) return null;
  return EDUCATION_LEVELS.find((l) => l.id === id) ?? null;
}

/** Get subjects for a level, adjusted for engineering branch / MBBS year if applicable. */
export function getSubjectsForLevel(levelId: string | null, subSelection: string | null): string[] {
  const level = getLevelById(levelId);
  if (!level) return [];
  if (level.subType === 'engineering-branch' && subSelection) {
    // Add branch-specific subjects
    const branchSubjects: Record<string, string[]> = {
      'Computer Engineering': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Object Oriented Programming'],
      'Information Technology': ['Computer Networks', 'Web Technologies', 'DBMS', 'Software Engineering'],
      'AI & Data Science': ['Machine Learning', 'Deep Learning', 'Statistics', 'Python Programming'],
      'Mechanical': ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing Processes'],
      'Civil': ['Structural Analysis', 'Geotechnical Engineering', 'Surveying', 'Environmental Engineering'],
      'Electrical': ['Circuit Analysis', 'Power Systems', 'Control Systems', 'Electrical Machines'],
      'Other': [],
    };
    return [...level.subjects, ...(branchSubjects[subSelection] ?? [])];
  }
  if (level.subType === 'mbbs-year' && subSelection) {
    const yearSubjects: Record<string, string[]> = {
      'First Year': ['Anatomy', 'Physiology', 'Biochemistry'],
      'Second Year': ['Pathology', 'Microbiology', 'Pharmacology'],
      'Third Year': ['Forensic Medicine', 'Community Medicine', 'ENT', 'Ophthalmology'],
      'Final Year': ['General Medicine', 'General Surgery', 'Pediatrics', 'Obstetrics & Gynaecology'],
    };
    return yearSubjects[subSelection] ?? level.subjects;
  }
  return level.subjects;
}

// ============ Question Bank ============
// Organized as: BANK[levelId][subject][topic] = QuizQuestion[]
// Difficulty is mixed within each topic's array — the generator filters by difficulty.

type QuestionBank = Record<string, Record<string, Record<string, QuizQuestion[]>>>;

export const QUESTION_BANK: QuestionBank = {
  // ===== CLASS 1 =====
  'class-1': {
    Math: {
      'Addition': [
        { question: 'What is 1 + 1?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: '1 plus 1 equals 2.' },
        { question: 'What is 2 + 3?', options: ['4', '5', '6', '7'], correctIndex: 1, explanation: '2 plus 3 equals 5.' },
        { question: 'What is 4 + 1?', options: ['4', '5', '6', '3'], correctIndex: 1, explanation: '4 plus 1 equals 5.' },
        { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctIndex: 1, explanation: '2 plus 2 equals 4.' },
      ],
      'Subtraction': [
        { question: 'What is 5 - 2?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: '5 minus 2 equals 3.' },
        { question: 'What is 4 - 1?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: '4 minus 1 equals 3.' },
        { question: 'What is 3 - 1?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: '3 minus 1 equals 2.' },
        { question: 'What is 6 - 3?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: '6 minus 3 equals 3.' },
      ],
      'Numbers': [
        { question: 'Which number comes after 5?', options: ['4', '6', '7', '8'], correctIndex: 1, explanation: '6 comes right after 5.' },
        { question: 'Which is the biggest number?', options: ['3', '7', '5', '1'], correctIndex: 1, explanation: '7 is the biggest among 3, 7, 5, and 1.' },
        { question: 'How many fingers on one hand?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'There are 5 fingers on one hand.' },
      ],
    },
    English: {
      'Alphabet': [
        { question: 'Which letter comes after B?', options: ['A', 'C', 'D', 'E'], correctIndex: 1, explanation: 'C comes after B in the alphabet.' },
        { question: 'Which letter comes after D?', options: ['C', 'E', 'F', 'G'], correctIndex: 1, explanation: 'E comes after D.' },
        { question: 'What is the first letter of the alphabet?', options: ['B', 'A', 'C', 'Z'], correctIndex: 1, explanation: 'A is the first letter.' },
        { question: 'Which letter comes after A?', options: ['C', 'B', 'D', 'E'], correctIndex: 1, explanation: 'B comes after A.' },
      ],
    },
    EVS: {
      'Living Things': [
        { question: 'Which of these is a living thing?', options: ['Rock', 'Tree', 'Chair', 'Pencil'], correctIndex: 1, explanation: 'A tree is a living thing — it grows.' },
        { question: 'What do plants need to grow?', options: ['Darkness', 'Sunlight and water', 'Plastic', 'Nothing'], correctIndex: 1, explanation: 'Plants need sunlight and water to grow.' },
        { question: 'Which animal says "Moo"?', options: ['Dog', 'Cat', 'Cow', 'Duck'], correctIndex: 2, explanation: 'A cow says "Moo".' },
      ],
    },
  },

  // ===== CLASS 5 =====
  'class-5': {
    Math: {
      'Multiplication': [
        { question: 'What is 6 × 7?', options: ['36', '42', '48', '56'], correctIndex: 1, explanation: '6 multiplied by 7 is 42.' },
        { question: 'What is 9 × 8?', options: ['63', '72', '81', '64'], correctIndex: 1, explanation: '9 multiplied by 8 is 72.' },
        { question: 'What is 12 × 5?', options: ['50', '55', '60', '65'], correctIndex: 2, explanation: '12 multiplied by 5 is 60.' },
      ],
      'Fractions': [
        { question: 'What is 1/2 + 1/2?', options: ['1/4', '1', '3/2', '2/4'], correctIndex: 1, explanation: 'Two halves make one whole, which is 1.' },
        { question: 'Which fraction is bigger: 1/3 or 1/2?', options: ['1/3', '1/2', 'They are equal', 'Cannot compare'], correctIndex: 1, explanation: '1/2 is bigger because it is divided into fewer parts.' },
      ],
    },
    Science: {
      'Plants': [
        { question: 'Which part of the plant absorbs water from soil?', options: ['Leaves', 'Stem', 'Roots', 'Flower'], correctIndex: 2, explanation: 'Roots absorb water and minerals from the soil.' },
        { question: 'What process do plants use to make food?', options: ['Digestion', 'Photosynthesis', 'Respiration', 'Reproduction'], correctIndex: 1, explanation: 'Plants make food through photosynthesis using sunlight.' },
      ],
    },
    English: {
      'Grammar': [
        { question: 'Which is a noun?', options: ['Run', 'Quickly', 'Book', 'Beautiful'], correctIndex: 2, explanation: '"Book" is a noun — it names a thing.' },
        { question: 'What is the past tense of "go"?', options: ['Goed', 'Went', 'Gone', 'Going'], correctIndex: 1, explanation: 'The past tense of "go" is "went".' },
      ],
    },
  },

  // ===== CLASS 8 =====
  'class-8': {
    Math: {
      'Algebra': [
        { question: 'Solve: 2x + 5 = 15. What is x?', options: ['3', '5', '7', '10'], correctIndex: 1, explanation: '2x = 15 - 5 = 10, so x = 5.' },
        { question: 'Simplify: 3(x + 2) when x = 4', options: ['12', '14', '18', '20'], correctIndex: 2, explanation: '3(4 + 2) = 3 × 6 = 18.' },
      ],
      'Geometry': [
        { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctIndex: 1, explanation: 'The interior angles of any triangle always add up to 180°.' },
        { question: 'A square has how many lines of symmetry?', options: ['2', '3', '4', '8'], correctIndex: 2, explanation: 'A square has 4 lines of symmetry.' },
      ],
    },
    Science: {
      'Force and Pressure': [
        { question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1, explanation: 'Force is measured in Newtons (N).' },
        { question: 'Which of these is a contact force?', options: ['Gravity', 'Magnetic force', 'Friction', 'Electrostatic force'], correctIndex: 2, explanation: 'Friction acts only when surfaces are in contact.' },
      ],
    },
  },

  // ===== CLASS 10 =====
  'class-10': {
    Math: {
      'Algebra': [
        { question: 'Find the roots of x² - 5x + 6 = 0', options: ['1 and 6', '2 and 3', '-2 and -3', '1 and 5'], correctIndex: 1, explanation: 'x² - 5x + 6 = (x-2)(x-3), so roots are 2 and 3.' },
        { question: 'What is the discriminant of x² + 4x + 4 = 0?', options: ['0', '4', '8', '16'], correctIndex: 0, explanation: 'D = b² - 4ac = 16 - 16 = 0, so there is one real root.' },
        { question: 'If the HCF of 96 and 404 is 4, what is their LCM?', options: ['9696', '4040', '4848', '2424'], correctIndex: 0, explanation: 'LCM × HCF = product, so LCM = (96 × 404) / 4 = 9696.' },
      ],
      'Geometry': [
        { question: 'The area of a circle with radius 7 cm is (use π = 22/7):', options: ['154 cm²', '44 cm²', '22 cm²', '308 cm²'], correctIndex: 0, explanation: 'Area = πr² = 22/7 × 49 = 154 cm².' },
        { question: 'In a right triangle, if base = 3 and height = 4, what is the hypotenuse?', options: ['5', '6', '7', '12'], correctIndex: 0, explanation: 'By Pythagoras: √(3² + 4²) = √25 = 5.' },
      ],
      'Trigonometry': [
        { question: 'What is sin 30°?', options: ['0', '0.5', '0.866', '1'], correctIndex: 1, explanation: 'sin 30° = 1/2 = 0.5.' },
        { question: 'What is cos 90°?', options: ['0', '0.5', '0.707', '1'], correctIndex: 0, explanation: 'cos 90° = 0.' },
        { question: 'sin²θ + cos²θ = ?', options: ['0', '1', '2', 'Depends on θ'], correctIndex: 1, explanation: 'This is the fundamental Pythagorean identity.' },
      ],
    },
    Science: {
      'Chemical Reactions': [
        { question: 'What type of reaction is Fe + CuSO₄ → FeSO₄ + Cu?', options: ['Combination', 'Decomposition', 'Displacement', 'Double displacement'], correctIndex: 2, explanation: 'Iron displaces copper from copper sulfate — a single displacement reaction.' },
        { question: 'What is the pH of a neutral solution?', options: ['0', '7', '14', '1'], correctIndex: 1, explanation: 'A neutral solution like pure water has pH 7.' },
        { question: 'Which gas is released when acids react with metals?', options: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Nitrogen'], correctIndex: 2, explanation: 'Acids react with metals to produce hydrogen gas.' },
      ],
      'Electricity': [
        { question: 'What is the SI unit of electric current?', options: ['Volt', 'Ampere', 'Ohm', 'Watt'], correctIndex: 1, explanation: 'Current is measured in Amperes (A).' },
        { question: 'Ohm\'s law states V = ?', options: ['IR', 'I/R', 'R/I', 'I²R'], correctIndex: 0, explanation: 'Ohm\'s law: Voltage = Current × Resistance.' },
      ],
      'Life Processes': [
        { question: 'Where does photosynthesis occur in plant cells?', options: ['Nucleus', 'Mitochondria', 'Chloroplast', 'Ribosome'], correctIndex: 2, explanation: 'Chloroplasts contain chlorophyll and are the site of photosynthesis.' },
        { question: 'Which blood cells fight infections?', options: ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], correctIndex: 1, explanation: 'White blood cells (leukocytes) fight infections.' },
      ],
    },
    English: {
      'Grammar': [
        { question: 'Identify the figure of speech: "The wind whispered through the trees."', options: ['Simile', 'Personification', 'Metaphor', 'Hyperbole'], correctIndex: 1, explanation: 'Giving the wind the human ability to whisper is personification.' },
        { question: 'Choose the correct passive voice: "She wrote a letter."', options: ['A letter was written by her.', 'A letter is written by her.', 'A letter has been written by her.', 'A letter writes by her.'], correctIndex: 0, explanation: 'Past simple passive: was/written + past participle + by.' },
      ],
    },
    'Social Studies': {
      'History': [
        { question: 'In which year did India gain independence?', options: ['1942', '1945', '1947', '1950'], correctIndex: 2, explanation: 'India gained independence on August 15, 1947.' },
        { question: 'Who was the first Prime Minister of India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Rajendra Prasad'], correctIndex: 1, explanation: 'Jawaharlal Nehru was India\'s first Prime Minister.' },
      ],
    },
  },

  // ===== CLASS 12 =====
  'class-12': {
    Physics: {
      'Electrostatics': [
        { question: 'What is the SI unit of electric charge?', options: ['Volt', 'Coulomb', 'Ampere', 'Farad'], correctIndex: 1, explanation: 'Electric charge is measured in Coulombs (C).' },
        { question: 'Coulomb\'s law gives the force between two charges as F = kq₁q₂/r². What is k?', options: ['6.67×10⁻¹¹', '9×10⁹ Nm²/C²', '1.6×10⁻¹⁹', '3×10⁸'], correctIndex: 1, explanation: 'k = 1/(4πε₀) ≈ 9×10⁹ Nm²/C².' },
        { question: 'The electric field inside a conductor in electrostatic equilibrium is:', options: ['Maximum', 'Zero', 'Infinite', 'Constant non-zero'], correctIndex: 1, explanation: 'In electrostatic equilibrium, charges redistribute so the internal field is zero.' },
      ],
      'Optics': [
        { question: 'What is the speed of light in vacuum (approx)?', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁵ m/s'], correctIndex: 0, explanation: 'Speed of light c ≈ 3×10⁸ m/s.' },
        { question: 'In a convex lens, when an object is placed at 2F, the image is formed at:', options: ['F', '2F', 'Infinity', 'Between F and 2F'], correctIndex: 1, explanation: 'Object at 2F produces a real, inverted image at 2F on the other side.' },
      ],
      'Modern Physics': [
        { question: 'The energy of a photon is given by E = ?', options: ['mc²', 'hf', 'kT', 'qV'], correctIndex: 1, explanation: 'E = hf, where h is Planck\'s constant and f is frequency.' },
        { question: 'What is the de Broglie wavelength formula?', options: ['λ = h/p', 'λ = hf', 'λ = c/f', 'λ = mc'], correctIndex: 0, explanation: 'de Broglie wavelength λ = h/p, where p is momentum.' },
      ],
    },
    Chemistry: {
      'Chemical Bonding': [
        { question: 'How many covalent bonds does a carbon atom form?', options: ['2', '3', '4', '6'], correctIndex: 2, explanation: 'Carbon has 4 valence electrons and forms 4 covalent bonds.' },
        { question: 'What is the shape of a methane (CH₄) molecule?', options: ['Linear', 'Tetrahedral', 'Trigonal planar', 'Bent'], correctIndex: 1, explanation: 'Methane has a tetrahedral geometry with bond angles of 109.5°.' },
      ],
      'Organic Chemistry': [
        { question: 'Which functional group is present in alcohols?', options: ['-COOH', '-OH', '-CHO', '-NH₂'], correctIndex: 1, explanation: 'Alcohols have the hydroxyl group (-OH).' },
        { question: 'IUPAC name of CH₃CH₂CH₂OH is:', options: ['Methanol', 'Ethanol', 'Propan-1-ol', 'Butanol'], correctIndex: 2, explanation: 'Three carbon chain with -OH on carbon 1 = propan-1-ol.' },
      ],
      'Electrochemistry': [
        { question: 'In a galvanic cell, oxidation occurs at the:', options: ['Cathode', 'Anode', 'Salt bridge', 'Electrolyte'], correctIndex: 1, explanation: 'Oxidation (loss of electrons) occurs at the anode.' },
        { question: 'What is the standard reduction potential of the standard hydrogen electrode (SHE)?', options: ['0 V', '1 V', '-1 V', '0.5 V'], correctIndex: 0, explanation: 'SHE is defined as 0.00 V by convention.' },
      ],
    },
    Math: {
      'Calculus': [
        { question: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], correctIndex: 0, explanation: 'd/dx [sin(x)] = cos(x).' },
        { question: 'What is the integral of 1/x dx?', options: ['x', 'ln|x| + C', '1/x²', '-1/x²'], correctIndex: 1, explanation: '∫(1/x) dx = ln|x| + C.' },
        { question: 'What is the derivative of e^x?', options: ['e^x', 'x·e^(x-1)', '1', 'ln(x)'], correctIndex: 0, explanation: 'd/dx [e^x] = e^x — the exponential function is its own derivative.' },
      ],
      'Matrices': [
        { question: 'If A is a 2×3 matrix and B is a 3×4 matrix, what is the size of AB?', options: ['2×4', '3×3', '4×2', 'Not possible'], correctIndex: 0, explanation: 'A (2×3) × B (3×4) = AB (2×4). Inner dimensions must match.' },
        { question: 'A square matrix is called singular if its determinant is:', options: ['1', '0', 'Positive', 'Negative'], correctIndex: 1, explanation: 'A singular matrix has determinant 0 and no inverse.' },
      ],
      'Probability': [
        { question: 'If P(A) = 0.3 and P(B) = 0.4 and A,B are independent, what is P(A and B)?', options: ['0.7', '0.12', '0.34', '0.1'], correctIndex: 1, explanation: 'For independent events: P(A∩B) = P(A)×P(B) = 0.3×0.4 = 0.12.' },
      ],
    },
    Biology: {
      'Genetics': [
        { question: 'What does DNA stand for?', options: ['Deoxyribonucleic acid', 'Diribonucleic acid', 'Deoxyribose nucleic atom', 'Dinucleic acid'], correctIndex: 0, explanation: 'DNA = Deoxyribonucleic acid.' },
        { question: 'How many chromosomes does a normal human cell have?', options: ['23', '44', '46', '48'], correctIndex: 2, explanation: 'Humans have 46 chromosomes (23 pairs).' },
      ],
      'Human Physiology': [
        { question: 'Which hormone regulates blood sugar levels?', options: ['Insulin', 'Adrenaline', 'Thyroxine', 'Growth hormone'], correctIndex: 0, explanation: 'Insulin lowers blood glucose; glucagon raises it.' },
        { question: 'Which part of the brain controls balance and coordination?', options: ['Cerebrum', 'Cerebellum', 'Medulla', 'Hypothalamus'], correctIndex: 1, explanation: 'The cerebellum coordinates movement and balance.' },
      ],
    },
  },

  // ===== FIRST YEAR ENGINEERING =====
  'eng-first-year': {
    'Engineering Mathematics': {
      'Differential Calculus': [
        { question: 'What is the derivative of ln(x)?', options: ['1/x', 'x', 'e^x', '1/x²'], correctIndex: 0, explanation: 'd/dx [ln(x)] = 1/x.' },
        { question: 'What is the derivative of x³?', options: ['x²', '3x', '3x²', '3'], correctIndex: 2, explanation: 'Using the power rule: d/dx [xⁿ] = n·x^(n-1), so 3x².' },
        { question: 'What is the limit of sin(x)/x as x→0?', options: ['0', '1', '∞', 'Undefined'], correctIndex: 1, explanation: 'This is a standard limit: lim(x→0) sin(x)/x = 1.' },
      ],
      'Linear Algebra': [
        { question: 'If a matrix has eigenvalues 2 and 3, what is its determinant?', options: ['5', '6', '1', '0'], correctIndex: 1, explanation: 'Determinant = product of eigenvalues = 2 × 3 = 6.' },
      ],
    },
    'Programming Fundamentals': {
      'C Basics': [
        { question: 'Which header file is needed for printf()?', options: ['<stdlib.h>', '<stdio.h>', '<string.h>', '<math.h>'], correctIndex: 1, explanation: 'printf() is declared in <stdio.h>.' },
        { question: 'What is the size of an int in C (on most modern systems)?', options: ['2 bytes', '4 bytes', '8 bytes', '1 byte'], correctIndex: 1, explanation: 'On most modern 32/64-bit systems, int is 4 bytes.' },
        { question: 'Which operator is used for comparison in C?', options: ['=', '==', ':=', '!='], correctIndex: 1, explanation: '== is for comparison; = is for assignment.' },
        { question: 'What does the %d format specifier print?', options: ['A decimal float', 'An integer', 'A character', 'A string'], correctIndex: 1, explanation: '%d prints a signed integer.' },
      ],
      'Control Structures': [
        { question: 'What does a for loop require?', options: ['Initialization, condition, increment', 'Only a condition', 'Only a variable', 'A switch statement'], correctIndex: 0, explanation: 'A for loop has initialization, condition, and increment/decrement.' },
      ],
    },
    'Basic Electronics': {
      'Diodes': [
        { question: 'A diode conducts current in which direction?', options: ['Both directions', 'Forward bias only', 'Reverse bias only', 'Neither direction'], correctIndex: 1, explanation: 'A diode conducts only when forward-biased (anode positive relative to cathode).' },
        { question: 'What is the approximate forward voltage drop of a silicon diode?', options: ['0.2V', '0.7V', '1.2V', '3.3V'], correctIndex: 1, explanation: 'Silicon diodes have ~0.7V forward voltage drop.' },
      ],
    },
    'Engineering Physics': {
      'Waves': [
        { question: 'What is the relationship between wavelength, frequency, and wave speed?', options: ['v = λ/f', 'v = fλ', 'v = λ + f', 'v = λ - f'], correctIndex: 1, explanation: 'Wave speed = frequency × wavelength.' },
      ],
    },
  },

  // ===== SECOND YEAR ENGINEERING =====
  'eng-second-year': {
    'Data Structures': {
      'Arrays': [
        { question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctIndex: 0, explanation: 'Array access by index is O(1) — constant time.' },
        { question: 'In a 0-indexed array, the first element is at index:', options: ['1', '0', '-1', 'n'], correctIndex: 1, explanation: 'Arrays in most languages are 0-indexed.' },
      ],
      'Linked Lists': [
        { question: 'What is the time complexity of inserting at the head of a singly linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctIndex: 0, explanation: 'Inserting at head requires only updating the head pointer — O(1).' },
        { question: 'Which linked list allows traversal in both directions?', options: ['Singly linked list', 'Doubly linked list', 'Circular linked list', 'Array'], correctIndex: 1, explanation: 'A doubly linked list has next and prev pointers.' },
      ],
      'Stacks': [
        { question: 'Which principle does a stack follow?', options: ['FIFO', 'LIFO', 'Random access', 'Priority'], correctIndex: 1, explanation: 'Stacks follow LIFO (Last In, First Out).' },
        { question: 'What is the time complexity of push and pop on a stack?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctIndex: 1, explanation: 'Both push and pop operate on the top — O(1).' },
      ],
      'Trees': [
        { question: 'What is the maximum number of nodes at level L in a binary tree?', options: ['L', '2^L', '2L', 'L²'], correctIndex: 1, explanation: 'Level L can have at most 2^L nodes (root is level 0).' },
        { question: 'In a BST, an inorder traversal produces nodes in what order?', options: ['Random', 'Sorted ascending', 'Sorted descending', 'Level order'], correctIndex: 1, explanation: 'Inorder traversal of a BST visits nodes in ascending order.' },
      ],
    },
    'Algorithms': {
      'Sorting': [
        { question: 'What is the average-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'QuickSort averages O(n log n) but degrades to O(n²) in worst case.' },
        { question: 'Which sorting algorithm has a guaranteed O(n log n) worst-case?', options: ['QuickSort', 'BubbleSort', 'MergeSort', 'InsertionSort'], correctIndex: 2, explanation: 'MergeSort always runs in O(n log n).' },
      ],
      'Searching': [
        { question: 'Binary search requires the array to be:', options: ['Unsorted', 'Sorted', 'Reversed', 'Unique elements only'], correctIndex: 1, explanation: 'Binary search only works on sorted arrays.' },
        { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1, explanation: 'Binary search halves the search space each step — O(log n).' },
      ],
    },
    'Operating Systems': {
      'Process Management': [
        { question: 'What is a context switch?', options: ['Deleting a process', 'Saving and restoring process state', 'Creating a new process', 'Terminating a process'], correctIndex: 1, explanation: 'A context switch saves the current process state and loads the next one.' },
        { question: 'Which scheduling algorithm gives the shortest average waiting time?', options: ['FCFS', 'Round Robin', 'SJF (Shortest Job First)', 'Priority'], correctIndex: 2, explanation: 'SJF minimizes average waiting time but may cause starvation.' },
      ],
    },
  },

  // ===== THIRD YEAR ENGINEERING =====
  'eng-third-year': {
    'Database Management Systems': {
      'SQL': [
        { question: 'Which SQL command retrieves data from a table?', options: ['GET', 'SELECT', 'FETCH', 'RETRIEVE'], correctIndex: 1, explanation: 'SELECT is used to query data from tables.' },
        { question: 'Which clause filters rows in SQL?', options: ['GROUP BY', 'WHERE', 'ORDER BY', 'HAVING'], correctIndex: 1, explanation: 'WHERE filters rows before grouping; HAVING filters after GROUP BY.' },
        { question: 'Which key uniquely identifies a row in a table?', options: ['Foreign key', 'Primary key', 'Candidate key', 'Super key'], correctIndex: 1, explanation: 'A primary key uniquely identifies each row and cannot be NULL.' },
      ],
      'Normalization': [
        { question: 'Which normal form eliminates partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctIndex: 1, explanation: '2NF eliminates partial dependencies on a composite key.' },
        { question: 'BCNF is a stronger form of which normal form?', options: ['1NF', '2NF', '3NF', '4NF'], correctIndex: 2, explanation: 'BCNF is a stricter version of 3NF.' },
      ],
    },
    'Computer Networks': {
      'OSI Model': [
        { question: 'How many layers are in the OSI model?', options: ['5', '6', '7', '8'], correctIndex: 2, explanation: 'The OSI model has 7 layers.' },
        { question: 'Which OSI layer handles routing?', options: ['Data Link', 'Network', 'Transport', 'Session'], correctIndex: 1, explanation: 'The Network layer (Layer 3) handles routing and logical addressing.' },
        { question: 'Which protocol is connection-oriented?', options: ['UDP', 'TCP', 'IP', 'ICMP'], correctIndex: 1, explanation: 'TCP establishes a connection before data transfer (three-way handshake).' },
      ],
    },
    'Software Engineering': {
      'SDLC': [
        { question: 'Which model is also called the waterfall model?', options: ['Iterative', 'Linear sequential', 'Spiral', 'Agile'], correctIndex: 1, explanation: 'The waterfall model follows a linear sequential approach.' },
        { question: 'What does UML stand for?', options: ['Unified Modeling Language', 'Universal Markup Language', 'Unified Markup Logic', 'Universal Modeling Logic'], correctIndex: 0, explanation: 'UML = Unified Modeling Language.' },
      ],
    },
  },

  // ===== FINAL YEAR ENGINEERING =====
  'eng-final-year': {
    'Cloud Computing': {
      'Fundamentals': [
        { question: 'Which cloud model provides services over the public internet?', options: ['Private cloud', 'Public cloud', 'Hybrid cloud', 'Community cloud'], correctIndex: 1, explanation: 'Public cloud services are delivered over the public internet.' },
        { question: 'What does IaaS stand for?', options: ['Internet as a Service', 'Infrastructure as a Service', 'Integration as a Service', 'Information as a Service'], correctIndex: 1, explanation: 'IaaS = Infrastructure as a Service (e.g., AWS EC2).' },
      ],
    },
    'Artificial Intelligence': {
      'Machine Learning': [
        { question: 'Which type of learning uses labeled training data?', options: ['Unsupervised', 'Supervised', 'Reinforcement', 'Semi-supervised'], correctIndex: 1, explanation: 'Supervised learning trains on labeled input-output pairs.' },
        { question: 'What does a decision tree use to split nodes?', options: ['Random choice', 'Information gain / Gini index', 'Euclidean distance', 'Gradient descent'], correctIndex: 1, explanation: 'Decision trees split using criteria like information gain or Gini impurity.' },
      ],
    },
    'Cyber Security': {
      'Cryptography': [
        { question: 'Which algorithm is an example of asymmetric encryption?', options: ['AES', 'DES', 'RSA', '3DES'], correctIndex: 2, explanation: 'RSA uses public/private key pairs (asymmetric). AES and DES are symmetric.' },
        { question: 'What does a digital signature ensure?', options: ['Only confidentiality', 'Authenticity and integrity', 'Only speed', 'Compression'], correctIndex: 1, explanation: 'Digital signatures verify sender authenticity and data integrity.' },
      ],
    },
  },

  // ===== MBBS =====
  'mbbs': {
    Anatomy: {
      'Upper Limb': [
        { question: 'How many bones are in the adult human hand?', options: ['20', '24', '27', '30'], correctIndex: 2, explanation: 'Each hand has 27 bones: 8 carpals, 5 metacarpals, 14 phalanges.' },
        { question: 'Which muscle flexes the elbow?', options: ['Triceps brachii', 'Biceps brachii', 'Deltoid', 'Pectoralis major'], correctIndex: 1, explanation: 'The biceps brachii is the primary elbow flexor.' },
      ],
      'Thorax': [
        { question: 'How many pairs of ribs are in the human body?', options: ['10', '11', '12', '13'], correctIndex: 2, explanation: 'There are 12 pairs of ribs (24 total).' },
        { question: 'Which chamber of the heart pumps blood to the lungs?', options: ['Left ventricle', 'Right ventricle', 'Left atrium', 'Right atrium'], correctIndex: 1, explanation: 'The right ventricle pumps deoxygenated blood to the lungs via the pulmonary artery.' },
      ],
    },
    Physiology: {
      'Nerve Muscle': [
        { question: 'What is the resting membrane potential of a neuron?', options: ['+30 mV', '0 mV', '-70 mV', '-90 mV'], correctIndex: 2, explanation: 'The resting potential is approximately -70 mV, maintained by the Na⁺/K⁺ pump.' },
        { question: 'Which neurotransmitter is released at the neuromuscular junction?', options: ['Dopamine', 'Acetylcholine', 'GABA', 'Serotonin'], correctIndex: 1, explanation: 'Acetylcholine is released at the neuromuscular junction.' },
      ],
      'Blood': [
        { question: 'What is the normal pH of human blood?', options: ['7.0', '7.35-7.45', '7.8', '6.8'], correctIndex: 1, explanation: 'Normal blood pH is 7.35-7.45 (slightly alkaline).' },
        { question: 'Which cells are responsible for oxygen transport?', options: ['White blood cells', 'Platelets', 'Red blood cells', 'Plasma proteins'], correctIndex: 2, explanation: 'Red blood cells contain hemoglobin which carries oxygen.' },
      ],
    },
    Biochemistry: {
      'Carbohydrates': [
        { question: 'What is the final product of glycolysis?', options: ['Glucose', 'Pyruvate', 'Lactate', 'Acetyl-CoA'], correctIndex: 1, explanation: 'Glycolysis converts glucose to two molecules of pyruvate.' },
        { question: 'How many ATP molecules are produced from one glucose in glycolysis?', options: ['2', '4', '6', '36'], correctIndex: 0, explanation: 'Glycolysis produces a net of 2 ATP per glucose molecule.' },
      ],
      'Enzymes': [
        { question: 'What does the Michaelis-Menten constant (Km) represent?', options: ['Maximum velocity', 'Substrate concentration at half Vmax', 'Enzyme concentration', 'pH optimum'], correctIndex: 1, explanation: 'Km is the substrate concentration at which reaction rate is half of Vmax.' },
      ],
    },
    Pathology: {
      'Inflammation': [
        { question: 'Which cells are the first to arrive at an acute inflammation site?', options: ['Lymphocytes', 'Neutrophils', 'Macrophages', 'Eosinophils'], correctIndex: 1, explanation: 'Neutrophils are the first responders in acute inflammation.' },
      ],
    },
    Pharmacology: {
      'General Pharmacology': [
        { question: 'What is the route with the fastest drug absorption?', options: ['Oral', 'Intravenous', 'Subcutaneous', 'Topical'], correctIndex: 1, explanation: 'IV injection delivers the drug directly into circulation — 100% bioavailability.' },
      ],
    },
    Microbiology: {
      'Bacteria': [
        { question: 'Which stain is used to classify bacteria into Gram-positive and Gram-negative?', options: ['Acid-fast stain', 'Gram stain', 'Giemsa stain', 'Wright stain'], correctIndex: 1, explanation: 'The Gram stain differentiates bacteria by cell wall structure.' },
      ],
    },
  },

  // ===== BCA =====
  'bca': {
    'C Programming': {
      'Basics': [
        { question: 'Which function is the entry point of a C program?', options: ['start()', 'main()', 'init()', 'run()'], correctIndex: 1, explanation: 'Execution begins at main() in C.' },
        { question: 'What is the size of a char in C?', options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], correctIndex: 0, explanation: 'A char is 1 byte in C.' },
      ],
    },
    'Data Structures': {
      'Basics': [
        { question: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctIndex: 1, explanation: 'A stack follows Last In First Out (LIFO).' },
      ],
    },
  },

  // ===== B.Sc. =====
  'bsc': {
    Physics: {
      'Mechanics': [
        { question: 'What is the SI unit of work?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correctIndex: 1, explanation: 'Work is measured in Joules (J).' },
        { question: 'Newton\'s second law: F = ?', options: ['mv', 'ma', 'm/a', 'a/m'], correctIndex: 1, explanation: 'Force = mass × acceleration.' },
      ],
    },
    Chemistry: {
      'Atomic Structure': [
        { question: 'What is the maximum number of electrons in the second shell?', options: ['2', '8', '18', '32'], correctIndex: 1, explanation: 'The second shell (n=2) holds 2n² = 8 electrons.' },
      ],
    },
    Mathematics: {
      'Calculus': [
        { question: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2'], correctIndex: 1, explanation: 'd/dx [x²] = 2x.' },
      ],
    },
  },
};

/** Get all topics available for a given level and subject. */
export function getTopicsForSubject(levelId: string, subject: string): string[] {
  const levelBank = QUESTION_BANK[levelId];
  if (!levelBank) return [];
  const subjectBank = levelBank[subject];
  if (!subjectBank) return [];
  return Object.keys(subjectBank);
}

/** Get all subjects that have question banks for a given level. */
export function getAvailableSubjects(levelId: string): string[] {
  const levelBank = QUESTION_BANK[levelId];
  if (!levelBank) return [];
  return Object.keys(levelBank);
}
