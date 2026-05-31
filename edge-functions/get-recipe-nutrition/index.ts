// ============================================================
// Edge Function: get-recipe-nutrition
// Tujuan: Ambil info nutrisi sebuah resep dari USDA FoodData
//         Central API, hitung total, simpan ke tabel
//         nutrition_info di Supabase.
//
// Endpoint: POST /functions/v1/get-recipe-nutrition
// Body: { "recipe_id": <int> }
// ============================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ----------------------------------------------------------
    // STEP 1: Ambil recipe_id dari request
    // ----------------------------------------------------------
    const { recipe_id } = await req.json()

    if (!recipe_id) {
      return new Response(
        JSON.stringify({ error: 'recipe_id wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ----------------------------------------------------------
    // STEP 2: Siapkan koneksi ke Supabase
    // ----------------------------------------------------------
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ----------------------------------------------------------
    // STEP 3: Ambil bahan-bahan resep dari database
    // ----------------------------------------------------------
    const { data: ingredients, error: dbError } = await supabase
      .from('recipe_ingredients')
      .select(`
        quantity,
        unit,
        ingredients (
          name,
          usda_food_id
        )
      `)
      .eq('recipe_id', recipe_id)

    if (dbError) {
      return new Response(
        JSON.stringify({ error: 'Gagal ambil data resep', detail: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Resep tidak ditemukan atau tidak punya bahan' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ----------------------------------------------------------
    // STEP 4: Tanya USDA untuk tiap bahan, jumlahkan nutrisinya
    // ----------------------------------------------------------
    const USDA_API_KEY = Deno.env.get('USDA_API_KEY')
    if (!USDA_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'USDA API key belum di-set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let totalCalories = 0
    let totalCarbs = 0
    let totalProtein = 0
    let totalFat = 0
    let totalFiber = 0
    let totalSugar = 0
    let totalSodium = 0

    const failedIngredients: string[] = []
    const debugLog: any[] = []

    for (const item of ingredients) {
      // @ts-ignore
      const ingredient = item.ingredients
      const fdcId = ingredient?.usda_food_id
      const ingredientName = ingredient?.name ?? 'unknown'

      if (!fdcId) {
        failedIngredients.push(`${ingredientName} (tidak ada fdcId)`)
        continue
      }

      try {
        const usdaUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`
        const usdaRes = await fetch(usdaUrl)

        if (!usdaRes.ok) {
          failedIngredients.push(`${ingredientName} (USDA error ${usdaRes.status})`)
          continue
        }

        const food = await usdaRes.json()

        // USDA kasih nilai per 100 gram, kita kalikan sesuai quantity
        const factor = (item.quantity ?? 100) / 100

        // Struktur USDA: foodNutrients: [{ nutrient: { name, unitName }, amount }]
        const nutrients = food.foodNutrients ?? []
        let foundCount = 0

        for (const n of nutrients) {
          const name = (n.nutrient?.name ?? '').toLowerCase()
          const unit = (n.nutrient?.unitName ?? '').toLowerCase()
          const amount = (n.amount ?? 0) * factor

          // Ambil Energy yang KCAL saja (USDA juga punya kJ)
          if (name === 'energy' && unit === 'kcal') {
            totalCalories += amount
            foundCount++
          } else if (name === 'protein') {
            totalProtein += amount
            foundCount++
          } else if (name === 'carbohydrate, by difference') {
            totalCarbs += amount
            foundCount++
          } else if (name === 'total lipid (fat)') {
            totalFat += amount
            foundCount++
          } else if (name === 'fiber, total dietary') {
            totalFiber += amount
            foundCount++
          } else if (name === 'total sugars' || name === 'sugars, total') {
            totalSugar += amount
            foundCount++
          } else if (name === 'sodium, na') {
            totalSodium += amount
            foundCount++
          }
        }

        debugLog.push({
          ingredient: ingredientName,
          fdcId: fdcId,
          quantity: item.quantity,
          factor: factor,
          nutrients_found: foundCount,
          total_nutrients_in_response: nutrients.length,
        })

        if (foundCount === 0) {
          failedIngredients.push(`${ingredientName} (0 nutrisi cocok)`)
        }
      } catch (err) {
        failedIngredients.push(`${ingredientName} (error: ${String(err)})`)
      }
    }

    // ----------------------------------------------------------
    // STEP 5: Simpan hasil ke nutrition_info (upsert)
    // ----------------------------------------------------------
    const nutritionData = {
      recipe_id: recipe_id,
      calories: Math.round(totalCalories * 100) / 100,
      carbohydrates_g: Math.round(totalCarbs * 100) / 100,
      protein_g: Math.round(totalProtein * 100) / 100,
      fat_g: Math.round(totalFat * 100) / 100,
      fiber_g: Math.round(totalFiber * 100) / 100,
      sugar_g: Math.round(totalSugar * 100) / 100,
      sodium_mg: Math.round(totalSodium * 100) / 100,
      data_source: 'USDA',
      last_updated: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from('nutrition_info')
      .upsert(nutritionData, { onConflict: 'recipe_id' })

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: 'Gagal simpan nutrisi', detail: upsertError.message, debug: debugLog }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ----------------------------------------------------------
    // STEP 6: Balas ke aplikasi
    // ----------------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        recipe_id: recipe_id,
        nutrition: nutritionData,
        failed_ingredients: failedIngredients,
        debug: debugLog,
        message: failedIngredients.length > 0
          ? `Berhasil sebagian, ${failedIngredients.length} bahan bermasalah`
          : 'Nutrisi berhasil dihitung dan disimpan',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
