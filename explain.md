# WizzGeeks DPS Question Dump — Format Guide

This folder contains every question and test that is visible to the logged-in
student account on `https://dps.wizzgeeks.com/` (CBSE Class 12, subjects: Maths + Physics).

All files are individual JSON files, one per question / one per test metadata
record.

## Folder structure

```
questions/
  math/
    <Chapter Name>/          e.g. "Chapter 1 - Relations and Functions"
      mcq/        <question_id>.json
      vsa/        <question_id>.json
      sa/         <question_id>.json
      la/         <question_id>.json
      ar/         <question_id>.json
      casestudy/  <question_id>.json
  phy/
    <Chapter Name>/          e.g. "Chapter1 - ELECTRIC CHARGES AND FIELDS"
      categorytest/  <question_id>.json   (category-test MCQ pools)
      vsatest/
        vsa/           <question_id>.json (VSA initial-test questions)
        vsa_adaptive/  <question_id>.json (VSA adaptive-test questions)
tests/
  math/
    <Chapter Name>/
      maths_adaptive_category.json   (difficulty / has_test / latest_test)
      adaptive_category.json
      maths_adaptive_history.json    (list of past tests, empty for new users)
      maths_adaptive/
        questions/  <question_id>.json
        questions.json               (full adaptive-test set for the chapter)
  phy/
    <Chapter Name>/
      categorytest/
        Remembering/            <question_id>.json
        Understanding/          <question_id>.json
        Applying/               <question_id>.json
        "Analysing, Evaluating, Creating"/  <question_id>.json
        JEE/                    <question_id>.json
      adaptive_category.json
      maths_adaptive_category.json
      maths_adaptive_history.json
```

## Question types (field `question_type`)

| Value       | Meaning                                             | Found in      |
|-------------|-----------------------------------------------------|---------------|
| `MCQ`       | Multiple choice (options A–D)                       | Maths bank + Physics tests |
| `VSA`       | Very short answer                                   | Maths bank + Physics tests |
| `SA`        | Short answer                                        | Maths bank + Physics tests |
| `LA`        | Long answer                                         | Maths bank        |
| `AR`        | Assertion & Reason                                  | Maths bank        |
| `CASESTUDY` | Case-study based multi-part question                | Maths bank        |

## Maths questions (`questions/math/...`) — full bank WITH answers

These come from the server's question bank and include the **answer and explanation**. Example:

```json
{
  "id": "69a96ea6d8e9ca3b29345783",
  "subject": "68cc04ec9e8dfa8163c0c559",
  "chapter": "69a6c4e8681ebad5835402ec",
  "subtopic": "69a92678681ebad583540307",
  "topic": ["69c65c9340512f018fa94d43"],
  "question_type": "MCQ",
  "question": "Let $A$ be a finite set and $R$ an equivalence relation on $A$. The number of distinct equivalence classes under $R$:",
  "options": {
    "A": "always equals $|A|$",
    "B": "always equals 1",
    "C": "always less than $|A|$",
    "D": "always at least 1 but at most $|A|$"
  },
  "answeroption": "D",
  "explanation": "Number of equivalence classes is equal to the number of partitions of $A$. <br />...",
  "explanation_image": [],
  "is_options_image": false,
  "difficulty": "Hard",
  "is_diagram": false,
  "diagram": [],
  "created_at": "Thu, 05 Mar 2026 11:53:10 GMT",
  "updated_at": "Thu, 17 Sep 2026 11:32:41 GMT"
}
```

### Field meanings (Maths bank)

- `question` — the question text. Maths uses LaTeX (`$...$`) inside the string.
  `SA` / `CASESTUDY` questions embed multiple parts with `<br />` separators.
- `options` — an **object** keyed by option letter `"A"`/`"B"`/`"C"`/`"D"`.
- `answeroption` — the **correct option letter** (`"A"`–`"D"`). For VSA/SA/LA the
  correct choice letter is still present; the real answer lives in `explanation`.
- `explanation` — full worked solution (HTML `<br />` + LaTeX).
- `explanation_image` — array of S3 image URLs (sometimes has a diagram image).
- `difficulty` — `Easy` / `Medium` / `Hard`.
- `is_options_image` — `true` means the option text is actually an image URL.
- `is_diagram` / `diagram` — diagram images for the question.
- `subject` / `chapter` / `subtopic` — internal MongoDB ids (not human keys).
- `year`, `set_key`, `year_multiple` — previous-year-question tagging (maths).

## Physics questions (`questions/phy/...`) — test pools, NO answers served

Physics does not expose a question bank endpoint to students, so the dumped
physics questions are the pools the tests draw from. They carry `category`
(Bloom/JEE level) and `question_type` but **no `answeroption` / `explanation`**
(the server only returns them when a test is submitted).

```json
{
  "id": "68e7645f45abf21a49d9693b",
  "subject": "68cc04ec9e8dfa8163c0c559",
  "chapter": "68d1102328bf24ed03579fcf",
  "subtopic": "68d17bced43dc0846e4e0701",
  "question": "A physics experiment involves removing electrons from a neutral pith ball. If $5 \\times 10^{12}$ electrons are removed ...",
  "options": { "A": "$-8.0 \\times 10^{-7}$ C", "B": "+8.0e-7", "C": "...", "D": "..." },
  "question_type": "SA",
  "category": "Applying",
  "imageurl": null
}
```

- `category` — the test category: `Remembering`, `Understanding`, `Applying`,
  `Analysing, Evaluating, Creating`, or `JEE`. In the files under
  `questions/phy/.../categorytest/` this same value is repeated in a `categories`
  array (added by the dump for easy filtering).
- `imageurl` — optional image for the question stem.

## Maths adaptive test questions (`tests/math/.../maths_adaptive/`)

Same shape as the bank but **no answer/explanation**; adds `difficulty` and
`test_type` (`"Initial"` = first attempt). The question set returned for the
"new user" flow of the Maths Adaptive test:

```json
{
  "id": "69a96ea6d8e9ca3b29345785",
  "subject": "...", "chapter": "...", "subtopic": "...",
  "question_type": "MCQ",
  "question": "Which of the following is a symmetric relation on $A = \\{1, 2\\}$?",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "difficulty": "Easy",
  "test_type": "Initial"
}
```

## Test metadata files

Each chapter folder has small JSON files describing the tests available:

- `adaptive_category.json` (physics) / `maths_adaptive_category.json` (maths):
  ```json
  {
    "user_id": "69ef2c9f7a5a880d8764b508",
    "subject": "68cc04ec9e8dfa8163c0c559",
    "chapter": "...",
    "subtopic": "...",
    "category": "Remembering",   // physics only
    "difficulty": null,          // maths: Easy/Medium/Hard or null
    "has_test": false,           // whether the user has taken a test yet
    "latest_test": null          // detail of the most recent attempt
  }
  ```
- `*_history.json` — list of past test attempts (empty `[]` for accounts that
  have not taken that test).

## Notes

- Maths bank total: **5658 questions** (MCQ, VSA, SA, LA, AR, CASESTUDY) —
  the only source that includes answers/explanations.
- Physics questions available to this account: ~2200 (category-test MCQs across
  the 5 categories + VSA initial/adaptive pools). Answers are not served for
  these by the platform.
- Every question file is named after the question id from the API. Files with
  the same id across categories are deduplicated.
- LaTeX/MathML is embedded as plain text (`$...$`, `\\frac`, etc.) — render with
  KaTeX/MathJax to display properly.
- Where a question is a diagram (`is_diagram: true` / `imageurl`), the image is
  referenced by URL in the JSON; images were not bulk-downloaded.