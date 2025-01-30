import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tttlokbnvaaohyeuiznx.supabase.co'
const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dGxva2JudmFhb2h5ZXVpem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDc2MjYsImV4cCI6MjA1Mzc4MzYyNn0.h3jEFZe22ScG_oWOif4clBKajSbEM21qu8H-EhN5bHI
const supabase = createClient(supabaseUrl, supabaseKey)