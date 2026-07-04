# Data Dictionary

## daily_checkins
Private daily behavior and health tracking.

- `date`: User's local date.
- `weight`: Body weight, numeric. Unit configured in app settings, default kg.
- `sleep_quality`: enum-like text: `bad`, `ok`, `good`.
- `steps`: integer, daily step count.
- `training_type`: text enum: `none`, `strength`, `tennis`, `walking`, `hiking`, `cardio`, `other`.
- `alcohol`: boolean.
- `cigarettes`: integer.
- `first_cigarette_time`: time.
- `food_quality`: enum-like text: `clean`, `medium`, `bad`.
- `expenses_over_50`: numeric sum in CHF.
- `top3_status`: enum-like text: `done`, `partial`, `missed`.
- `notes`: private note.

## daily_top3
Daily focus tasks.

- `business_task`: One key work task.
- `health_task`: One key health task.
- `private_task`: One key private/finance task.
- `*_done`: boolean completion.

## purchase_waitlist
Impulse purchase control.

- `price`: CHF by default.
- `created_date`: date when impulse was captured.
- `earliest_decision_date`: generated +7 days.
- `status`: `waiting`, `approved`, `rejected`, `postponed`.

## idea_parking
Idea backlog to prevent focus drift.

- `importance`: 1-5.
- `effort`: 1-5.
- `benefit`: 1-5.
- `status`: `parked`, `review`, `start`, `delete`, `done`.

## weekly_reviews
Reflection and planning.

- `week_start`: Monday.
- `week_end`: Sunday.
