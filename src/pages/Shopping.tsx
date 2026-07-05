import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { ShoppingList } from '../components/ShoppingList'
import { loadWeekPlan, type WeekPlan } from '../services/nutrition'

export function Shopping(){const{user}=useAuth();const[plan,setPlan]=useState<WeekPlan|null>(null);const[error,setError]=useState('');useEffect(()=>{if(user)void loadWeekPlan(user.id,new Date()).then(setPlan).catch(()=>setError('Plan konnte nicht geladen werden.'))},[user]);return <><PageHeader eyebrow="Gesundheit & Ernährung" title="Wocheneinkauf" description="Ein Einkauf am Samstag, vorbereitet für Meal-Prep-Blöcke von zwei bis drei Tagen."/>{error&&<p className="mb-5 text-sm font-semibold text-status-danger">{error}</p>}{plan&&user?<ShoppingList plan={plan} userId={user.id}/>:<Panel><p className="py-12 text-center text-sm text-muted">Erstelle zuerst den Ernährungsplan für diese Woche.</p></Panel>}</>}
