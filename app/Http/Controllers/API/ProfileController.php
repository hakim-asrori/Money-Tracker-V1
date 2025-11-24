<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Hash, Validator};
use Illuminate\Validation\Rule;
use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\User;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            "name" => "required|string|min:3|max:100",
            "email" => [
                "required",
                "email",
                Rule::unique("users", "email")->ignore($user->id),
            ],
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        DB::beginTransaction();

        try {
            User::where("id", $user->id)->update([
                "name" => $request->name,
                "email" => $request->email
            ]);

            DB::commit();
            return MessageFixer::success("Profile updated successfully");
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "old_password" => "required|min:8|max:100",
            "new_password" => "required|min:8|max:100",
            "confirm_password" => "required|min:8|max:100|same:new_password",
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        $user = $request->user();

        if (!password_verify($request->old_password, $user->password)) {
            return MessageFixer::error("Password doesn't match");
        }

        DB::beginTransaction();

        try {
            User::where("id", $user->id)->update([
                "password" => Hash::make($request->new_password)
            ]);

            DB::commit();
            return MessageFixer::success("Password changed successfully");
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }
}
