<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        return Inertia::render('chat/chat-support', []);
    }
    public function store(Request $request)
    {
        $arr = [
            'user_id' => Auth::user()->id,
            'receiver_id' => $request->receiver_id, // optional if 1:1 only
            'message' => $request->message,
            'sender' => $request->sender,
        ];

        $request->validate(['message' => 'required|string']);

        $chat = Chat::create($arr);

        return response()->json($chat);
    }

    public function fetch()
    {
        return Chat::where('user_id', Auth::user()->id)
            ->orWhere('receiver_id', Auth::user()->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function adminFetch()
    {
        // Fetch all users who have chatted
        $users = User::whereHas('chats')->get();

        $grouped = [];

        foreach ($users as $user) {
            $grouped[] = [
                'user' => $user,
                'messages' => Chat::where('user_id', $user->id)
                    ->orWhere('receiver_id', $user->id)
                    ->orderBy('created_at')
                    ->get()
            ];
        }

        return response()->json($grouped);
    }
}
