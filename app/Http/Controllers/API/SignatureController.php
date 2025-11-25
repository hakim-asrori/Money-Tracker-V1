<?php

namespace App\Http\Controllers\API;

use App\Facades\MessageFixer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SignatureController extends Controller
{
    public function generateOpenssl(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'privateKey' => 'required|string',
        ]);

        if ($validator->fails()) {
            return MessageFixer::validator($validator->errors()->first(), $validator->errors(), true);
        }

        openssl_sign($request->content, $signature, $request->privateKey, OPENSSL_ALGO_SHA256);
        return MessageFixer::success("Signature generated successfully", [
            "signature" => base64_encode($signature)
        ]);
    }
}
