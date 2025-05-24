<?php

namespace App\Http\Controllers;

use App\Models\UserImages;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function UpdateImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png',
            'id' => 'required|integer'
        ]);
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png',
            'id' => 'required|integer'
        ]);
        $message = 'Unable to save image';
        $status = 2;
        if ($request->hasFile('image')) {
            $image = UserImages::findOrFail($request->id);
            if ($image) {
                $file = $request->file('image');
                $request->image->move(public_path('images'), $image->image_name);       
            }
            return response()->json(['status' => 1 ,'message' => 'Image successfully updated, just refresh the page.'], 200);
        }
         return response()->json(['status' => 2 ,'message' => 'No image uploaded'], 422);
    }
}
