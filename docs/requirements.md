# Fitness App Requirements

## Stack
- React Native (TypeScript)
- Offline-first
- SQLite database

---

## Architecture Rules (MANDATORY)

1. Feature-based modular structure
2. No module may import another module directly
3. Allowed imports: `shared/`, `app/`, `database/`
4. Strict layering: Screen → Hook → Service → Repository → DB
5. Screens must NEVER call SQLite directly
6. No business logic inside UI components
7. All styles must be in `styles.ts` files
8. Shared reusable components go inside `shared/components`
9. Onboarding must not write to DB until completion
10. Logs must duplicate template values intentionally

---

## Project Structure (REQUIRED)

```
src/
  app/
  modules/
  shared/
  database/
```

### Inside `modules/<feature>/`:
```
screens/
components/
hooks/
services/
types.ts
styles.ts
```

### Database:
```
database/
  db.ts
  migrations.ts
  repositories/
    userRepo.ts
    mealRepo.ts
    mealTemplateRepo.ts
    workoutRepo.ts
    exerciseRepo.ts
```

---

## MVP Modules (LOCKED)

1. Onboarding (multi-step)
2. Dashboard
3. Meals
4. Workouts
5. Profile

---

## Onboarding Requirements

### Steps:
1. Welcome
2. Basic Info (name, age, gender)
3. Body Metrics (height, weight, units)
4. Activity Level + Goal
5. Summary (BMR + calorie suggestion)

### Rules:
- Store temporary state in hook
- Single DB write on completion
- Clean minimal UI

### `users` table:
| Column | Type |
|---|---|
| id | |
| name | |
| age | |
| gender | |
| height | |
| weight | |
| activityLevel | |
| goal | |
| unitPreference | |
| createdAt | |
| updatedAt | |

---

## Meals Module Requirements

### Entities:

#### `meal_templates`:
| Column | Type |
|---|---|
| id | |
| name | |
| calories | |
| protein | |
| carbs | |
| fat | |
| category | |
| isFavorite | |
| createdAt | |
| updatedAt | |

#### `meal_logs`:
| Column | Type |
|---|---|
| id | |
| templateId | nullable |
| name | |
| calories | |
| protein | |
| carbs | |
| fat | |
| category | |
| eatenAt | |
| createdAt | |
| updatedAt | |

### Features:
- Manual entry
- Choose saved template
- Save as reusable template
- Category: Breakfast / Lunch / Dinner / Snack
- Favorite toggle (templates only)
- Edit after adding
- Default eatenAt = current time (editable)

---

## Workouts Module Requirements

### Entities:

#### `exercise_templates`:
| Column | |
|---|---|
| id | |
| name | |
| type | 'strength' or 'cardio' |
| targetMuscle | |
| secondaryMuscle | optional |
| isFavorite | |
| createdAt | |
| updatedAt | |

#### `workout_templates`:
| Column | |
|---|---|
| id | |
| name | |
| description | |
| assignedWeekday | 0–6 |
| isFavorite | |
| createdAt | |
| updatedAt | |

#### `workout_template_exercises`:
| Column | |
|---|---|
| id | |
| workoutTemplateId | |
| exerciseTemplateId | |
| orderIndex | |
| defaultSets | |
| defaultReps | |
| defaultWeight | |
| defaultRestTimeSeconds | |

#### `workout_logs`:
| Column | |
|---|---|
| id | |
| workoutTemplateId | nullable |
| name | |
| startedAt | |
| endedAt | |
| durationSeconds | |
| notes | |
| createdAt | |

#### `exercise_logs`:
| Column | |
|---|---|
| id | |
| workoutLogId | |
| exerciseTemplateId | |
| orderIndex | |
| createdAt | |

#### `set_logs`:
| Column | |
|---|---|
| id | |
| exerciseLogId | |
| setNumber | |
| reps | |
| weight | |
| durationSeconds | |
| completed | |
| createdAt | |

### Features:
- Fixed weekly plan
- Reorder exercises
- Rest timer
- Favorite workouts
- Auto workout duration tracking
- Add extra sets dynamically
- Editing during workout affects only that session

---

## Deliverables

1. Full folder structure tree
2. SQLite schema creation SQL
3. Migration structure
4. Repository interfaces
5. Service layer structure
6. Example hook implementation
7. Example screen skeleton
8. Step-by-step implementation plan for MVP
