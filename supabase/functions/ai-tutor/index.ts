// AI StudyMate — Edge Function
// Securely proxies AI requests. Uses OPENAI_API_KEY if configured (real AI);
// otherwise falls back to a clearly-labeled DEMO MODE with curated content.
// API key stays server-side — never sent to the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

type AIRequest = {
  task: "doubt" | "notes" | "quiz" | "exam" | "chat";
  prompt: string;
  simpleEnglish?: boolean;
  context?: string;
};

const SYSTEM_PROMPT = `You are AI StudyMate, a patient, encouraging tutor for first- and second-year engineering students in India. Always:
- Explain in clear, beginner-friendly language
- Include examples and step-by-step reasoning
- Use structured markdown (headings, bullet points, bold for key terms)
- Be accurate but concise
If the student asks something non-academic, gently steer back to studying.`;

const DEMO_NOTICE =
  "**[Demo Mode]** No AI API key is configured on the server, so this is a curated sample response — not a live AI answer. Add an OpenAI API key in Supabase Edge Function secrets as `OPENAI_API_KEY` to enable real AI responses.\n\n";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as AIRequest;
    const { task, prompt, simpleEnglish, context } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A 'prompt' string is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");

    // ---- REAL AI MODE ----
    if (apiKey) {
      const result = await callOpenAI(apiKey, task, prompt, simpleEnglish ?? false, context ?? "");
      return new Response(
        JSON.stringify({ content: result, isDemo: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- DEMO MODE (no API key) ----
    const demo = buildDemoResponse(task, prompt, simpleEnglish ?? false);
    return new Response(
      JSON.stringify({ content: demo, isDemo: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ============ OpenAI Integration ============

async function callOpenAI(
  apiKey: string,
  task: AIRequest["task"],
  prompt: string,
  simpleEnglish: boolean,
  context: string,
): Promise<string> {
  const taskInstruction = buildTaskInstruction(task, simpleEnglish);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT + "\n\n" + taskInstruction },
  ];

  if (context && task === "chat") {
    // Include prior conversation
    const ctxLines = context.split("\n").filter(Boolean);
    for (const line of ctxLines) {
      const [role, ...rest] = line.split(": ");
      if (role === "user" || role === "assistant") {
        messages.push({ role, content: rest.join(": ") });
      }
    }
  }

  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: task === "quiz" || task === "exam" ? 1600 : 1200,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenAI API error (${res.status}): ${errText.slice(0, 300)}`,
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected response format from AI provider.");
  }
  return content.trim();
}

function buildTaskInstruction(task: AIRequest["task"], simpleEnglish: boolean): string {
  const lang = simpleEnglish
    ? "\n\nIMPORTANT: Use very simple, easy English suitable for a beginner. Avoid complex vocabulary."
    : "";

  switch (task) {
    case "doubt":
      return (
        "Task: Answer the student's academic question. Provide:\n" +
        "1. A clear definition or direct answer\n" +
        "2. A step-by-step explanation with reasoning\n" +
        "3. At least one concrete example\n" +
        "4. A 'Key Takeaway' summary line at the end" + lang
      );
    case "notes":
      return (
        "Task: Generate structured study notes for the given topic. Format as markdown with:\n" +
        "## Topic Title\n### Definitions\n### Key Points (bullet list)\n### Examples\n### Quick Revision Summary" + lang
      );
    case "quiz":
      return (
        "Task: Generate exactly 5 multiple-choice questions on the given topic. " +
        "Return ONLY valid JSON (no markdown fences, no extra text) in this exact format:\n" +
        '[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]\n' +
        "Each question must have exactly 4 options. correctIndex is 0-3. Include a brief explanation for each."
      );
    case "exam":
      return (
        "Task: Create a realistic study schedule. Return ONLY valid JSON in this exact format:\n" +
        '{"schedule":[{"day":"Day 1","timeSlot":"9:00 AM - 11:00 AM","topic":"...","activity":"Read + note-taking","priority":"High"}]}\n' +
        "Create 6-10 study blocks. Prioritize High-priority topics in earlier slots. " +
        "Include revision and practice sessions. Activities should be specific (e.g. 'Read textbook + make flashcards', 'Solve 10 practice problems', 'Revise notes')."
      );
    case "chat":
      return (
        "Task: Have a helpful conversational exchange. Keep answers focused and academic. " +
        "If the student is confused, break things down step by step." + lang
      );
    default:
      return "";
  }
}

// ============ Demo Mode Content ============

function buildDemoResponse(task: AIRequest["task"], prompt: string, simpleEnglish: boolean): string {
  switch (task) {
    case "doubt":
      return demoDoubtResponse(prompt, simpleEnglish);
    case "notes":
      return DEMO_NOTICE + demoNotes(prompt.slice(0, 80));
    case "quiz":
      return demoQuiz(prompt.slice(0, 50));
    case "exam":
      return demoExam(prompt);
    case "chat":
      return DEMO_NOTICE + demoChat(prompt.slice(0, 80));
    default:
      return DEMO_NOTICE + "Demo response — configure an AI key for real responses.";
  }
}

// ============ Demo Doubt Solver — Curated Knowledge Base ============

type DemoEntry = {
  keywords: string[];
  answer: (simple: boolean) => string;
};

const DEMO_NOTICE_BANNER =
  "**[Demo Mode]** No AI API key is configured, so this is a **curated, verified** response from our built-in knowledge base — not a live AI answer. Add an OpenAI API key in Supabase Edge Function secrets as `OPENAI_API_KEY` to enable dynamic AI responses.\n\n";

const UNSUPPORTED_NOTICE =
  "**[Demo Mode]** No AI API key is configured, and a **verified demo answer is not available** for this specific question in our built-in knowledge base.\n\n" +
  "To get an answer, you can either:\n" +
  "- **Add an OpenAI API key** to Supabase Edge Function secrets (`OPENAI_API_KEY`) to enable real AI responses for any question.\n" +
  "- **Try one of the sample questions** listed below the input box — those have curated answers available.\n\n" +
  "*This is not a generic placeholder. We do not generate unverified content in Demo Mode.*";

function normalize(s: string): string {
  // Strip apostrophes/contractions entirely (so "Ohm's" → "ohms" not "ohm s"),
  // then replace other non-alphanumeric with spaces, and collapse whitespace.
  return s
    .replace(/['']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function demoDoubtResponse(prompt: string, simple: boolean): string {
  const normalized = normalize(prompt);
  const words = new Set(normalized.split(" ").filter((w) => w.length >= 3));
  let bestMatch: DemoEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwNorm = normalize(kw);
      // Multi-word keyword: substring match
      if (kwNorm.includes(" ")) {
        if (normalized.includes(kwNorm)) score += 3;
      } else {
        // Single-word keyword: exact word match to avoid false positives
        // (e.g., "ohm" should not match inside "another")
        if (words.has(kwNorm)) score += 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return DEMO_NOTICE_BANNER + bestMatch.answer(simple);
  }

  return UNSUPPORTED_NOTICE;
}

const KNOWLEDGE_BASE: DemoEntry[] = [
  {
    keywords: ["kirchhoff", "kirchoff", "kcl", "kvl", "kirchhoffs law", "kirchhoffs current", "kirchhoffs voltage", "current law", "voltage law"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of Kirchhoff's Laws."
        : "Here is a clear, detailed explanation of Kirchhoff's Circuit Laws.";
      return `## Kirchhoff's Circuit Laws

${intro}

Kirchhoff's Laws are two fundamental rules used to analyse **electrical circuits**, particularly when circuits have multiple loops and junctions. They were formulated by **Gustav Kirchhoff** in 1845 and form the basis of circuit analysis alongside Ohm's Law.

---

### Kirchhoff's Current Law (KCL) — Junction Rule

> **The total current entering a junction equals the total current leaving it.**

This is a direct consequence of the **law of conservation of charge** — charge cannot accumulate at a junction.

**Mathematically:**

$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$

or equivalently:

$\\sum I = 0$

(sign convention: currents entering = positive, currents leaving = negative)

---

### Kirchhoff's Voltage Law (KVL) — Loop Rule

> **The algebraic sum of all voltages around any closed loop in a circuit is zero.**

This comes from the **law of conservation of energy** — the energy gained by charges from sources equals the energy lost across resistors in a full loop.

**Mathematically:**

$\\sum V = 0 \\text{ (around a closed loop)}$

(sign convention: voltage rise from a battery = positive, voltage drop across a resistor = negative)

---

### Numerical Example

Consider a simple circuit with a **12 V battery** and two resistors in series: **R1 = 2 Ω** and **R2 = 4 Ω**.

**Step 1 — Apply KVL around the loop:**

$+12V - V_1 - V_2 = 0$

**Step 2 — Use Ohm's Law ($V = IR$):**

First, find the current. The total resistance is $R_1 + R_2 = 2 + 4 = 6\\,\\Omega$.

$I = \\frac{V}{R_{total}} = \\frac{12}{6} = 2\\,\\text{A}$

**Step 3 — Find individual voltage drops:**

$V_1 = I \\times R_1 = 2 \\times 2 = 4\\,\\text{V}$
$V_2 = I \\times R_2 = 2 \\times 4 = 8\\,\\text{V}$

**Step 4 — Verify KVL:**

$12 - 4 - 8 = 0 \\quad \\checkmark$

The sum of voltages around the loop is zero, confirming KVL.

**KCL example at a junction:** If 3 A and 2 A enter a junction, then $I_{out} = 3 + 2 = 5\\,\\text{A}$ must leave it.

---

### Key Assumptions & Conditions

1. **KCL assumes no charge accumulation** at the junction — valid for steady-state (DC) circuits and low-frequency AC.
2. **KVL assumes no changing magnetic flux** through the loop — it breaks down when there is a time-varying magnetic field (e.g., inductors with changing current, transformers). In such cases, Faraday's Law must be used instead.
3. Both laws assume **lumped circuit elements** — meaning the physical size of the circuit is small compared to the wavelength of the signal, so propagation delays are negligible.
4. **Sign conventions must be consistent** — pick a current direction and loop direction, and stick with it throughout the analysis.

---

### Key Takeaway

- **KCL** = conservation of charge → currents in = currents out at any junction.
- **KVL** = conservation of energy → sum of voltages around a closed loop = 0.
- Together with Ohm's Law, these two laws let you solve **any linear circuit**, no matter how complex.`;
    },
  },
  {
    keywords: ["newton", "second law", "newtons second law", "f=ma", "force equals mass", "newtons 2nd law"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of Newton's Second Law."
        : "Here is a clear explanation of Newton's Second Law of Motion.";
      return `## Newton's Second Law of Motion

${intro}

### Definition

> **The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. The direction of the acceleration is in the direction of the net force.**

### Formula

$F = m \\times a$

Where:
- **F** = net force (in Newtons, N)
- **m** = mass of the object (in kilograms, kg)
- **a** = acceleration (in m/s²)

### Step-by-Step Explanation

1. **A net force causes acceleration** — if no net force acts on an object, it stays at rest or moves at constant velocity (that's Newton's First Law).
2. **More force = more acceleration** — push twice as hard, the object accelerates twice as fast.
3. **More mass = less acceleration** — the same force on a heavier object produces less acceleration.
4. **Direction matters** — the acceleration is always in the same direction as the net force.

### Numerical Example

A **5 kg** block is pushed with a net force of **20 N** on a frictionless surface. What is its acceleration?

$a = \\frac{F}{m} = \\frac{20\\,\\text{N}}{5\\,\\text{kg}} = 4\\,\\text{m/s}^2$

The block accelerates at **4 m/s²** in the direction of the force.

### Key Assumptions

1. The law applies in an **inertial reference frame** (a frame that is not accelerating).
2. **Mass is constant** — the object doesn't gain or lose mass during motion.
3. The formula applies to **classical (non-relativistic) speeds** — at speeds close to the speed of light, relativistic mechanics takes over.
4. **F is the NET force** — the vector sum of all forces, not just one individual force.

### Key Takeaway

Newton's Second Law ($F = ma$) tells you exactly how an object's motion changes when a force acts on it: bigger force or lighter mass means more acceleration.`;
    },
  },
  {
    keywords: ["ohms law", "ohms", "voltage current resistance", "v=ir"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of Ohm's Law."
        : "Here is a clear explanation of Ohm's Law.";
      return `## Ohm's Law

${intro}

### Definition

> **The current through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the resistance between them.**

### Formula

$V = I \\times R$

Where:
- **V** = voltage (in Volts, V)
- **I** = current (in Amperes, A)
- **R** = resistance (in Ohms, Ω)

### Rearranged Forms

$I = \\frac{V}{R} \\qquad R = \\frac{V}{I}$

### Numerical Example

A **9 V battery** is connected across a **3 Ω** resistor. What current flows through it?

$I = \\frac{V}{R} = \\frac{9\\,\\text{V}}{3\\,\\Omega} = 3\\,\\text{A}$

A current of **3 Amperes** flows through the resistor.

### Key Assumptions & Conditions

1. **Constant temperature** — resistance of most conductors changes with temperature. Ohm's Law assumes temperature (and thus resistance) remains constant.
2. **Ohmic (linear) materials** — the law applies to materials where the V-I relationship is linear (like metallic conductors at constant temperature). It does **not** apply to non-ohmic devices like diodes or transistors.
3. **The relationship is for DC or instantaneous AC values** — for AC circuits with reactive components, impedance (Z) replaces resistance.

### Key Takeaway

Ohm's Law ($V = IR$) is the most fundamental relationship in circuit analysis. It lets you calculate any one of voltage, current, or resistance if you know the other two — provided the material is ohmic and temperature is constant.`;
    },
  },
  {
    keywords: ["ac and dc", "ac dc", "alternating current", "direct current", "difference between ac", "difference between dc"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of the difference between AC and DC current."
        : "Here is a clear comparison of Alternating Current (AC) and Direct Current (DC).";
      return `## AC vs DC Current

${intro}

### Definitions

- **Direct Current (DC):** Electric current that flows in **one direction only**. The voltage stays constant (or nearly constant) over time.
- **Alternating Current (AC):** Electric current that **reverses direction periodically**. The voltage follows a sinusoidal waveform, changing magnitude and direction many times per second.

### Key Differences

| Property | DC (Direct Current) | AC (Alternating Current) |
|----------|---------------------|--------------------------|
| **Direction** | One direction only | Reverses periodically |
| **Voltage** | Constant | Varies sinusoidally |
| **Frequency** | Zero (no oscillation) | 50 Hz or 60 Hz (India: 50 Hz) |
| **Source** | Batteries, solar cells, DC generators | Power plants, wall outlets |
| **Transmission** | Less efficient over long distances | More efficient for long-distance transmission |
| **Storage** | Can be stored in batteries | Cannot be stored directly |
| **Safety** | Generally safer at low voltages | Higher risk at same voltage due to alternating nature |

### Example

- Your **phone battery** provides **DC** at around 3.7 V — it always pushes current in one direction.
- Your **wall socket** provides **AC** at 230 V (in India) at 50 Hz — the current reverses direction 100 times per second (50 complete cycles).

### Why AC Won for Power Distribution

AC can be easily stepped up to high voltages (using transformers) for long-distance transmission, which reduces energy loss. DC could not be efficiently converted between voltage levels until modern power electronics made HVDC (High Voltage DC) transmission practical.

### Key Takeaway

DC flows in one direction (batteries, electronics); AC reverses direction periodically (power grid, wall outlets). Most electronic devices use DC internally, which is why chargers convert AC from the wall to DC for your devices.`;
    },
  },
  {
    keywords: ["binary search", "binary search algorithm", "searching algorithm", "binary search with example"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of binary search."
        : "Here is a clear explanation of the binary search algorithm with an example.";
      return `## Binary Search

${intro}

### Definition

> **Binary search is an efficient searching algorithm that finds the position of a target value within a **sorted** array by repeatedly dividing the search interval in half.**

### How It Works — Step by Step

1. **Start** with two pointers: \`low\` at the beginning and \`high\` at the end of the sorted array.
2. **Find the middle element** at index mid = (low + high) / 2.
3. **Compare** the middle element with the target:
   - If **equal** → target found! Return mid.
   - If **target < middle** → search the left half (set high = mid - 1).
   - If **target > middle** → search the right half (set low = mid + 1).
4. **Repeat** steps 2-3 until the target is found or low > high (meaning the target is not in the array).

### Numerical Example

Find **23** in the sorted array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]

| Step | low | high | mid | arr[mid] | Result |
|------|-----|------|-----|----------|--------|
| 1 | 0 | 9 | 4 | 16 | 23 > 16 → search right |
| 2 | 5 | 9 | 7 | 56 | 23 < 56 → search left |
| 3 | 5 | 6 | 5 | **23** | **Found at index 5!** ✓ |

### Pseudocode

\`\`\`
function binarySearch(arr, target):
    low = 0
    high = arr.length - 1
    while low <= high:
        mid = (low + high) / 2
        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1  // not found
\`\`\`

### Key Assumptions

1. **The array must be sorted** — binary search only works on sorted data. If the data is unsorted, you must sort it first (which costs O(n log n)).
2. **Random access** — the data structure must support O(1) access by index (arrays work; linked lists do not).
3. **Comparable elements** — the elements must support comparison operations.

### Time Complexity

- **Best case:** O(1) — target is at the middle on the first try.
- **Worst/Average case:** O(log n) — each step halves the search space.

This makes binary search **extremely fast** — searching a sorted array of 1 billion elements takes at most ~30 comparisons.

### Key Takeaway

Binary search finds a value in a **sorted** array in O(log n) time by repeatedly cutting the search range in half. It's one of the most important algorithms in computer science — but only works on sorted data with random access.`;
    },
  },
  {
    keywords: ["recursion", "recursive", "recursive function", "recursion in programming", "explain recursion"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of recursion."
        : "Here is a clear explanation of recursion in programming.";
      return `## Recursion in Programming

${intro}

### Definition

> **Recursion is a technique where a function calls itself to solve a smaller instance of the same problem until it reaches a simple base case that can be solved directly.**

### How It Works

Every recursive function has two essential parts:

1. **Base case** — the simplest version of the problem that can be answered directly (stops the recursion).
2. **Recursive case** — the function calls itself with a smaller or simpler input, moving toward the base case.

### Example: Factorial

The factorial of n (written n!) is n × (n-1) × (n-2) × ... × 1.

- **Base case:** 0! = 1
- **Recursive case:** n! = n × (n-1)!

\`\`\`python
def factorial(n):
    if n == 0:          # base case
        return 1
    return n * factorial(n - 1)   # recursive case
\`\`\`

**Trace for factorial(3):**
\`\`\`
factorial(3) → 3 * factorial(2)
             → 3 * (2 * factorial(1))
             → 3 * (2 * (1 * factorial(0)))
             → 3 * (2 * (1 * 1))
             → 6
\`\`\`

### Key Assumptions & Risks

1. **The base case must be reachable** — if the recursive case never reaches the base case, you get infinite recursion → **stack overflow**.
2. **Each call must reduce the problem** — the input must get smaller or closer to the base case each time.
3. **Memory usage** — each recursive call adds a frame to the call stack. Deep recursion can cause stack overflow. (Iterative solutions or tail-call optimization can help.)

### Key Takeaway

Recursion = a function that calls itself with a simpler input + a base case that stops it. It's elegant for problems with a naturally self-similar structure (factorials, tree traversal, divide-and-conquer algorithms like merge sort), but always ensure the base case is reachable to avoid stack overflow.`;
    },
  },
  {
    keywords: ["pointer", "pointers in c", "what is a pointer", "pointer in c"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of pointers in C."
        : "Here is a clear explanation of pointers in C programming.";
      return `## Pointers in C

${intro}

### Definition

> **A pointer is a variable that stores the memory address of another variable.** Instead of holding a data value directly, a pointer "points to" where the data lives in memory.

### Basic Syntax

\`\`\`c
int x = 42;       // a normal integer variable
int *p = &x;      // p is a pointer that stores the address of x
\`\`\`

- **&x** — the address-of operator, gives the memory address of x.
- **\\*p** — the dereference operator, gives the value stored at the address p points to (i.e., 42).
- **int \\*** — declares that p is a pointer to an integer.

### Step-by-Step Example

\`\`\`c
#include <stdio.h>
int main() {
    int x = 42;
    int *p = &x;

    printf("Value of x:    %d\\n", x);      // 42
    printf("Address of x:  %p\\n", (void*)&x); // e.g., 0x7ffe...
    printf("Pointer p:     %p\\n", (void*)p);  // same as &x
    printf("Value via *p:  %d\\n", *p);      // 42

    *p = 100;  // change x through the pointer
    printf("New x:         %d\\n", x);       // 100
    return 0;
}
\`\`\`

### Key Points

- **& (address-of)** gets the address of a variable.
- **\\* (dereference)** gets or sets the value at an address.
- Pointers must be **initialized** before use — an uninitialized pointer points to random memory (undefined behavior).
- **NULL pointer** — a pointer set to NULL points to nothing. Dereferencing NULL crashes the program.

### Key Assumptions & Risks

1. **Pointers require correct types** — an int * should point to an int. Mismatched types cause bugs.
2. **Dangling pointers** — if a pointer points to memory that has been freed, using it is undefined behavior.
3. **Memory leaks** — if you allocate memory with malloc() and never free() it, the memory is lost.
4. **Pointer arithmetic** — you can add/subtract integers from pointers to move through arrays, but going out of bounds is dangerous.

### Key Takeaway

A pointer is a variable that holds a memory address. Use & to get an address and * to read or write the value at that address. Pointers are powerful — they enable arrays, functions that modify arguments, and dynamic memory — but they require careful initialization and cleanup to avoid crashes.`;
    },
  },
  {
    keywords: ["big o", "big o notation", "time complexity", "asymptotic complexity", "algorithm complexity"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of Big O notation."
        : "Here is a clear explanation of Big O notation.";
      return `## Big O Notation

${intro}

### Definition

> **Big O notation describes the upper bound of an algorithm's running time or space usage as the input size grows toward infinity.** It tells you how the performance scales, ignoring constants and lower-order terms.

### Common Complexities (from fastest to slowest)

| Notation | Name | Example | n=10 | n=1000 |
|----------|------|---------|------|--------|
| O(1) | Constant | Array index lookup | 1 | 1 |
| O(log n) | Logarithmic | Binary search | ~3 | ~10 |
| O(n) | Linear | Scanning an array | 10 | 1000 |
| O(n log n) | Linearithmic | Merge sort | ~33 | ~10000 |
| O(n²) | Quadratic | Bubble sort | 100 | 1,000,000 |
| O(2ⁿ) | Exponential | Naive Fibonacci | 1024 | astronomical |

### Example

**Linear search** checks each element one by one:
\`\`\`python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
\`\`\`
In the worst case, it checks all n elements → **O(n)**.

**Binary search** halves the search space each step → **O(log n)**.

### Key Assumptions

1. Big O describes the **worst-case** (or asymptotic upper bound) — it doesn't tell you the actual running time, just how it grows.
2. **Constants are dropped** — O(2n) is written as O(n). Big O cares about growth rate, not exact counts.
3. Big O assumes **n → ∞** — for small inputs, an O(n²) algorithm might be faster than O(n log n) due to lower overhead.

### Key Takeaway

Big O notation tells you how an algorithm's runtime grows as the input gets larger. Lower complexity (O(1), O(log n)) is better. It's the standard way to compare algorithm efficiency without worrying about hardware specifics.`;
    },
  },
  {
    keywords: ["transistor", "how transistor works", "npn", "pnp", "bjt", "bipolar junction"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of how a transistor works."
        : "Here is a clear explanation of how a transistor works.";
      return `## How a Transistor Works

${intro}

### Definition

> **A transistor is a semiconductor device that acts as a switch or amplifier by controlling the flow of current between two terminals using a small signal applied to a third terminal.**

### The Bipolar Junction Transistor (BJT)

A BJT has **three terminals**:
- **Emitter** — heavily doped, injects charge carriers
- **Base** — thin, lightly doped layer that controls the current flow
- **Collector** — collects the charge carriers

There are two types: **NPN** and **PNP**, depending on the doping arrangement.

### How It Works — Step by Step

1. **A small current flows into the base** — this is the control signal.
2. **The base is very thin** — so most carriers from the emitter pass right through it into the collector, rather than recombining in the base.
3. **A much larger current flows from emitter to collector** — the small base current controls a large collector current.
4. **This is amplification** — a tiny input signal at the base produces a large output at the collector.

### Analogy

Think of a transistor like a **water valve**: a small turn of the valve handle (base current) controls a large flow of water (collector current). You don't need much force on the handle to control a powerful stream.

### Key Assumptions & Operating Modes

1. **Active region** — the transistor acts as an amplifier. The base-emitter junction is forward-biased, and the base-collector junction is reverse-biased.
2. **Saturation** — both junctions are forward-biased; the transistor is fully "ON" (used in switching).
3. **Cutoff** — both junctions are reverse-biased; the transistor is fully "OFF".
4. Transistors require **proper biasing** (DC voltages) to operate in the desired region.

### Key Takeaway

A transistor uses a small current at the base to control a large current between the emitter and collector. This lets it work as both an **amplifier** (small signal → large output) and a **switch** (ON/OFF in digital circuits). It's the building block of all modern electronics.`;
    },
  },
  {
    keywords: ["thermodynamics", "first law", "first law of thermodynamics", "law of thermodynamics"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of the First Law of Thermodynamics."
        : "Here is a clear explanation of the First Law of Thermodynamics.";
      return `## First Law of Thermodynamics

${intro}

### Definition

> **Energy can neither be created nor destroyed — it can only be transformed from one form to another.** The total energy of an isolated system is constant.

This is essentially the **law of conservation of energy** applied to thermodynamic systems.

### Formula

$\\Delta U = Q - W$

Where:
- **ΔU** = change in internal energy of the system
- **Q** = heat added **to** the system (positive when heat flows in)
- **W** = work done **by** the system (positive when the system expands)

### Numerical Example

A gas in a piston absorbs **500 J** of heat and does **200 J** of work by expanding. What is the change in internal energy?

$\\Delta U = Q - W = 500 - 200 = 300\\,\\text{J}$

The internal energy of the gas increases by **300 J**.

### Key Assumptions

1. The system is **well-defined** — you must clearly identify what is the "system" vs. the "surroundings."
2. **Sign conventions matter** — heat entering the system is positive; work done by the system is positive (physics convention).
3. The law applies to **isolated systems** — no energy crosses the boundary. For open systems (like turbines with mass flow), the full energy equation includes flow work.

### Key Takeaway

The First Law of Thermodynamics says energy is conserved: the change in a system's internal energy equals the heat added minus the work done. It's the foundation of all energy analysis in engineering.`;
    },
  },
  {
    keywords: ["object oriented", "oop", "object oriented programming", "class and object", "encapsulation", "polymorphism", "inheritance", "abstraction"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of Object-Oriented Programming."
        : "Here is a clear explanation of Object-Oriented Programming (OOP).";
      return `## Object-Oriented Programming (OOP)

${intro}

### Definition

> **Object-Oriented Programming is a programming paradigm based on the concept of "objects" — data structures that combine related data (attributes) and behavior (methods) into a single unit.**

### The Four Pillars

1. **Encapsulation** — bundling data and methods together inside a class, and restricting direct access to internal data (using private/public modifiers). This protects data from unintended changes.

2. **Inheritance** — a class (child/subclass) can inherit attributes and methods from another class (parent/superclass), enabling code reuse. Example: a \`Car\` class inherits from a \`Vehicle\` class.

3. **Polymorphism** — the same operation can behave differently for different types. Example: a \`draw()\` method works differently for a \`Circle\` vs. a \`Square\`, but you can call \`draw()\` on either without knowing which it is.

4. **Abstraction** — hiding complex implementation details and exposing only what's necessary. Example: you press a button to call someone — you don't need to know the radio protocol; the complexity is abstracted away.

### Example (Python)

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass  # to be overridden

class Dog(Animal):          # Inheritance
    def speak(self):        # Polymorphism (overriding)
        return f"{self.name} says Woof!"

dog = Dog("Rex")
print(dog.speak())  # "Rex says Woof!"
\`\`\`

### Key Takeaway

OOP organizes code around objects (data + behavior) rather than functions and logic. The four pillars — encapsulation, inheritance, polymorphism, and abstraction — help create code that is reusable, modular, and easier to maintain.`;
    },
  },
  {
    keywords: ["data structure", "data structures", "types of data structures", "array linked list", "stack queue"],
    answer: (simple) => {
      const intro = simple
        ? "Here is a very simple explanation of data structures."
        : "Here is a clear explanation of data structures.";
      return `## Data Structures

${intro}

### Definition

> **A data structure is a specific way of organizing, storing, and managing data in a computer so that it can be accessed and modified efficiently.**

### Common Data Structures

| Data Structure | Description | Use Case |
|---------------|-------------|----------|
| **Array** | Fixed-size, indexed collection of elements | Fast access by index (O(1)) |
| **Linked List** | Chain of nodes, each pointing to the next | Dynamic size, frequent insertions/deletions |
| **Stack** | Last-In-First-Out (LIFO) structure | Function call stack, undo operations |
| **Queue** | First-In-First-Out (FIFO) structure | Task scheduling, buffering |
| **Hash Table** | Key-value pairs with hash-based lookup | Fast lookups/insertions (O(1) average) |
| **Tree** | Hierarchical structure with nodes | File systems, databases, search (BST) |
| **Graph** | Network of nodes connected by edges | Maps, social networks, routing |

### Key Takeaway

Choosing the right data structure depends on what operations you need most often — arrays for fast random access, linked lists for frequent insertions, hash tables for fast lookups, trees for hierarchical data. Picking the wrong structure can make your program 1000× slower.`;
    },
  },
];

function demoNotes(topic: string): string {
  return `## Notes: ${topic}

### Definition
**${topic}** refers to an important concept in the engineering curriculum. It involves understanding the core principles, their mathematical or physical basis, and their practical applications.

### Key Points
- **Principle 1:** The foundational rule that governs ${topic}
- **Principle 2:** How the concept behaves under different conditions
- **Formula/Relationship:** The key equation or relationship (if applicable)
- **Assumptions:** The conditions under which the concept holds true
- **Limitations:** Where the concept breaks down or needs modification

### Examples
1. **Textbook Example:** A standard problem demonstrating ${topic} with a known solution
2. **Real-world Application:** How ${topic} is used in actual engineering practice (e.g., circuit design, structural analysis, software systems)
3. **Edge Case:** A scenario that tests the boundaries of the concept

### Common Mistakes to Avoid
- Confusing ${topic} with a related but distinct concept
- Forgetting to check units and dimensions
- Applying formulas outside their valid range

### Quick Revision Summary
${topic} = core principle + key formula + practical example. Remember the assumptions, verify with an example, and always check your units.

*This is a sample note structure generated in Demo Mode. Add an OpenAI API key to get detailed, topic-specific notes.*`;
}

function demoQuiz(topic: string): string {
  const t = topic.slice(0, 50);
  return JSON.stringify([
    {
      question: `Which of the following best describes ${t}?`,
      options: [
        `A fundamental concept with broad applications in engineering`,
        `A programming language used for web development`,
        `A type of mechanical gear system`,
        `A historical event in computing`,
      ],
      correctIndex: 0,
      explanation: `${t} is a core concept. The other options are unrelated categories.`,
    },
    {
      question: `When studying ${t}, the first step should be to:`,
      options: [
        `Memorize all formulas without understanding`,
        `Understand the definition and core principle`,
        `Skip directly to advanced problems`,
        `Wait for the teacher to explain everything`,
      ],
      correctIndex: 1,
      explanation: `Understanding the foundation before formulas or problems is the most effective study approach.`,
    },
    {
      question: `Which is an effective way to reinforce understanding of ${t}?`,
      options: [
        `Avoid practice problems`,
        `Only read passively`,
        `Solve varied examples and explain to someone else`,
        `Cram the night before the exam`,
      ],
      correctIndex: 2,
      explanation: `Active recall through practice and teaching others is proven to be far more effective than passive reading.`,
    },
    {
      question: `A common mistake when learning ${t} is:`,
      options: [
        `Drawing diagrams to visualize`,
        `Ignoring the assumptions behind formulas`,
        `Checking units carefully`,
        `Breaking the problem into steps`,
      ],
      correctIndex: 1,
      explanation: `Formulas have assumptions. Using them outside those assumptions leads to incorrect results.`,
    },
    {
      question: `The best revision strategy for ${t} before an exam is to`,
      options: [
        `Re-read the textbook cover to cover`,
        `Practice key problems and review summary notes`,
        `Avoid thinking about it until the exam`,
        `Only watch videos without practicing`,
      ],
      correctIndex: 1,
      explanation: `Targeted practice and summary review are more efficient than passive re-reading.`,
    },
  ]);
}

function demoExam(topic: string): string {
  return JSON.stringify({
    schedule: [
      { day: "Day 1", timeSlot: "9:00 AM - 11:00 AM", topic: `${topic} — Core Concepts`, activity: "Read textbook + make summary notes", priority: "High" },
      { day: "Day 1", timeSlot: "5:00 PM - 6:30 PM", topic: `${topic} — Key Formulas`, activity: "Write flashcards and memorize", priority: "High" },
      { day: "Day 2", timeSlot: "10:00 AM - 12:00 PM", topic: `${topic} — Practice Problems`, activity: "Solve 10 standard problems", priority: "High" },
      { day: "Day 2", timeSlot: "6:00 PM - 7:00 PM", topic: `${topic} — Review Mistakes`, activity: "Go over wrong answers and understand why", priority: "Medium" },
      { day: "Day 3", timeSlot: "9:00 AM - 10:30 AM", topic: `${topic} — Advanced Problems`, activity: "Solve previous year exam questions", priority: "Medium" },
      { day: "Day 3", timeSlot: "4:00 PM - 5:00 PM", topic: `${topic} — Full Revision`, activity: "Revise all notes + flashcards", priority: "High" },
      { day: "Day 4", timeSlot: "10:00 AM - 11:30 AM", topic: `${topic} — Mock Test`, activity: "Take a timed self-test", priority: "High" },
      { day: "Day 4", timeSlot: "6:00 PM - 7:00 PM", topic: `${topic} — Final Review`, activity: "Review mock test + weak areas", priority: "Medium" },
    ],
  });
}

function demoChat(topic: string): string {
  return `Great question! Let me help you with "${topic}".

Here's the short version: this concept is about understanding the core principle and then applying it step by step.

**Try this approach:**
1. Start with the definition
2. Work through one simple example
3. Then tackle harder problems

Would you like me to explain a specific part in more detail?

*This is a sample chat response in Demo Mode. Add an OpenAI API key for real conversational AI.*`;
}
