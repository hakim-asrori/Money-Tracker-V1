<?php

namespace App\Facades;

use Illuminate\Http\JsonResponse;

class MessageFixer extends JsonResponse
{
    public static function render(
        $code = self::HTTP_OK,
        $messages = "",
        $data = null,
        $pagination = null
    ): JsonResponse {
        $response = [
            "code" => $code,
            "messages" => $messages
        ];

        if ($data || (is_array($data))) {
            $response["data"] = $data;
            // $response["data"] = Helper::encryptApiResponse($data);
        }

        if ($pagination) {
            $response["pagination"] = $pagination;
        }

        return response()->json($response, $code);
    }

    public static function success(
        $messages = "",
        $data = null
    ): JsonResponse {
        return self::render(
            code: self::HTTP_OK,
            messages: $messages,
            data: $data
        );
    }

    public static function paginate(
        $messages = "",
        $data
    ): JsonResponse {
        return self::render(
            code: self::HTTP_OK,
            messages: $messages,
            data: $data->items(),
            pagination: [
                "current_page" => $data->currentPage(),
                "last_page" => $data->lastPage(),
                "total" => $data->total(),
                "from" => $data->firstItem(),
                "to" => $data->lastItem(),
            ]
        );
    }

    public static function create(
        $messages = "Data has been created!",
        $data = null
    ): JsonResponse {
        return self::render(
            code: self::HTTP_CREATED,
            messages: $messages,
            data: $data
        );
    }

    public static function unauhtorize(
        $messages = "Unauthorized!"
    ): JsonResponse {
        return self::render(
            code: self::HTTP_UNAUTHORIZED,
            messages: $messages
        );
    }

    public static function warning(
        $messages = ""
    ): JsonResponse {
        return self::render(
            code: self::HTTP_BAD_REQUEST,
            messages: $messages
        );
    }

    public static function notFound(
        $messages = "Data not found!"
    ): JsonResponse {
        return self::render(
            code: self::HTTP_NOT_FOUND,
            messages: $messages
        );
    }

    public static function validator(
        $messages = "Fill data correctly!",
        $data = [],
        $isList = false
    ): JsonResponse {
        if ($isList && count($data) > 1) {
            $messages = $messages . ' (' . (count($data) - 1) . ' more)';
        }

        return self::render(
            code: self::HTTP_UNPROCESSABLE_ENTITY,
            messages: $messages,
            data: $data
        );
    }

    public static function error(
        $messages = "Something went Wrong!"
    ): JsonResponse {
        return self::render(
            code: self::HTTP_INTERNAL_SERVER_ERROR,
            messages: $messages
        );
    }
}
