<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Product;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Retrieve ALL settings (Store Info, Toggles, Categories)
     * merged into a single JSON object for the frontend.
     */
    public function index()
    {
        // 1. Fetch Store Info (with defaults)
        $storeInfo = Setting::firstOrCreate(
            ['key' => 'store_info'],
            ['value' => [
                'name' => 'Happy Cart', 
                'currency' => 'PHP', 
                'shippingFee' => 150,
                'email' => 'admin@happycart.com',
                'freeShippingThreshold' => 5000,
                'taxRate' => 12
            ]]
        );

        // 2. Fetch System Toggles (with defaults)
        // This is where maintenanceMode is stored!
        $toggles = Setting::firstOrCreate(
            ['key' => 'system_toggles'],
            ['value' => [
                'maintenanceMode' => false,
                'allowRegistration' => true,
                'enableReviews' => true
            ]]
        );

        // 3. Fetch Categories (with defaults)
        $categories = Setting::firstOrCreate(
            ['key' => 'categories'],
            ['value' => ['Clothing', 'Shoes', 'Accessories']]
        );

        // 4. Merge all values into one flat array
        // The frontend receives: { name: "...", maintenanceMode: true, categories: [...] }
        $mergedSettings = array_merge(
            $storeInfo->value ?? [], 
            $toggles->value ?? [],
            ['categories' => $categories->value]
        );

        return response()->json($mergedSettings);
    }

    /**
     * Update settings dynamically based on the input keys.
     */
    public function update(Request $request)
    {
        $input = $request->all();

        // ====================================================
        // SCENARIO 1: UPDATING CATEGORIES
        // ====================================================
        // This was the part failing. We now handle it explicitly.
        if ($request->has('categories')) {
            
            // 1. Find the specific row for categories (or create it if missing)
            $setting = Setting::firstOrNew(['key' => 'categories']);
            
            // 2. Explicitly set the value (The Model's $casts will handle JSON encoding)
            // We verify it is an array to prevent errors
            $cats = $request->input('categories');
            $setting->value = is_array($cats) ? $cats : [];
            
            // 3. Force Save
            $setting->save();

            return response()->json([
                'message' => 'Categories saved successfully', 
                'data' => $setting->value
            ]);
        }

        // ====================================================
        // SCENARIO 2: UPDATING SYSTEM TOGGLES
        // ====================================================
        if (isset($input['maintenanceMode']) || isset($input['allowRegistration']) || isset($input['enableReviews'])) {
            
            $setting = Setting::firstOrCreate(['key' => 'system_toggles']);
            
            $currentData = $setting->value ?? [];
            if (!is_array($currentData)) $currentData = [];
            
            if (isset($input['maintenanceMode'])) $currentData['maintenanceMode'] = (bool) $input['maintenanceMode'];
            if (isset($input['allowRegistration'])) $currentData['allowRegistration'] = (bool) $input['allowRegistration'];
            if (isset($input['enableReviews'])) $currentData['enableReviews'] = (bool) $input['enableReviews'];

            $setting->value = $currentData;
            $setting->save();

            return response()->json(['message' => 'Toggles updated', 'data' => $setting->value]);
        }

        // ====================================================
        // SCENARIO 3: UPDATING STORE INFO (Fallback)
        // ====================================================
        $setting = Setting::firstOrCreate(['key' => 'store_info']);
        
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email',
            'currency' => 'sometimes|string',
            'shippingFee' => 'sometimes|numeric',
            'freeShippingThreshold' => 'sometimes|numeric',
            'taxRate' => 'sometimes|numeric',
        ]);

        $currentData = $setting->value ?? [];
        $newData = array_merge($currentData, $validated);

        $setting->value = $newData;
        $setting->save();

        return response()->json(['message' => 'Store info updated', 'data' => $setting->value]);
    }

    /**
     * Delete a specific category safely.
     */
    public function deleteCategory(Request $request)
    {
        $categoryToDelete = $request->input('category');

        // 1. SECURITY CHECK: Are there products using this category?
        $count = Product::where('category', $categoryToDelete)->count();

        if ($count > 0) {
            return response()->json([
                'message' => "Cannot delete category '{$categoryToDelete}'. There are {$count} products assigned to it."
            ], 409); // 409 Conflict
        }

        // 2. RETRIEVE SETTINGS
        $setting = Setting::where('key', 'categories')->first();
        
        if (!$setting) {
            return response()->json(['message' => 'Settings not found'], 404);
        }

        // 3. REMOVE FROM ARRAY
        $currentCategories = $setting->value ?? [];
        
        // Filter out the category
        $updatedCategories = array_values(array_filter($currentCategories, function($cat) use ($categoryToDelete) {
            return $cat !== $categoryToDelete;
        }));

        // 4. SAVE
        $setting->value = $updatedCategories;
        $setting->save();

        return response()->json([
            'message' => 'Category deleted successfully',
            'data' => $updatedCategories
        ]);
    }

}