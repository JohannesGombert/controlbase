import { getFreshConnection, json, milliToMinutes, pagedWhoopFetch, requireUser, whoopFetch } from './whoop-utils.mjs'

function dateFromWhoop(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
}

function zoneMinutes(zones, key) {
  return milliToMinutes(zones?.[key])
}

export async function handler(event) {
  const startedAt = new Date().toISOString()
  let logId = null
  let userId = null
  try {
    const { supabase, user } = await requireUser(event)
    userId = user.id
    const { data: log } = await supabase.from('whoop_sync_log').insert({ status: 'running', sync_type: 'manual', user_id: user.id }).select().single()
    logId = log?.id ?? null
    const connection = await getFreshConnection(supabase, user.id)
    const end = new Date()
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000)
    const params = { end: end.toISOString(), start: start.toISOString() }

    const [profile, cycles, recoveries, sleeps, workouts] = await Promise.all([
      whoopFetch('/developer/v2/user/profile/basic', connection.access_token),
      pagedWhoopFetch('/developer/v2/cycle', connection.access_token, params),
      pagedWhoopFetch('/developer/v2/recovery', connection.access_token, params),
      pagedWhoopFetch('/developer/v2/activity/sleep', connection.access_token, params),
      pagedWhoopFetch('/developer/v2/activity/workout', connection.access_token, params),
    ])

    const recoveryByCycle = new Map(recoveries.map((item) => [String(item.cycle_id), item]))
    const sleepByCycle = new Map(sleeps.filter((item) => !item.nap).map((item) => [String(item.cycle_id), item]))
    const dailyRows = cycles.map((cycle) => {
      const recovery = recoveryByCycle.get(String(cycle.id))
      const sleep = sleepByCycle.get(String(cycle.id))
      const sleepSummary = sleep?.score?.stage_summary ?? {}
      return {
        cycle_average_heart_rate: cycle.score?.average_heart_rate ?? null,
        cycle_id: String(cycle.id),
        cycle_kilojoule: cycle.score?.kilojoule ?? null,
        cycle_max_heart_rate: cycle.score?.max_heart_rate ?? null,
        date: dateFromWhoop(cycle.start),
        day_strain: cycle.score?.strain ?? null,
        hrv_rmssd_milli: recovery?.score?.hrv_rmssd_milli ?? null,
        raw_cycle: cycle,
        raw_recovery: recovery ?? null,
        raw_sleep: sleep ?? null,
        recovery_score: recovery?.score?.recovery_score ?? null,
        respiratory_rate: sleep?.score?.respiratory_rate ?? null,
        resting_heart_rate: recovery?.score?.resting_heart_rate ?? null,
        score_state: recovery?.score_state ?? cycle.score_state ?? sleep?.score_state ?? null,
        skin_temp_celsius: recovery?.score?.skin_temp_celsius ?? null,
        sleep_consistency_percentage: sleep?.score?.sleep_consistency_percentage ?? null,
        sleep_disturbance_count: sleepSummary.disturbance_count ?? null,
        sleep_efficiency_percentage: sleep?.score?.sleep_efficiency_percentage ?? null,
        sleep_id: sleep?.id ?? recovery?.sleep_id ?? null,
        sleep_performance_percentage: sleep?.score?.sleep_performance_percentage ?? null,
        spo2_percentage: recovery?.score?.spo2_percentage ?? null,
        total_awake_minutes: milliToMinutes(sleepSummary.total_awake_time_milli),
        total_in_bed_minutes: milliToMinutes(sleepSummary.total_in_bed_time_milli),
        total_light_sleep_minutes: milliToMinutes(sleepSummary.total_light_sleep_time_milli),
        total_rem_sleep_minutes: milliToMinutes(sleepSummary.total_rem_sleep_time_milli),
        total_slow_wave_sleep_minutes: milliToMinutes(sleepSummary.total_slow_wave_sleep_time_milli),
        user_id: user.id,
        whoop_updated_at: cycle.updated_at ?? recovery?.updated_at ?? sleep?.updated_at ?? null,
      }
    })

    const workoutRows = workouts.map((workout) => {
      const zones = workout.score?.zone_durations ?? {}
      return {
        altitude_gain_meter: workout.score?.altitude_gain_meter ?? null,
        average_heart_rate: workout.score?.average_heart_rate ?? null,
        distance_meter: workout.score?.distance_meter ?? null,
        end_time: workout.end ?? null,
        kilojoule: workout.score?.kilojoule ?? null,
        max_heart_rate: workout.score?.max_heart_rate ?? null,
        raw_workout: workout,
        score_state: workout.score_state ?? null,
        sport_id: workout.sport_id ?? null,
        start_time: workout.start ?? null,
        strain: workout.score?.strain ?? null,
        user_id: user.id,
        whoop_updated_at: workout.updated_at ?? null,
        whoop_workout_id: String(workout.id),
        zone_five_minutes: zoneMinutes(zones, 'zone_five_milli'),
        zone_four_minutes: zoneMinutes(zones, 'zone_four_milli'),
        zone_one_minutes: zoneMinutes(zones, 'zone_one_milli'),
        zone_three_minutes: zoneMinutes(zones, 'zone_three_milli'),
        zone_two_minutes: zoneMinutes(zones, 'zone_two_milli'),
        zone_zero_minutes: zoneMinutes(zones, 'zone_zero_milli'),
      }
    })

    if (dailyRows.length) {
      const { error } = await supabase.from('whoop_daily_metrics').upsert(dailyRows, { onConflict: 'user_id,date' })
      if (error) throw error
    }
    if (workoutRows.length) {
      const { error } = await supabase.from('whoop_workouts').upsert(workoutRows, { onConflict: 'user_id,whoop_workout_id' })
      if (error) throw error
    }

    const records = dailyRows.length + workoutRows.length
    await supabase
      .from('whoop_connections')
      .update({ last_sync_at: new Date().toISOString(), status: 'connected', whoop_user_id: profile?.user_id ?? connection.whoop_user_id })
      .eq('user_id', user.id)
    if (logId) {
      await supabase.from('whoop_sync_log').update({ finished_at: new Date().toISOString(), records_upserted: records, status: 'success' }).eq('id', logId)
    }
    return json(200, { daily: dailyRows.length, startedAt, workouts: workoutRows.length })
  } catch (error) {
    try {
      const { supabase } = await requireUser(event)
      if (logId) {
        await supabase
          .from('whoop_sync_log')
          .update({ error_message: error instanceof Error ? error.message : 'WHOOP Sync fehlgeschlagen', finished_at: new Date().toISOString(), status: 'error' })
          .eq('id', logId)
      } else if (userId) {
        await supabase.from('whoop_sync_log').insert({
          error_message: error instanceof Error ? error.message : 'WHOOP Sync fehlgeschlagen',
          finished_at: new Date().toISOString(),
          started_at: startedAt,
          status: 'error',
          sync_type: 'manual',
          user_id: userId,
        })
      }
    } catch {
      // Best effort logging only.
    }
    return json(400, { error: error instanceof Error ? error.message : 'WHOOP Sync fehlgeschlagen.' })
  }
}
