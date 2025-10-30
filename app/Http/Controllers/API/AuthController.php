<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(
        protected User $user
    ) {}

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|min:3|max:100',
            'email' => 'required|email|min:3|max:150|unique:users,email',
            'password' => 'required|min:8|max:100',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), isList: true);
        }

        DB::beginTransaction();

        try {
            $user = $this->user->create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            DB::commit();
            return MessageFixer::success("Register success", $user);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|min:3|max:150',
            'password' => 'required|min:8|max:100',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), isList: true);
        }

        DB::beginTransaction();

        $user = $this->user->whereEmail($request->email);
        if (!$user) {
            return MessageFixer::warning("email or password wrong!");
        }

        if (!Hash::check($request->password, $user->password)) {
            return MessageFixer::warning("email or password wrong!");
        }

        try {
            $token = $user->createToken('api', ["authenticated"])->plainTextToken;

            DB::commit();

            return MessageFixer::success("Login success", [
                "token" => $token,
                "user" => $user
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return MessageFixer::error($th->getMessage());
        }
    }

    public function me(Request $request)
    {
        return MessageFixer::success("Success", $request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return MessageFixer::success("Logout success");
    }
}
